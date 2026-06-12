import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FreyaTheme } from '@/constants/theme';
import type { ChatMessage } from '@/types';

interface ChatBubbleProps {
  message: ChatMessage;
  onApprove?: () => void;
}

export function ChatBubble({ message, onApprove }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>F</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.label}>{isUser ? 'You' : 'Freya'}</Text>
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
            {message.content}
          </Text>
        </View>
        {message.pendingApproval && onApprove && (
          <Pressable style={styles.actions} onPress={onApprove}>
            <Text style={styles.approveHint}>Tap to approve →</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function TypingIndicator() {
  return (
    <View style={[styles.row, styles.rowAssistant]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>F</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>Freya</Text>
        <View style={[styles.bubble, styles.assistantBubble, styles.typingBubble]}>
          <Text style={styles.typingText}>Thinking…</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FreyaTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 18,
  },
  avatarText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    maxWidth: '82%',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: FreyaTheme.textMuted,
    marginBottom: 4,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: FreyaTheme.userBubble,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: FreyaTheme.assistantBubble,
    borderWidth: 1,
    borderColor: FreyaTheme.border,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: FreyaTheme.userBubbleText,
  },
  assistantText: {
    color: FreyaTheme.textPrimary,
  },
  actions: {
    marginTop: 8,
  },
  approveHint: {
    color: FreyaTheme.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  typingBubble: {
    paddingVertical: 10,
  },
  typingText: {
    color: FreyaTheme.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
});
