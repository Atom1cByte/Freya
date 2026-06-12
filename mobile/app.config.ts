import type { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  ios: {
    ...config.ios,
    ...(process.env.EXPO_APPLE_TEAM_ID
      ? { appleTeamId: process.env.EXPO_APPLE_TEAM_ID }
      : {}),
  },
  extra: {
    ...config.extra,
    openaiApiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '',
  },
});
