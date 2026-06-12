import Constants from 'expo-constants';

export function getOpenAiApiKey(): string | undefined {
  const fromEnv = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (fromEnv?.trim()) return fromEnv.trim();
  const extra = Constants.expoConfig?.extra as { openaiApiKey?: string } | undefined;
  return extra?.openaiApiKey?.trim() || undefined;
}

export function isSensitiveGoal(goal: string): boolean {
  const g = goal.toLowerCase();
  return /\b(send|email|message|text|buy|purchase|pay|order|delete|confirm payment|transfer)\b/.test(g);
}
