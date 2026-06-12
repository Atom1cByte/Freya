import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FreyaOrchestrator } from 'freya-orchestrator';
import * as Notifications from 'expo-notifications';

import {
  createId,
  executeApproval,
  processUserMessage,
} from '@/lib/orchestrator';
import { isWdaAvailable } from '@/lib/agent/wda-client';
import type { ApprovalAction, BriefingItem, ChatMessage, QuickAction } from '@/types';
import { useCaseColors } from '@/constants/theme';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      'Freya controls your iPhone dynamically — any app, any task. I read the screen, tap, type, and swipe via WebDriverAgent. Say things like "open Spotify and play X" or "open Roblox". Set EXPO_PUBLIC_OPENAI_API_KEY for best results.',
    timestamp: new Date(),
  },
];

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'brief', label: 'Brief me', prompt: 'What matters today?', color: useCaseColors.inbox },
  { id: 'spotify', label: 'Play music', prompt: 'Open Spotify and play Blinding Lights', color: useCaseColors.meetings },
  { id: 'roblox', label: 'Open Roblox', prompt: 'Open Roblox', color: useCaseColors.errands },
  { id: 'any', label: 'Anything', prompt: 'Open Instagram', color: useCaseColors.travel },
];

interface FreyaContextValue {
  messages: ChatMessage[];
  approvals: ApprovalAction[];
  briefingItems: BriefingItem[];
  quickActions: QuickAction[];
  isTyping: boolean;
  wdaConnected: boolean;
  sendMessage: (text: string) => Promise<void>;
  approveAction: (id: string) => Promise<void>;
  rejectAction: (id: string) => void;
  refreshBriefing: () => Promise<void>;
  pendingApprovalCount: number;
}

const FreyaContext = createContext<FreyaContextValue | null>(null);

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
}

async function loadBriefingItems(): Promise<BriefingItem[]> {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  await FreyaOrchestrator.requestCalendarAccess();
  const events = await FreyaOrchestrator.getEventsBetween(start, end);

  const items: BriefingItem[] = events.slice(0, 5).map((event, index) => ({
    id: event.id,
    category: 'calendar' as const,
    title: event.title,
    subtitle: event.location ?? event.calendarTitle ?? 'Calendar',
    time: formatTime(event.startDate),
    accent: [useCaseColors.meetings, useCaseColors.inbox, useCaseColors.travel, useCaseColors.errands, useCaseColors.research][index % 5],
  }));

  if (items.length === 0) {
    items.push({
      id: 'empty',
      category: 'calendar',
      title: 'Calendar clear today',
      subtitle: 'Ask Freya to schedule something',
      accent: useCaseColors.meetings,
    });
  }

  items.push({
    id: 'agent',
    category: 'inbox',
    title: 'Ask Freya anything',
    subtitle: 'Open any app · play music · navigate UI',
    accent: useCaseColors.inbox,
  });

  return items;
}

export function FreyaProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [approvals, setApprovals] = useState<ApprovalAction[]>([]);
  const [briefingItems, setBriefingItems] = useState<BriefingItem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [wdaConnected, setWdaConnected] = useState(false);

  const refreshBriefing = useCallback(async () => {
    try {
      const items = await loadBriefingItems();
      setBriefingItems(items);
    } catch {
      setBriefingItems([
        {
          id: 'perm',
          category: 'calendar',
          title: 'Calendar access needed',
          subtitle: 'Grant permission in Settings → Freya',
          accent: useCaseColors.inbox,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    void refreshBriefing();
    void FreyaOrchestrator.requestCalendarAccess();
    void FreyaOrchestrator.requestRemindersAccess();
    void Notifications.requestPermissionsAsync();
    void isWdaAvailable().then(setWdaConnected);
  }, [refreshBriefing]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: createId('msg'),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await processUserMessage(trimmed);
      const assistantMsg = { ...response.message };

      if (response.approval && assistantMsg.approvalId) {
        const approval: ApprovalAction = {
          id: assistantMsg.approvalId,
          ...response.approval,
          status: 'pending',
          createdAt: new Date(),
        };
        setApprovals((prev) => [approval, ...prev]);
      }

      setMessages((prev) => [...prev, assistantMsg]);
      await refreshBriefing();
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: createId('msg'),
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Something went wrong running that action.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [refreshBriefing]);

  const approveAction = useCallback(async (id: string) => {
    const action = approvals.find((a) => a.id === id);
    if (!action) return;

    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'approved' as const } : a))
    );
    setMessages((prev) =>
      prev.map((m) => (m.approvalId === id ? { ...m, pendingApproval: false } : m))
    );

    try {
      const result = await executeApproval(action);
      setMessages((prev) => [
        ...prev,
        {
          id: createId('msg'),
          role: 'assistant',
          content: result,
          timestamp: new Date(),
        },
      ]);
      await refreshBriefing();
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: createId('msg'),
          role: 'assistant',
          content: error instanceof Error ? error.message : 'Approval execution failed.',
          timestamp: new Date(),
        },
      ]);
    }
  }, [approvals, refreshBriefing]);

  const rejectAction = useCallback((id: string) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'rejected' as const } : a))
    );
    setMessages((prev) =>
      prev.map((m) => (m.approvalId === id ? { ...m, pendingApproval: false } : m))
    );
    setMessages((prev) => [
      ...prev,
      {
        id: createId('msg'),
        role: 'assistant',
        content: 'Cancelled. No actions were run.',
        timestamp: new Date(),
      },
    ]);
  }, []);

  const pendingApprovalCount = useMemo(
    () => approvals.filter((a) => a.status === 'pending').length,
    [approvals]
  );

  const value = useMemo(
    () => ({
      messages,
      approvals,
      briefingItems,
      quickActions: QUICK_ACTIONS,
      isTyping,
      wdaConnected,
      sendMessage,
      approveAction,
      rejectAction,
      refreshBriefing,
      pendingApprovalCount,
    }),
    [
      messages,
      approvals,
      briefingItems,
      isTyping,
      wdaConnected,
      sendMessage,
      approveAction,
      rejectAction,
      refreshBriefing,
      pendingApprovalCount,
    ]
  );

  return <FreyaContext.Provider value={value}>{children}</FreyaContext.Provider>;
}

export function useFreya() {
  const ctx = useContext(FreyaContext);
  if (!ctx) throw new Error('useFreya must be used within FreyaProvider');
  return ctx;
}
