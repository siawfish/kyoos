import { FlashList } from '@shopify/flash-list';
import { format } from 'date-fns';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import EmptyList from '@/components/ui/EmptyList';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { ThemedView } from '@/components/ui/Themed/ThemedView';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectUser } from '@/redux/app/selector';
import { User } from '@/redux/app/types';
import { selectIsLoading, selectMessages } from '@/redux/messaging/selector';
import { actions } from '@/redux/messaging/slice';
import { Conversation } from '@/redux/messaging/types';

const ConversationItem = ({ item } : { item: Conversation }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const theme = useAppTheme();
  const isDark = theme === 'dark';
  
  const tintColor = useThemeColor({
    light: colors.light.tint,
    dark: colors.dark.tint
  }, 'background');
  const accentColor = isDark ? colors.dark.white : colors.light.black;
  const cardBg = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');
  const borderColor = accentColor;
  const textColor = useThemeColor({
    light: colors.light.text,
    dark: colors.dark.text
  }, 'text');
  const secondaryText = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary
  }, 'text');

  const handlePress = () => {
    dispatch(actions.markConversationAsRead(item.id));
    router.push(`/(tabs)/(messaging)/${item.id}`);
  };

  const sender = item.participants.find(p => p.id !== user?.id) as User;

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.conversationItem, { backgroundColor: cardBg, borderColor }]}>
      <View style={[styles.leftAccent, { backgroundColor: borderColor }]} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.avatarContainer}>
            {sender.avatar ? (
              <Image source={{ uri: sender.avatar }} style={styles.avatar} />
            ) : (
              <ThemedView style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: tintColor }]}>
                <ThemedText style={styles.avatarText}>
                  {sender.name.charAt(0).toUpperCase()}
                </ThemedText>
              </ThemedView>
            )}
          </View>
          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <ThemedText style={[styles.senderName, { color: textColor }]}>
                {sender.name}
              </ThemedText>
              {item.unreadCount > 0 && (
                <ThemedView style={[styles.unreadBadge, { backgroundColor: tintColor }]}>
                  <ThemedText style={styles.unreadCount}>{item.unreadCount}</ThemedText>
                </ThemedView>
              )}
            </View>
            <View style={styles.messagePreview}>
              <ThemedText 
                numberOfLines={1} 
                style={[
                  styles.lastMessage, 
                  { color: secondaryText },
                  item.unreadCount > 0 && styles.unreadMessage
                ]}>
                {item.messages.length > 0 ? item.messages[item.messages.length - 1].content || 'No messages yet' : 'No messages yet'}
              </ThemedText>
              {item.messages.length > 0 && (
                <ThemedText style={[styles.timestamp, { color: secondaryText }]}>
                  {format(new Date(item.messages[item.messages.length - 1].timestamp), 'h:mm a')}
                </ThemedText>
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default function MessagingScreen() {
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages);
  const isLoading = useSelector(selectIsLoading);
  const theme = useAppTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    dispatch(actions.fetchMessages());
  }, [dispatch]);

  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');
  const accentColor = isDark ? colors.dark.white : colors.light.black;
  const labelColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary
  }, 'text');

  const renderHeader = () => {
    return (
      <View style={styles.headerSection}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <Text style={[styles.label, { color: labelColor }]}>MESSAGES</Text>
      </View>
    );
  };

  const renderEmptyList = () => {
    return (
      <EmptyList
        containerStyle={styles.emptyList}
        message="No messages yet. Start a conversation to get started."
      />
    );
  };

  return (
    <ThemedSafeAreaView style={[styles.container, { backgroundColor }]}>
      <FlashList
        data={messages}
        renderItem={({ item }) => <ConversationItem item={item as Conversation} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={() => dispatch(actions.fetchMessages())}
      />
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingBottom: heightPixel(20),
  },
  accentBar: {
    width: widthPixel(40),
    height: heightPixel(4),
    marginBottom: heightPixel(20),
  },
  label: {
    fontSize: fontPixel(10),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
  },
  listContainer: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(100),
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: heightPixel(200),
  },
  conversationItem: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: heightPixel(16),
    borderWidth: 0.5,
    borderLeftWidth: 0,
    overflow: 'hidden',
  },
  leftAccent: {
    width: widthPixel(4),
  },
  content: {
    flex: 1,
    padding: widthPixel(16),
  },
  topRow: {
    flexDirection: 'row',
    gap: widthPixel(12),
  },
  avatarContainer: {
    width: widthPixel(50),
    height: heightPixel(50),
  },
  avatar: {
    width: widthPixel(50),
    height: heightPixel(50),
    borderRadius: 0,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
  avatarText: {
    color: 'white',
    fontSize: fontPixel(20),
    fontFamily: 'Bold',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: heightPixel(8),
  },
  senderName: {
    fontSize: fontPixel(15),
    fontFamily: 'Bold',
    letterSpacing: 0.5,
    flex: 1,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(8),
  },
  lastMessage: {
    fontSize: fontPixel(15),
    fontFamily: 'Regular',
    flex: 1,
  },
  unreadMessage: {
    fontFamily: 'SemiBold',
  },
  timestamp: {
    fontSize: fontPixel(12),
    fontFamily: 'Regular',
  },
  unreadBadge: {
    borderRadius: 0,
    minWidth: widthPixel(20),
    height: heightPixel(20),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: widthPixel(6),
  },
  unreadCount: {
    color: 'white',
    fontSize: fontPixel(11),
    fontFamily: 'Bold',
  },
});
