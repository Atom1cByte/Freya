import { requireNativeModule, Platform } from 'expo-modules-core';

export type CalendarEventRecord = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  notes?: string;
  calendarTitle?: string;
};

export type ReminderRecord = {
  id: string;
  title: string;
  dueDate?: string;
  completed: boolean;
};

type FreyaOrchestratorNative = {
  requestCalendarAccess(): Promise<boolean>;
  requestRemindersAccess(): Promise<boolean>;
  getEventsBetween(startIso: string, endIso: string): Promise<CalendarEventRecord[]>;
  createEvent(input: {
    title: string;
    startIso: string;
    endIso: string;
    location?: string;
    notes?: string;
  }): Promise<string>;
  updateEvent(input: {
    id: string;
    title?: string;
    startIso?: string;
    endIso?: string;
    location?: string;
    notes?: string;
  }): Promise<boolean>;
  createReminder(input: { title: string; dueIso?: string; notes?: string }): Promise<string>;
  openUrl(url: string): Promise<boolean>;
  openMessages(input: { body: string; recipients?: string[] }): Promise<boolean>;
  openPhone(number: string): Promise<boolean>;
  runShortcut(input: { name: string; input?: string }): Promise<boolean>;
  isAutomationAvailable(): Promise<{ shortcuts: boolean; calendar: boolean }>;
};

const NativeModule =
  Platform.OS === 'ios'
    ? requireNativeModule<FreyaOrchestratorNative>('FreyaOrchestrator')
    : null;

function unavailable<T>(fallback: T): Promise<T> {
  return Promise.resolve(fallback);
}

export const FreyaOrchestrator = {
  requestCalendarAccess(): Promise<boolean> {
    return NativeModule?.requestCalendarAccess() ?? unavailable(false);
  },

  requestRemindersAccess(): Promise<boolean> {
    return NativeModule?.requestRemindersAccess() ?? unavailable(false);
  },

  getEventsBetween(start: Date, end: Date): Promise<CalendarEventRecord[]> {
    return (
      NativeModule?.getEventsBetween(start.toISOString(), end.toISOString()) ??
      unavailable([])
    );
  },

  createEvent(input: {
    title: string;
    start: Date;
    end: Date;
    location?: string;
    notes?: string;
  }): Promise<string | null> {
    return (
      NativeModule
        ?.createEvent({
          title: input.title,
          startIso: input.start.toISOString(),
          endIso: input.end.toISOString(),
          location: input.location,
          notes: input.notes,
        })
        .catch(() => null) ?? unavailable(null)
    );
  },

  updateEvent(input: {
    id: string;
    title?: string;
    start?: Date;
    end?: Date;
    location?: string;
    notes?: string;
  }): Promise<boolean> {
    return (
      NativeModule
        ?.updateEvent({
          id: input.id,
          title: input.title,
          startIso: input.start?.toISOString(),
          endIso: input.end?.toISOString(),
          location: input.location,
          notes: input.notes,
        })
        .catch(() => false) ?? unavailable(false)
    );
  },

  createReminder(input: { title: string; due?: Date; notes?: string }): Promise<string | null> {
    return (
      NativeModule
        ?.createReminder({
          title: input.title,
          dueIso: input.due?.toISOString(),
          notes: input.notes,
        })
        .catch(() => null) ?? unavailable(null)
    );
  },

  openUrl(url: string): Promise<boolean> {
    return NativeModule?.openUrl(url) ?? unavailable(false);
  },

  openMessages(body: string, recipients?: string[]): Promise<boolean> {
    return (
      NativeModule?.openMessages({ body, recipients }) ??
      unavailable(false)
    );
  },

  openPhone(number: string): Promise<boolean> {
    return NativeModule?.openPhone(number) ?? unavailable(false);
  },

  runShortcut(name: string, input?: string): Promise<boolean> {
    return NativeModule?.runShortcut({ name, input }) ?? unavailable(false);
  },

  isAutomationAvailable(): Promise<{ shortcuts: boolean; calendar: boolean }> {
    return (
      NativeModule?.isAutomationAvailable() ??
      unavailable({ shortcuts: false, calendar: false })
    );
  },
};
