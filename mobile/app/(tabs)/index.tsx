import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BriefingCard } from '@/components/freya/BriefingCard';
import { ScreenHeader } from '@/components/freya/ScreenHeader';
import { FreyaTheme } from '@/constants/theme';
import { useFreya } from '@/lib/store';

export default function BriefingScreen() {
  const { briefingItems, sendMessage, pendingApprovalCount, refreshBriefing, wdaConnected } = useFreya();

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="What matters today?"
        subtitle={wdaConnected ? 'Calendar synced · WDA connected' : 'Calendar synced · WDA offline'}
        badge={pendingApprovalCount}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl tintColor={FreyaTheme.accent} refreshing={false} onRefresh={() => void refreshBriefing()} />
        }
      >
        <LinearGradient colors={['rgba(255,149,0,0.15)', 'transparent']} style={styles.glow} />

        <View style={styles.flow}>
          {['listen', 'remember', 'act', 'approve', 'repeat'].map((word, i) => (
            <View key={word} style={styles.flowItem}>
              <Text style={[styles.flowWord, i === 2 && styles.flowAccent]}>{word}</Text>
              {i < 4 && <Text style={styles.flowSep}>·</Text>}
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>TODAY · LIVE CALENDAR</Text>
        {briefingItems.map((item) => (
          <BriefingCard
            key={item.id}
            item={item}
            onPress={() => {
              router.push('/(tabs)/chat');
              if (item.category === 'inbox') {
                void sendMessage('Triage my inbox');
              } else if (item.id === 'empty' || item.id === 'perm') {
                void sendMessage('What matters today?');
              } else {
                void sendMessage(`Tell me about my ${item.title} event`);
              }
            }}
          />
        ))}

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={() => {
            router.push('/(tabs)/chat');
            void sendMessage('What matters today?');
          }}
        >
          <Text style={styles.ctaText}>Ask Freya anything</Text>
        </Pressable>

        <View style={styles.trust}>
          <Text style={styles.trustTitle}>Dynamic control.</Text>
          <Text style={styles.trustBody}>
            No hardcoded apps. Freya reads your screen each step and decides what to tap — Spotify, Roblox, Mail,
            anything installed. Calendar uses EventKit directly.
          </Text>
        </View>
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
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  flow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 28,
    gap: 4,
  },
  flowItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flowWord: {
    fontSize: 13,
    fontWeight: '600',
    color: FreyaTheme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  flowAccent: {
    color: FreyaTheme.accent,
  },
  flowSep: {
    color: FreyaTheme.textMuted,
    marginHorizontal: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: FreyaTheme.textMuted,
    marginBottom: 12,
  },
  cta: {
    marginTop: 20,
    backgroundColor: FreyaTheme.accent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaPressed: {
    opacity: 0.85,
  },
  ctaText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  trust: {
    marginTop: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FreyaTheme.border,
    backgroundColor: FreyaTheme.surface,
  },
  trustTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: FreyaTheme.textPrimary,
    marginBottom: 6,
  },
  trustBody: {
    fontSize: 14,
    color: FreyaTheme.textSecondary,
    lineHeight: 20,
  },
});
