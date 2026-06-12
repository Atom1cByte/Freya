import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FreyaTheme } from '@/constants/theme';
import type { ApprovalAction } from '@/types';

interface ApprovalCardProps {
  action: ApprovalAction;
  onApprove: () => void;
  onReject: () => void;
  compact?: boolean;
}

export function ApprovalCard({ action, onApprove, onReject, compact }: ApprovalCardProps) {
  const isPending = action.status === 'pending';

  function handleApprove() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onApprove();
  }

  function handleReject() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReject();
  }

  return (
    <View style={[styles.card, !isPending && styles.cardDone]}>
      <View style={styles.header}>
        <Text style={styles.type}>{formatType(action.type)}</Text>
        {!isPending && (
          <View style={[styles.badge, action.status === 'approved' ? styles.approved : styles.rejected]}>
            <Text style={styles.badgeText}>{action.status}</Text>
          </View>
        )}
      </View>
      <Text style={styles.title}>{action.title}</Text>
      <Text style={styles.description}>{action.description}</Text>
      {!compact && (
        <View style={styles.preview}>
          <Text style={styles.previewText}>{action.preview}</Text>
        </View>
      )}
      {isPending && (
        <View style={styles.buttons}>
          <Pressable style={styles.rejectBtn} onPress={handleReject}>
            <Text style={styles.rejectText}>Decline</Text>
          </Pressable>
          <Pressable style={styles.approveBtn} onPress={handleApprove}>
            <Text style={styles.approveText}>Approve</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function formatType(type: ApprovalAction['type']): string {
  const map: Record<ApprovalAction['type'], string> = {
    send_email: 'Email',
    send_message: 'Message',
    book_appointment: 'Booking',
    reschedule_meeting: 'Calendar',
    make_purchase: 'Purchase',
  };
  return map[type];
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FreyaTheme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FreyaTheme.border,
    padding: 16,
    marginBottom: 12,
  },
  cardDone: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  type: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: FreyaTheme.accent,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  approved: {
    backgroundColor: 'rgba(48, 209, 88, 0.2)',
  },
  rejected: {
    backgroundColor: 'rgba(255, 55, 95, 0.2)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: FreyaTheme.textSecondary,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: FreyaTheme.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: FreyaTheme.textSecondary,
    marginBottom: 12,
  },
  preview: {
    backgroundColor: FreyaTheme.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: FreyaTheme.border,
  },
  previewText: {
    fontSize: 14,
    color: FreyaTheme.textPrimary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FreyaTheme.border,
    alignItems: 'center',
  },
  rejectText: {
    color: FreyaTheme.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  approveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: FreyaTheme.accent,
    alignItems: 'center',
  },
  approveText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
});
