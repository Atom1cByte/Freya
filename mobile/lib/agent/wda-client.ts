import AsyncStorage from '@react-native-async-storage/async-storage';

import { parseAccessibilitySource } from '@/lib/agent/screen';
import type { ScreenState } from '@/lib/agent/types';

const WDA_BASE_KEY = 'freya.wda.baseUrl';
const DEFAULT_BASE = 'http://127.0.0.1:8100';

type WdaSession = { sessionId: string; baseUrl: string };
let activeSession: WdaSession | null = null;

export async function getWdaBaseUrl(): Promise<string> {
  const stored = await AsyncStorage.getItem(WDA_BASE_KEY);
  return stored ?? DEFAULT_BASE;
}

export async function setWdaBaseUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(WDA_BASE_KEY, url.replace(/\/$/, ''));
}

export function resetWdaSession(): void {
  activeSession = null;
}

async function wdaFetch(path: string, init?: RequestInit, timeoutMs = 12000): Promise<Response> {
  const baseUrl = activeSession?.baseUrl ?? (await getWdaBaseUrl());
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${baseUrl}${path}`, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function isWdaAvailable(): Promise<boolean> {
  try {
    const res = await wdaFetch('/status', undefined, 5000);
    if (!res.ok) return false;
    const json = (await res.json()) as { value?: { ready?: boolean } };
    return json.value?.ready === true;
  } catch {
    return false;
  }
}

async function ensureSession(): Promise<string> {
  if (activeSession?.sessionId) return activeSession.sessionId;
  const baseUrl = await getWdaBaseUrl();
  const res = await wdaFetch('/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      capabilities: {
        alwaysMatch: {
          platformName: 'iOS',
          'appium:automationName': 'XCUITest',
          'appium:shouldWaitForQuiescence': false,
          'appium:waitForIdleTimeout': 0,
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`WDA session failed (${res.status})`);
  const json = (await res.json()) as { sessionId?: string; value?: { sessionId?: string } };
  const sessionId = json.sessionId ?? json.value?.sessionId;
  if (!sessionId) throw new Error('WDA returned no session id');
  activeSession = { sessionId, baseUrl };
  return sessionId;
}

export async function wdaGetWindowSize(): Promise<{ width: number; height: number }> {
  const sessionId = await ensureSession();
  const res = await wdaFetch(`/session/${sessionId}/window/size`);
  if (!res.ok) throw new Error('window size failed');
  const json = (await res.json()) as { value?: { width?: number; height?: number } };
  return {
    width: json.value?.width ?? 390,
    height: json.value?.height ?? 844,
  };
}

export async function wdaGetScreenState(): Promise<ScreenState> {
  const sessionId = await ensureSession();
  const [sizeRes, sourceRes] = await Promise.all([
    wdaGetWindowSize(),
    wdaFetch(`/session/${sessionId}/source`),
  ]);
  if (!sourceRes.ok) throw new Error('page source failed');
  const sourceJson = (await sourceRes.json()) as { value?: string };
  const xml = sourceJson.value ?? '';
  return parseAccessibilitySource(xml, sizeRes.width, sizeRes.height);
}

export async function wdaTap(x: number, y: number): Promise<void> {
  const sessionId = await ensureSession();
  const res = await wdaFetch(`/session/${sessionId}/wda/tap/0`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x, y }),
  });
  if (!res.ok) throw new Error(`tap failed (${res.status})`);
}

export async function wdaType(text: string): Promise<void> {
  const sessionId = await ensureSession();
  const res = await wdaFetch(`/session/${sessionId}/wda/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: text.split('') }),
  });
  if (!res.ok) throw new Error(`type failed (${res.status})`);
}

export async function wdaPressReturn(): Promise<void> {
  const sessionId = await ensureSession();
  const res = await wdaFetch(`/session/${sessionId}/wda/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: ['\n'] }),
  });
  if (!res.ok) throw new Error('return key failed');
}

export async function wdaSwipe(
  from: { x: number; y: number },
  to: { x: number; y: number },
  duration = 0.35
): Promise<void> {
  const sessionId = await ensureSession();
  const res = await wdaFetch(`/session/${sessionId}/wda/dragfromtoforduration`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fromX: from.x,
      fromY: from.y,
      toX: to.x,
      toY: to.y,
      duration,
    }),
  });
  if (!res.ok) throw new Error(`swipe failed (${res.status})`);
}

export async function wdaPressHome(): Promise<void> {
  const sessionId = await ensureSession();
  const res = await wdaFetch(`/session/${sessionId}/wda/pressButton`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'home' }),
  });
  if (!res.ok) throw new Error('home failed');
}

export async function wdaLaunchApp(bundleId: string): Promise<void> {
  const sessionId = await ensureSession();
  const res = await wdaFetch(`/session/${sessionId}/wda/apps/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bundleId }),
  });
  if (!res.ok) throw new Error(`launch failed (${res.status})`);
}

export async function wdaScreenshot(): Promise<string | null> {
  try {
    const sessionId = await ensureSession();
    const res = await wdaFetch(`/session/${sessionId}/screenshot`);
    if (!res.ok) return null;
    const json = (await res.json()) as { value?: string };
    return json.value ?? null;
  } catch {
    return null;
  }
}

export async function wdaSpotlightSearch(query: string): Promise<void> {
  const { width, height } = await wdaGetWindowSize();
  await wdaPressHome();
  await sleep(500);
  await wdaSwipe(
    { x: Math.round(width / 2), y: Math.round(height * 0.35) },
    { x: Math.round(width / 2), y: Math.round(height * 0.75) }
  );
  await sleep(700);
  await wdaType(query);
  await sleep(900);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export async function wdaFindAndTap(
  using: 'accessibility id' | 'name' | 'label',
  value: string
): Promise<void> {
  const sessionId = await ensureSession();
  const findRes = await wdaFetch(`/session/${sessionId}/element`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ using, value }),
  });
  if (!findRes.ok) throw new Error(`element not found: ${value}`);
  const findJson = (await findRes.json()) as { value?: { ELEMENT?: string } };
  const elementId = findJson.value?.ELEMENT;
  if (!elementId) throw new Error(`element id missing for ${value}`);
  const clickRes = await wdaFetch(`/session/${sessionId}/element/${elementId}/click`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!clickRes.ok) throw new Error(`click failed (${clickRes.status})`);
}
