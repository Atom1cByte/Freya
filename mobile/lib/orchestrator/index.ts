import { createApprovalId, createId } from '@/lib/orchestrator/ids';
import { executeActions } from '@/lib/orchestrator/executor';
import { planUserRequest, summarizeResults } from '@/lib/orchestrator/planner';
import type { ApprovalAction, ChatMessage } from '@/types';

export { createId, createApprovalId };

export interface FreyaResponse {
  message: ChatMessage;
  approval?: Omit<ApprovalAction, 'id' | 'status' | 'createdAt'>;
}

function assistantMessage(content: string, extras?: Partial<ChatMessage>): ChatMessage {
  return {
    id: createId('msg'),
    role: 'assistant',
    content,
    timestamp: new Date(),
    ...extras,
  };
}

export async function processUserMessage(text: string): Promise<FreyaResponse> {
  const plan = await planUserRequest(text);
  const approvalId = plan.requiresApproval && plan.approval ? createApprovalId() : undefined;

  if (plan.requiresApproval && plan.approval && approvalId) {
    return {
      message: assistantMessage(plan.reply, { approvalId, pendingApproval: true }),
      approval: {
        type: plan.approval.type,
        title: plan.approval.title,
        description: plan.approval.description,
        preview: plan.approval.preview,
        actions: plan.approval.actions,
      },
    };
  }

  if (plan.actions.length > 0) {
    const results = await executeActions(plan.actions);
    const detail = summarizeResults(results.map((r) => r.detail ?? '').filter(Boolean));
    const content = plan.reply ? `${plan.reply}\n\n${detail}` : detail;
    return { message: assistantMessage(content) };
  }

  return { message: assistantMessage(plan.reply) };
}

export async function executeApproval(approval: ApprovalAction): Promise<string> {
  if (!approval.actions?.length) {
    return `Approved "${approval.title}" but no actions were attached.`;
  }
  const results = await executeActions(approval.actions);
  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    return `Ran with issues:\n${results.map((r) => `${r.ok ? '✓' : '✗'} ${r.detail}`).join('\n')}`;
  }
  return summarizeResults(results.map((r) => r.detail ?? '').filter(Boolean)) || 'Done.';
}

export function getApprovalCompletionMessage(type: ApprovalAction['type'], title: string): string {
  switch (type) {
    case 'send_email':
      return `Mail automation finished for "${title}". Review and tap Send in Mail.`;
    case 'send_message':
      return 'Messages draft opened. Tap Send when ready.';
    case 'book_appointment':
      return `"${title}" automation completed. Check Calendar and Shortcuts.`;
    case 'reschedule_meeting':
      return 'Calendar updated.';
    case 'make_purchase':
      return 'Purchase flow completed.';
    default:
      return 'Done.';
  }
}
