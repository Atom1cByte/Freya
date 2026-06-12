import type { ScreenElement, ScreenState } from '@/lib/agent/types';

const ATTR = (xml: string, key: string): string | undefined => {
  const match = xml.match(new RegExp(`${key}="([^"]*)"`, 'i'));
  return match?.[1];
};

export function parseAccessibilitySource(xml: string, width: number, height: number): ScreenState {
  const elements: ScreenElement[] = [];
  const tagPattern = /<XCUIElementType[^>]+\/>|<XCUIElementType[^>]+>[\s\S]*?<\/XCUIElementType[^>]+>/g;
  const chunks = xml.match(tagPattern) ?? [];

  for (const chunk of chunks) {
    const x = Number(ATTR(chunk, 'x') ?? '0');
    const y = Number(ATTR(chunk, 'y') ?? '0');
    const w = Number(ATTR(chunk, 'w') ?? ATTR(chunk, 'width') ?? '0');
    const h = Number(ATTR(chunk, 'h') ?? ATTR(chunk, 'height') ?? '0');
    const name = ATTR(chunk, 'name');
    const label = ATTR(chunk, 'label');
    const value = ATTR(chunk, 'value');
    const typeMatch = chunk.match(/XCUIElementType(\w+)/);
    const type = typeMatch?.[1] ?? 'Unknown';

    if (w <= 0 || h <= 0) continue;
    if (x + w < 0 || y + h < 0 || x > width || y > height) continue;

    const visible = name || label || value;
    if (!visible && !chunk.includes('Button') && !chunk.includes('SearchField') && !chunk.includes('TextField')) {
      continue;
    }

    elements.push({
      type,
      name,
      label,
      value,
      x,
      y,
      width: w,
      height: h,
      centerX: Math.round(x + w / 2),
      centerY: Math.round(y + h / 2),
    });
  }

  return { width, height, elements, rawXmlLength: xml.length };
}

export function summarizeScreenForLlm(screen: ScreenState, maxElements = 40): string {
  const ranked = [...screen.elements]
    .filter((e) => e.name || e.label || e.value)
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .slice(0, maxElements);

  return JSON.stringify(
    ranked.map((e) => ({
      type: e.type,
      name: e.name,
      label: e.label,
      value: e.value?.slice(0, 80),
      tap: { x: e.centerX, y: e.centerY },
    })),
    null,
    0
  );
}

export function findElement(
  screen: ScreenState,
  query: { contains?: string; name?: string; label?: string }
): ScreenElement | undefined {
  const norm = (s?: string) => s?.toLowerCase().trim();
  const contains = norm(query.contains);
  const name = norm(query.name);
  const label = norm(query.label);

  return screen.elements.find((e) => {
    const en = norm(e.name);
    const el = norm(e.label);
    const ev = norm(e.value);
    if (name && en === name) return true;
    if (label && el === label) return true;
    if (contains && (en?.includes(contains) || el?.includes(contains) || ev?.includes(contains))) {
      return true;
    }
    return false;
  });
}
