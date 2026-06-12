import Constants from 'expo-constants';

import { findElement, summarizeScreenForLlm } from '@/lib/agent/screen';
import { wdaScreenshot } from '@/lib/agent/wda-client';
import type { AgentStep, ScreenState } from '@/lib/agent/types';
import { getOpenAiApiKey } from '@/lib/config';

const STEP_SCHEMA = `Return JSON only:
{
  "action": "done" | "tap" | "tap_element" | "type" | "swipe" | "home" | "spotlight_search" | "wait" | "press_return",
  "summary": "string (required when action=done)",
  "x": number, "y": number,
  "contains": "string", "name": "string", "label": "string",
  "text": "string",
  "from": {"x": number, "y": number}, "to": {"x": number, "y": number},
  "query": "string",
  "ms": number,
  "reason": "string"
}

Rules:
- You control an iPhone via WebDriverAgent. No hardcoded apps — read the screen and act.
- To open ANY app: use spotlight_search with the app name, then tap_element on the result.
- To play content: open the app, find Search, type the query, tap the result, tap Play if needed.
- Prefer tap_element (contains/name/label) over raw coordinates.
- When the goal is complete, action=done with summary.
- One step at a time.`;

export async function planNextAgentStep(input: {
  goal: string;
  screen: ScreenState;
  history: { step: AgentStep; detail: string }[];
}): Promise<AgentStep> {
  const apiKey = getOpenAiApiKey();
  if (apiKey) {
    try {
      return await planWithLlm(input, apiKey);
    } catch {
      // fall through
    }
  }
  return planWithHeuristics(input);
}

async function planWithLlm(
  input: { goal: string; screen: ScreenState; history: { step: AgentStep; detail: string }[] },
  apiKey: string
): Promise<AgentStep> {
  const screenshot = await wdaScreenshot();
  const messages: object[] = [
    { role: 'system', content: `You are Freya, a dynamic iOS GUI agent. ${STEP_SCHEMA}` },
    {
      role: 'user',
      content: `Goal: ${input.goal}

Screen (${input.screen.width}x${input.screen.height}), ${input.screen.elements.length} elements:
${summarizeScreenForLlm(input.screen)}

History:
${input.history.slice(-8).map((h, i) => `${i + 1}. ${JSON.stringify(h.step)} → ${h.detail}`).join('\n') || '(none)'}`,
    },
  ];

  if (screenshot) {
    messages.push({
      role: 'user',
      content: [
        { type: 'text', text: 'Current screenshot:' },
        { type: 'image_url', image_url: { url: `data:image/png;base64,${screenshot}` } },
      ],
    });
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages,
    }),
  });

  if (!res.ok) throw new Error(`LLM planner failed (${res.status})`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty LLM response');
  return parseStepJson(JSON.parse(content) as Record<string, unknown>);
}

function planWithHeuristics(input: {
  goal: string;
  screen: ScreenState;
  history: { step: AgentStep; detail: string }[];
}): AgentStep {
  const goal = input.goal.toLowerCase();
  const history = input.history;

  if (history.length === 0) {
    const openMatch = goal.match(/(?:open|launch|start)\s+(.+?)(?:\s+and|\s*$)/i);
    const playOnMatch = goal.match(/play\s+.+?\s+(?:on|in)\s+(.+?)(?:\s+and|\s*$)/i);
    const appRaw = openMatch?.[1] ?? playOnMatch?.[1];
    if (appRaw) {
      const query = titleCase(appRaw.trim());
      return { action: 'spotlight_search', query, reason: `Open ${query}` };
    }
  }

  const lastSpotlight = [...history].reverse().find((h) => h.step.action === 'spotlight_search');
  if (lastSpotlight && lastSpotlight.step.action === 'spotlight_search') {
    const query = lastSpotlight.step.query;
    const token = query.split(' ')[0];
    const hit = findElement(input.screen, { contains: token });
    if (hit) {
      return { action: 'tap_element', contains: token, reason: 'Open from Spotlight' };
    }
    if (!history.some((h) => h.step.action === 'press_return')) {
      return { action: 'press_return', reason: 'Submit Spotlight search' };
    }
  }

  const playMatch = goal.match(/play\s+(.+?)(?:\s+on|\s+in|\s*$)/i);
  if (playMatch && history.length >= 2) {
    const query = playMatch[1].trim();
    const typed = history.some((h) => h.step.action === 'type' && h.step.text.toLowerCase().includes(query.slice(0, 6).toLowerCase()));

    if (!history.some((h) => h.detail.toLowerCase().includes('search'))) {
      const searchEl = findElement(input.screen, { contains: 'search' });
      if (searchEl) {
        return { action: 'tap_element', contains: 'search', reason: 'Open search' };
      }
    }

    if (!typed) {
      return { action: 'type', text: query, reason: 'Search for content' };
    }

    const result = findElement(input.screen, { contains: query.split(' ')[0] });
    if (result) {
      return { action: 'tap_element', contains: query.split(' ')[0], reason: 'Select result' };
    }

    const playBtn = findElement(input.screen, { contains: 'play' });
    if (playBtn) {
      return { action: 'tap_element', contains: 'play', reason: 'Tap play' };
    }

    return { action: 'press_return', reason: 'Submit search' };
  }

  if (history.length >= 18) {
    return { action: 'done', summary: 'Step limit in heuristic mode — add OPENAI_API_KEY for full dynamic control.' };
  }

  return {
    action: 'done',
    summary:
      'Heuristic mode is limited. Set EXPO_PUBLIC_OPENAI_API_KEY for dynamic multi-step control of any app.',
  };
}

function titleCase(raw: string): string {
  return raw.replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseStepJson(raw: Record<string, unknown>): AgentStep {
  const action = String(raw.action ?? 'done');
  const reason = raw.reason as string | undefined;

  switch (action) {
    case 'done':
      return { action: 'done', summary: String(raw.summary ?? 'Task complete') };
    case 'tap':
      return { action: 'tap', x: Number(raw.x), y: Number(raw.y), reason };
    case 'tap_element':
      return {
        action: 'tap_element',
        contains: raw.contains as string | undefined,
        name: raw.name as string | undefined,
        label: raw.label as string | undefined,
        reason,
      };
    case 'type':
      return { action: 'type', text: String(raw.text ?? ''), reason };
    case 'swipe':
      return {
        action: 'swipe',
        from: raw.from as { x: number; y: number },
        to: raw.to as { x: number; y: number },
        reason,
      };
    case 'home':
      return { action: 'home', reason };
    case 'spotlight_search':
      return { action: 'spotlight_search', query: String(raw.query ?? ''), reason };
    case 'wait':
      return { action: 'wait', ms: Number(raw.ms ?? 500), reason };
    case 'press_return':
      return { action: 'press_return', reason };
    default:
      return { action: 'done', summary: 'Unknown action from planner' };
  }
}
