import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApprovalCard } from '@/components/freya/ApprovalCard';
import { ScreenHeader } from '@/components/freya/ScreenHeader';
import { FreyaTheme } from '@/constants/theme';
import { useFreya } from '@/lib/store';

export default function ApprovalsScreen() {
  const { approvals, approveAction, rejectAction, pendingApprovalCount } = useFreya();

  const pending = approvals.filter((a) => a.status === 'pending');
  const completed = approvals.filter((a) => a.status !== 'pending');

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Approvals"
        subtitle="Nothing ships without a yes."
        badge={pendingApprovalCount}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {pending.length === 0 && completed.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>All clear</Text>
            <Text style={styles.emptyBody}>
              When Freya wants to send, book, or buy something, it shows up here for your approval.
            </Text>
          </View>
        )}

        {pending.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>WAITING ON YOU</Text>
            {pending.map((action) => (
              <ApprovalCard
                key={action.id}
                action={action}
                onApprove={() => void approveAction(action.id)}
                onReject={() => rejectAction(action.id)}
              />
            ))}
          </>
        )}

        {completed.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, styles.sectionSpaced]}>RECENT</Text>
            {completed.map((action) => (
              <ApprovalCard
                key={action.id}
                action={action}
                onApprove={() => {}}
                onReject={() => {}}
                compact
              />
            ))}
          </>
        )}
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
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: FreyaTheme.textMuted,
    marginBottom: 12,
  },
  sectionSpaced: {
    marginTop: 24,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: FreyaTheme.textPrimary,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 15,
    color: FreyaTheme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
