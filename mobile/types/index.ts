import type { SystemAction } from '@/lib/orchestrator/types';

export type MessageRole = 'user' | 'assistant' | 'system';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type ApprovalType =
  | 'send_email'
  | 'book_appointment'
  | 'reschedule_meeting'
  | 'send_message'
  | 'make_purchase';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  approvalId?: string;
  pendingApproval?: boolean;
}

export interface ApprovalAction {
  id: string;
  type: ApprovalType;
  title: string;
  description: string;
  preview: string;
  status: ApprovalStatus;
  createdAt: Date;
  actions?: SystemAction[];
}

export interface BriefingItem {
  id: string;
  category: 'calendar' | 'inbox' | 'travel' | 'reminder';
  title: string;
  subtitle: string;
  time?: string;
  accent: string;
}

export interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  color: string;
}
