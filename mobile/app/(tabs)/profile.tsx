import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { ScreenHeader } from '@/components/freya/ScreenHeader';
import { FreyaTheme, useCaseColors } from '@/constants/theme';
import { getWdaBaseUrl, isWdaAvailable, setWdaBaseUrl } from '@/lib/agent/wda-client';
import { getOpenAiApiKey } from '@/lib/config';
import { useFreya } from '@/lib/store';

const USE_CASES = [
  { label: 'Inbox zero', desc: 'Mail + WDA tap/type', color: useCaseColors.inbox },
  { label: 'Travel', desc: 'Maps, calendar, Shortcuts', color: useCaseColors.travel },
  { label: 'Meetings', desc: 'EventKit read/write', color: useCaseColors.meetings },
  { label: 'Errands', desc: 'Reminders + phone', color: useCaseColors.errands },
  { label: 'Research', desc: 'Safari + clipboard', color: useCaseColors.research },
];

export default function ProfileScreen() {
  const { wdaConnected } = useFreya();
  const [requireApproval, setRequireApproval] = useState(true);
  const [wdaUrl, setWdaUrl] = useState('http://127.0.0.1:8100');
  const [wdaStatus, setWdaStatus] = useState(false);

  useEffect(() => {
    void getWdaBaseUrl().then(setWdaUrl);
    void isWdaAvailable().then(setWdaStatus);
  }, [wdaConnected]);

  const hasApiKey = Boolean(getOpenAiApiKey());

  async function saveWdaUrl() {
    await setWdaBaseUrl(wdaUrl);
    setWdaStatus(await isWdaAvailable());
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Settings" subtitle="System orchestration" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>F</Text>
          </View>
          <View>
            <Text style={styles.name}>Freya</Text>
            <Text style={styles.handle}>{hasApiKey ? 'GPT-4o agent · WDA' : 'Heuristic agent · WDA'}</Text>
          </View>
          <View style={styles.betaBadge}>
            <Text style={styles.betaText}>{wdaStatus ? 'WDA on' : 'WDA off'}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>GUI AUTOMATION</Text>
        <View style={styles.settingRowCol}>
          <Text style={styles.settingTitle}>WebDriverAgent URL</Text>
          <Text style={styles.settingDesc}>
            Dynamic agent reads your screen and taps/types on any app. WDA must run on device port 8100.
          </Text>
          <TextInput
            style={styles.input}
            value={wdaUrl}
            onChangeText={setWdaUrl}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="http://127.0.0.1:8100"
            placeholderTextColor={FreyaTheme.textMuted}
          />
          <Pressable style={styles.saveBtn} onPress={() => void saveWdaUrl()}>
            <Text style={styles.saveBtnText}>Save & test connection</Text>
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, styles.sectionSpaced]}>TRUST</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Require approval</Text>
            <Text style={styles.settingDesc}>External sends and automations wait for your tap</Text>
          </View>
          <Switch
            value={requireApproval}
            onValueChange={setRequireApproval}
            trackColor={{ false: FreyaTheme.surfaceElevated, true: FreyaTheme.accentMuted }}
            thumbColor={requireApproval ? FreyaTheme.accent : FreyaTheme.textMuted}
          />
        </View>

        <Text style={[styles.sectionLabel, styles.sectionSpaced]}>CAPABILITIES</Text>
        {USE_CASES.map((item) => (
          <View key={item.label} style={styles.useCase}>
            <View style={[styles.useCaseDot, { backgroundColor: item.color }]} />
            <View>
              <Text style={styles.useCaseLabel}>{item.label}</Text>
              <Text style={styles.useCaseDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.footer}>
          Set EXPO_PUBLIC_OPENAI_API_KEY for full dynamic control.{'\n'}
          Build with expo-dev-client — Expo Go cannot run native modules or WDA.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FreyaTheme.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreyaTheme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FreyaTheme.border,
    padding: 16,
    marginBottom: 28,
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: FreyaTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: FreyaTheme.textPrimary,
  },
  handle: {
    fontSize: 14,
    color: FreyaTheme.textSecondary,
  },
  betaBadge: {
    marginLeft: 'auto',
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  betaText: {
    fontSize: 11,
    fontWeight: '600',
    color: FreyaTheme.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: FreyaTheme.textMuted,
    marginBottom: 12,
  },
  sectionSpaced: {
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FreyaTheme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: FreyaTheme.border,
    padding: 16,
    marginBottom: 10,
  },
  settingRowCol: {
    backgroundColor: FreyaTheme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: FreyaTheme.border,
    padding: 16,
    marginBottom: 10,
    gap: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FreyaTheme.textPrimary,
  },
  settingDesc: {
    fontSize: 13,
    color: FreyaTheme.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: FreyaTheme.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: FreyaTheme.textPrimary,
    fontSize: 14,
  },
  saveBtn: {
    marginTop: 8,
    backgroundColor: FreyaTheme.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#000',
    fontWeight: '700',
  },
  useCase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  useCaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  useCaseLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: FreyaTheme.textPrimary,
  },
  useCaseDesc: {
    fontSize: 13,
    color: FreyaTheme.textSecondary,
  },
  footer: {
    marginTop: 32,
    fontSize: 12,
    color: FreyaTheme.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
