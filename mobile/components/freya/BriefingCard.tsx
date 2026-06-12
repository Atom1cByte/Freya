import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FreyaTheme } from '@/constants/theme';
import type { BriefingItem } from '@/types';

interface BriefingCardProps {
  item: BriefingItem;
  onPress?: () => void;
}

const categoryLabels: Record<BriefingItem['category'], string> = {
  calendar: 'Calendar',
  inbox: 'Inbox',
  travel: 'Travel',
  reminder: 'Reminder',
};

export function BriefingCard({ item, onPress }: BriefingCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.accent, { backgroundColor: item.accent }]} />
      <View style={styles.content}>
        <Text style={[styles.category, { color: item.accent }]}>
          {categoryLabels[item.category]}
        </Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
      {item.time && (
        <Text style={styles.time}>{item.time}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FreyaTheme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FreyaTheme.border,
    padding: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.85,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  content: {
    flex: 1,
    paddingLeft: 8,
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: FreyaTheme.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: FreyaTheme.textSecondary,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    color: FreyaTheme.textMuted,
    marginLeft: 12,
  },
});
