export type ScreenElement = {
  type: string;
  name?: string;
  label?: string;
  value?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

export type ScreenState = {
  width: number;
  height: number;
  elements: ScreenElement[];
  rawXmlLength: number;
};

export type AgentStep =
  | { action: 'done'; summary: string }
  | { action: 'tap'; x: number; y: number; reason?: string }
  | { action: 'tap_element'; contains?: string; name?: string; label?: string; reason?: string }
  | { action: 'type'; text: string; reason?: string }
  | { action: 'swipe'; from: { x: number; y: number }; to: { x: number; y: number }; reason?: string }
  | { action: 'home'; reason?: string }
  | { action: 'spotlight_search'; query: string; reason?: string }
  | { action: 'wait'; ms: number; reason?: string }
  | { action: 'press_return'; reason?: string };

export type AgentStepLog = {
  step: number;
  stepAction: AgentStep;
  ok: boolean;
  detail: string;
};

export type AgentRunResult = {
  success: boolean;
  summary: string;
  steps: AgentStepLog[];
};

export type AgentProgressCallback = (log: AgentStepLog) => void;
