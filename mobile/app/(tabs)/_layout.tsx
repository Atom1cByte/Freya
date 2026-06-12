import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { FreyaTheme } from '@/constants/theme';
import { useFreya } from '@/lib/store';

export default function TabLayout() {
  const { pendingApprovalCount } = useFreya();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: FreyaTheme.accent,
        tabBarInactiveTintColor: FreyaTheme.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Briefing',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'sun.max.fill', android: 'wb_sunny', web: 'wb_sunny' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'bubble.left.and.bubble.right.fill', android: 'chat', web: 'chat' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: 'Approvals',
          tabBarBadge: pendingApprovalCount > 0 ? pendingApprovalCount : undefined,
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'checkmark.shield.fill', android: 'verified_user', web: 'verified_user' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'gearshape.fill', android: 'settings', web: 'settings' }}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: FreyaTheme.surface,
    borderTopColor: FreyaTheme.border,
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
