import { useRef, useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ChatBubble, TypingIndicator } from '@/components/freya/ChatBubble';
import { ChatInput } from '@/components/freya/ChatInput';
import { QuickActions } from '@/components/freya/QuickActions';
import { ScreenHeader } from '@/components/freya/ScreenHeader';
import { FreyaTheme } from '@/constants/theme';
import { useFreya } from '@/lib/store';
import type { ChatMessage } from '@/types';

export default function ChatScreen() {
  const { messages, quickActions, isTyping, sendMessage, approveAction } = useFreya();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, isTyping]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Freya"
        subtitle="Hermes for iPhone"
      />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatBubble
            message={item}
            onApprove={
              item.approvalId
                ? () => void approveAction(item.approvalId!)
                : undefined
            }
          />
        )}
        contentContainerStyle={styles.list}
        ListFooterComponent={isTyping ? TypingIndicator : null}
        showsVerticalScrollIndicator={false}
      />

      <QuickActions actions={quickActions} onSelect={sendMessage} />
      <ChatInput onSend={sendMessage} disabled={isTyping} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FreyaTheme.background,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 16,
  },
});
