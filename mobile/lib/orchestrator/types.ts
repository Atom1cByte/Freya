export type GuiTapAction = { type: 'gui_tap'; x: number; y: number };
export type GuiTypeAction = { type: 'gui_type'; text: string };
export type GuiSwipeAction = { type: 'gui_swipe'; from: { x: number; y: number }; to: { x: number; y: number } };
export type GuiLaunchAppAction = { type: 'gui_launch_app'; bundleId: string };
export type GuiFindAndTapAction = {
  type: 'gui_find_and_tap';
  using: 'accessibility_id' | 'label' | 'name';
  value: string;
};
export type GuiPressHomeAction = { type: 'gui_press_home' };
export type GuiWaitAction = { type: 'gui_wait'; ms: number };

export type CalendarListAction = { type: 'calendar_list'; range: 'today' | 'week' };
export type CalendarCreateAction = {
  type: 'calendar_create';
  title: string;
  startIso: string;
  endIso: string;
  location?: string;
  notes?: string;
};
export type CalendarUpdateAction = {
  type: 'calendar_update';
  id: string;
  title?: string;
  startIso?: string;
  endIso?: string;
  location?: string;
  notes?: string;
};
export type ReminderCreateAction = {
  type: 'reminder_create';
  title: string;
  dueIso?: string;
  notes?: string;
};
export type OpenUrlAction = { type: 'open_url'; url: string };
export type ComposeSmsAction = { type: 'compose_sms'; body: string; recipients?: string[] };
export type ComposeEmailAction = {
  type: 'compose_email';
  to: string;
  subject: string;
  body: string;
};
export type RunShortcutAction = { type: 'run_shortcut'; name: string; input?: string };
export type ScheduleNotificationAction = {
  type: 'schedule_notification';
  title: string;
  body: string;
  atIso: string;
};
export type AgentRunAction = {
  type: 'agent_run';
  goal: string;
  maxSteps?: number;
};

export type SystemAction =
  | GuiTapAction
  | GuiTypeAction
  | GuiSwipeAction
  | GuiLaunchAppAction
  | GuiFindAndTapAction
  | GuiPressHomeAction
  | GuiWaitAction
  | CalendarListAction
  | CalendarCreateAction
  | CalendarUpdateAction
  | ReminderCreateAction
  | OpenUrlAction
  | ComposeSmsAction
  | ComposeEmailAction
  | RunShortcutAction
  | ScheduleNotificationAction
  | AgentRunAction;

export type ActionResult = {
  action: SystemAction;
  ok: boolean;
  detail?: string;
};

export type OrchestratorPlan = {
  reply: string;
  actions: SystemAction[];
  requiresApproval: boolean;
  approval?: {
    type: 'send_email' | 'book_appointment' | 'reschedule_meeting' | 'send_message' | 'make_purchase';
    title: string;
    description: string;
    preview: string;
    actions: SystemAction[];
  };
};
