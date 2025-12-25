import { StyleSheet, FlatList, Pressable, Image, View } from 'react-native';
import { router } from 'expo-router';
import { format } from 'date-fns';

import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { ThemedView } from '@/components/ui/Themed/ThemedView';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';

// Temporary mock data
const mockMessages = [
  {
    id: '1',
    sender: 'John Doe',
    lastMessage: 'Hey, how are you?',
    timestamp: new Date(),
    unread: 2,
    avatar: null,
  },
  {
    id: '2',
    sender: 'Jane Smith',
    lastMessage: 'Can we meet tomorrow?',
    timestamp: new Date(Date.now() - 3600000),
    unread: 0,
    avatar: null,
  },
  // Add more mock conversations as needed
];

const ConversationItem = ({ item } : { item: typeof mockMessages[0] }) => {
  const tintColor = useThemeColor({
    light: colors.light.tint,
    dark: colors.dark.tint
  }, 'background');
  const borderColor = useThemeColor({
    light: colors.light.misc,
    dark: colors.dark.misc
  }, 'background');
  const secondaryText = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary
  }, 'text');
  const backgroundColor = useThemeColor({
    light: colors.light.white,
    dark: colors.dark.black
  }, 'background');

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/(messaging)/${item.id}`)}
      style={[styles.conversationItem, { borderBottomColor: borderColor, backgroundColor: backgroundColor }]}>
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <ThemedView style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: tintColor }]}>
            <ThemedText style={styles.avatarText}>
              {item.sender.charAt(0)}
            </ThemedText>
          </ThemedView>
        )}
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <ThemedText type='defaultSemiBold' style={styles.senderName}>{item.sender}</ThemedText>
          <ThemedText style={[styles.timestamp, { color: secondaryText }]}>
            {format(item.timestamp, 'h:mm a')}
          </ThemedText>
        </View>
        <View style={styles.messagePreview}>
          <ThemedText 
            numberOfLines={1} 
            style={[
              styles.lastMessage, 
              { color: secondaryText },
              item.unread > 0 && styles.unreadMessage
            ]}>
            {item.lastMessage}
          </ThemedText>
          {item.unread > 0 && (
            <ThemedView style={[styles.unreadBadge, { backgroundColor: tintColor }]}>
              <ThemedText style={styles.unreadCount}>{item.unread}</ThemedText>
            </ThemedView>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default function MessagingScreen() {  
  return (
    <ThemedSafeAreaView 
      style={styles.container}
    >
      <FlatList
        data={mockMessages}
        renderItem={({ item }) => <ConversationItem item={item} />}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: widthPixel(16),
    paddingVertical: heightPixel(16),
    borderBottomWidth: 1,
  },
  title: {
    fontSize: fontPixel(32),
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: widthPixel(16),
    paddingVertical: heightPixel(16),
    borderBottomWidth: 1,
  },
  avatarContainer: {
    marginRight: widthPixel(12),
  },
  avatar: {
    width: widthPixel(50),
    height: heightPixel(50),
    borderRadius: 25,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: fontPixel(20),
    fontWeight: 'bold',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: heightPixel(4),
  },
  senderName: {
    fontSize: fontPixel(16),
  },
  timestamp: {
    fontSize: fontPixel(14),
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: fontPixel(15),
    flex: 1,
  },
  unreadMessage: {
    fontWeight: '500',
  },
  unreadBadge: {
    borderRadius: 10,
    minWidth: widthPixel(20),
    height: heightPixel(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: widthPixel(8),
    paddingHorizontal: widthPixel(6),
  },
  unreadCount: {
    color: 'white',
    fontSize: fontPixel(12),
    fontWeight: 'bold',
  },
});
