import * as MailComposer from 'expo-mail-composer';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { FreyaOrchestrator } from 'freya-orchestrator';

import { formatAgentLog, runAgent } from '@/lib/agent/runner';
import type { ActionResult, SystemAction } from '@/lib/orchestrator/types';
import {
  isWdaAvailable,
  wdaFindAndTap,
  wdaLaunchApp,
  wdaPressHome,
  wdaSwipe,
  wdaTap,
  wdaType,
} from '@/lib/orchestrator/wda-client';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatTimeRange(startIso: string, endIso: string): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const fmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${fmt.format(start)}–${fmt.format(end)}`;
}

export async function executeAction(action: SystemAction): Promise<ActionResult> {
  try {
    switch (action.type) {
      case 'calendar_list': {
        const now = new Date();
        const start = startOfDay(now);
        const end = action.range === 'week' ? endOfDay(addDays(now, 7)) : endOfDay(now);
        await FreyaOrchestrator.requestCalendarAccess();
        const events = await FreyaOrchestrator.getEventsBetween(start, end);
        const lines =
          events.length === 0
            ? ['No calendar events in range.']
            : events.map(
                (e) =>
                  `• ${formatTimeRange(e.startDate, e.endDate)} — ${e.title}${e.location ? ` (${e.location})` : ''}`
              );
        return { action, ok: true, detail: lines.join('\n') };
      }

      case 'calendar_create': {
        await FreyaOrchestrator.requestCalendarAccess();
        const id = await FreyaOrchestrator.createEvent({
          title: action.title,
          start: new Date(action.startIso),
          end: new Date(action.endIso),
          location: action.location,
          notes: action.notes,
        });
        return {
          action,
          ok: Boolean(id),
          detail: id ? `Created calendar event ${id}` : 'Failed to create event',
        };
      }

      case 'calendar_update': {
        await FreyaOrchestrator.requestCalendarAccess();
        const ok = await FreyaOrchestrator.updateEvent({
          id: action.id,
          title: action.title,
          start: action.startIso ? new Date(action.startIso) : undefined,
          end: action.endIso ? new Date(action.endIso) : undefined,
          location: action.location,
          notes: action.notes,
        });
        return { action, ok, detail: ok ? 'Calendar event updated' : 'Update failed' };
      }

      case 'reminder_create': {
        await FreyaOrchestrator.requestRemindersAccess();
        const id = await FreyaOrchestrator.createReminder({
          title: action.title,
          due: action.dueIso ? new Date(action.dueIso) : undefined,
          notes: action.notes,
        });
        return { action, ok: Boolean(id), detail: id ? 'Reminder created' : 'Reminder failed' };
      }

      case 'open_url': {
        const ok = await FreyaOrchestrator.openUrl(action.url);
        return { action, ok, detail: ok ? `Opened ${action.url}` : 'Open URL failed' };
      }

      case 'compose_sms': {
        const ok = await FreyaOrchestrator.openMessages(action.body, action.recipients);
        return { action, ok, detail: ok ? 'Opened Messages with draft' : 'Messages open failed' };
      }

      case 'compose_email': {
        if (Platform.OS === 'ios' && (await MailComposer.isAvailableAsync())) {
          await MailComposer.composeAsync({
            recipients: [action.to],
            subject: action.subject,
            body: action.body,
          });
          return { action, ok: true, detail: 'Mail composer opened' };
        }
        const mailto = `mailto:${encodeURIComponent(action.to)}?subject=${encodeURIComponent(action.subject)}&body=${encodeURIComponent(action.body)}`;
        const ok = await FreyaOrchestrator.openUrl(mailto);
        return { action, ok, detail: ok ? 'Opened mail draft' : 'Mail open failed' };
      }

      case 'run_shortcut': {
        const ok = await FreyaOrchestrator.runShortcut(action.name, action.input);
        return { action, ok, detail: ok ? `Ran shortcut ${action.name}` : 'Shortcut failed' };
      }

      case 'agent_run': {
        const result = await runAgent(action.goal, { maxSteps: action.maxSteps ?? 30 });
        const log = formatAgentLog(result.steps);
        return {
          action,
          ok: result.success,
          detail: `${result.summary}\n\n${log}`,
        };
      }

      case 'schedule_notification': {
        await Notifications.scheduleNotificationAsync({
          content: { title: action.title, body: action.body },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(action.atIso) },
        });
        return { action, ok: true, detail: 'Notification scheduled' };
      }

      case 'gui_wait': {
        await new Promise((r) => setTimeout(r, action.ms));
        return { action, ok: true, detail: `Waited ${action.ms}ms` };
      }

      case 'gui_tap': {
        if (!(await isWdaAvailable())) {
          return { action, ok: false, detail: 'WDA not running — install WebDriverAgent on device' };
        }
        await wdaTap(action.x, action.y);
        return { action, ok: true, detail: `Tapped (${action.x}, ${action.y})` };
      }

      case 'gui_type': {
        if (!(await isWdaAvailable())) {
          return { action, ok: false, detail: 'WDA not running' };
        }
        await wdaType(action.text);
        return { action, ok: true, detail: `Typed ${action.text.length} chars` };
      }

      case 'gui_swipe': {
        if (!(await isWdaAvailable())) {
          return { action, ok: false, detail: 'WDA not running' };
        }
        await wdaSwipe(action.from, action.to);
        return { action, ok: true, detail: 'Swipe executed' };
      }

      case 'gui_launch_app': {
        if (!(await isWdaAvailable())) {
          return { action, ok: false, detail: 'WDA required to launch apps by bundle ID' };
        }
        await wdaLaunchApp(action.bundleId);
        return { action, ok: true, detail: `Launched ${action.bundleId} via WDA` };
      }

      case 'gui_find_and_tap': {
        if (!(await isWdaAvailable())) {
          return { action, ok: false, detail: 'WDA not running' };
        }
        const usingMap = {
          accessibility_id: 'accessibility id' as const,
          label: 'label' as const,
          name: 'name' as const,
        };
        await wdaFindAndTap(usingMap[action.using], action.value);
        return { action, ok: true, detail: `Tapped ${action.value}` };
      }

      case 'gui_press_home': {
        if (!(await isWdaAvailable())) {
          return { action, ok: false, detail: 'WDA not running' };
        }
        await wdaPressHome();
        return { action, ok: true, detail: 'Pressed home' };
      }

      default:
        return { action, ok: false, detail: 'Unknown action' };
    }
  } catch (error) {
    return {
      action,
      ok: false,
      detail: error instanceof Error ? error.message : 'Action failed',
    };
  }
}

export async function executeActions(actions: SystemAction[]): Promise<ActionResult[]> {
  const results: ActionResult[] = [];
  for (const action of actions) {
    results.push(await executeAction(action));
    if (action.type.startsWith('gui_') && action.type !== 'gui_wait') {
      await new Promise((r) => setTimeout(r, 350));
    }
  }
  return results;
}

export async function buildMorningBriefing(): Promise<string> {
  const now = new Date();
  await FreyaOrchestrator.requestCalendarAccess();
  const events = await FreyaOrchestrator.getEventsBetween(startOfDay(now), endOfDay(now));

  const lines: string[] = [];
  if (events.length === 0) {
    lines.push('• Calendar is clear today.');
  } else {
    for (const event of events.slice(0, 6)) {
      lines.push(
        `• ${formatTimeRange(event.startDate, event.endDate)} — ${event.title}${event.location ? ` · ${event.location}` : ''}`
      );
    }
  }

  lines.push('• Ask me to open any app or do anything on your phone — I use dynamic GUI automation.');
  return lines.join('\n');
}
