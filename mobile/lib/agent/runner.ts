import { findElement } from '@/lib/agent/screen';
import { planNextAgentStep } from '@/lib/agent/step-planner';
import type { AgentProgressCallback, AgentRunResult, AgentStep, AgentStepLog } from '@/lib/agent/types';
import {
  isWdaAvailable,
  wdaFindAndTap,
  wdaGetScreenState,
  wdaPressHome,
  wdaPressReturn,
  wdaSpotlightSearch,
  wdaSwipe,
  wdaTap,
  wdaType,
} from '@/lib/agent/wda-client';

const DEFAULT_MAX_STEPS = 30;

export async function runAgent(
  goal: string,
  options?: { maxSteps?: number; onProgress?: AgentProgressCallback }
): Promise<AgentRunResult> {
  if (!(await isWdaAvailable())) {
    return {
      success: false,
      summary: 'WebDriverAgent is not running. Start WDA on your iPhone (see Settings).',
      steps: [],
    };
  }

  const maxSteps = options?.maxSteps ?? DEFAULT_MAX_STEPS;
  const steps: AgentStepLog[] = [];
  const history: { step: AgentStep; detail: string }[] = [];

  for (let i = 0; i < maxSteps; i += 1) {
    let screen;
    try {
      screen = await wdaGetScreenState();
    } catch (error) {
      return {
        success: false,
        summary: error instanceof Error ? error.message : 'Failed to read screen',
        steps,
      };
    }

    const step = await planNextAgentStep({ goal, screen, history });
    const result = await executeAgentStep(step, screen);
    const log: AgentStepLog = { step: i + 1, stepAction: step, ok: result.ok, detail: result.detail };
    steps.push(log);
    options?.onProgress?.(log);
    history.push({ step, detail: result.detail });

    if (step.action === 'done') {
      return { success: result.ok, summary: step.summary, steps };
    }

    if (!result.ok) {
      return { success: false, summary: `Step ${i + 1} failed: ${result.detail}`, steps };
    }

    await sleep(step.action === 'wait' ? 0 : 450);
  }

  return {
    success: false,
    summary: `Stopped after ${maxSteps} steps — goal may be incomplete.`,
    steps,
  };
}

async function executeAgentStep(
  step: AgentStep,
  screen: Awaited<ReturnType<typeof wdaGetScreenState>>
): Promise<{ ok: boolean; detail: string }> {
  try {
    switch (step.action) {
      case 'done':
        return { ok: true, detail: step.summary };

      case 'tap':
        await wdaTap(step.x, step.y);
        return { ok: true, detail: `Tapped (${step.x}, ${step.y})${step.reason ? `: ${step.reason}` : ''}` };

      case 'tap_element': {
        const el = findElement(screen, {
          contains: step.contains,
          name: step.name,
          label: step.label,
        });
        if (el) {
          await wdaTap(el.centerX, el.centerY);
          return { ok: true, detail: `Tapped "${el.name ?? el.label ?? step.contains}"` };
        }
        if (step.name) {
          await wdaFindAndTap('name', step.name);
          return { ok: true, detail: `Tapped name="${step.name}"` };
        }
        if (step.label) {
          await wdaFindAndTap('label', step.label);
          return { ok: true, detail: `Tapped label="${step.label}"` };
        }
        return { ok: false, detail: `No element matching ${JSON.stringify(step)}` };
      }

      case 'type':
        await wdaType(step.text);
        return { ok: true, detail: `Typed "${step.text.slice(0, 40)}${step.text.length > 40 ? '…' : ''}"` };

      case 'swipe':
        await wdaSwipe(step.from, step.to);
        return { ok: true, detail: 'Swiped' };

      case 'home':
        await wdaPressHome();
        return { ok: true, detail: 'Pressed home' };

      case 'spotlight_search':
        await wdaSpotlightSearch(step.query);
        return { ok: true, detail: `Spotlight search: ${step.query}` };

      case 'wait':
        await sleep(step.ms);
        return { ok: true, detail: `Waited ${step.ms}ms` };

      case 'press_return':
        await wdaPressReturn();
        return { ok: true, detail: 'Pressed return' };

      default:
        return { ok: false, detail: 'Unknown step' };
    }
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : 'Step failed' };
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function formatAgentLog(steps: AgentStepLog[]): string {
  if (steps.length === 0) return 'No steps executed.';
  return steps.map((s) => `${s.ok ? '✓' : '✗'} ${s.detail}`).join('\n');
}
