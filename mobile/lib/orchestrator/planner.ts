import { buildMorningBriefing } from '@/lib/orchestrator/executor';
import type { OrchestratorPlan, SystemAction } from '@/lib/orchestrator/types';
import { getOpenAiApiKey, isSensitiveGoal } from '@/lib/config';

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function isCalendarBriefing(text: string): boolean {
  const input = normalize(text);
  return (
    input.includes('what matters today') ||
    input.includes('morning briefing') ||
    input === 'brief me' ||
    input === 'briefing'
  );
}

function isCalendarApiTask(text: string): boolean {
  const input = normalize(text);
  return (
    input.includes('add to calendar') ||
    input.includes('schedule event') ||
    input.includes('create event')
  );
}

function planAgentTask(goal: string): OrchestratorPlan {
  const sensitive = isSensitiveGoal(goal);
  const hasLlm = Boolean(getOpenAiApiKey());

  const reply = hasLlm
    ? `I'll control your iPhone dynamically to: ${goal}`
    : `I'll attempt: ${goal}\n\nFor complex tasks (play a song, navigate apps), set EXPO_PUBLIC_OPENAI_API_KEY. Simple "open X" works via Spotlight heuristics.`;

  const agentAction: SystemAction = { type: 'agent_run', goal, maxSteps: 30 };

  if (sensitive) {
    return {
      reply: `${reply}\n\nThis may send messages or spend money — approve to run.`,
      actions: [],
      requiresApproval: true,
      approval: {
        type: 'send_message',
        title: `GUI agent: ${goal.slice(0, 60)}`,
        description: goal,
        preview: goal,
        actions: [agentAction],
      },
    };
  }

  return {
    reply,
    actions: [agentAction],
    requiresApproval: false,
  };
}

export async function planUserRequest(text: string): Promise<OrchestratorPlan> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { reply: 'Tell me what to do on your phone.', actions: [], requiresApproval: false };
  }

  if (isCalendarBriefing(trimmed)) {
    const briefing = await buildMorningBriefing();
    return {
      reply: `Here's your morning briefing from your real calendar:\n\n${briefing}`,
      actions: [{ type: 'calendar_list', range: 'today' }],
      requiresApproval: false,
    };
  }

  if (isCalendarApiTask(trimmed)) {
    return {
      reply: 'Use the GUI agent to schedule visually, or say e.g. "add meeting tomorrow at 3pm called Standup".',
      actions: [{ type: 'agent_run', goal: trimmed, maxSteps: 25 }],
      requiresApproval: false,
    };
  }

  return planAgentTask(trimmed);
}

export function summarizeResults(details: string[]): string {
  if (details.length === 0) return 'Done.';
  return details.join('\n');
}
