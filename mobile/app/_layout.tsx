import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  useFonts,
} from '@expo-google-fonts/dm-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import 'react-native-reanimated';

import { FreyaProvider } from '@/lib/store';
import { FreyaTheme } from '@/constants/theme';
import { fontFamily } from '@/constants/fonts';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const defaultTextStyle = { fontFamily: fontFamily.regular };
(Text as unknown as { defaultProps?: { style?: object } }).defaultProps = {
  ...(Text as unknown as { defaultProps?: object }).defaultProps,
  style: defaultTextStyle,
};
(TextInput as unknown as { defaultProps?: { style?: object } }).defaultProps = {
  ...(TextInput as unknown as { defaultProps?: object }).defaultProps,
  style: defaultTextStyle,
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <FreyaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: FreyaTheme.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </FreyaProvider>
  );
}
