import { colors } from "@/constants/theme/colors";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { selectUser } from "@/redux/app/selector";
import { actions } from "@/redux/messaging/slice";
import { Conversation } from "@/redux/messaging/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { Pressable, View, StyleSheet } from "react-native";
import { ThemedView } from "@/components/ui/Themed/ThemedView";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { format } from "date-fns";
import { Image } from "expo-image";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { formatDate, formatTime } from "@/constants/helpers";
import Status from "@/components/bookings/BookingDetails/Status";

const ConversationItem = ({ item } : { item: Conversation }) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const tintColor = useThemeColor({
      light: colors.light.tint,
      dark: colors.dark.tint
    }, 'background');
    // Text color for tint backgrounds: white in light mode (on black), black in dark mode (on white)
    const tintTextColor = useThemeColor({
      light: colors.light.white,
      dark: colors.dark.black
    }, 'white');
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
  
    // Determine other participant (worker or client)
    const otherParticipant = user?.id === item.clientId ? item.worker : item.client;
  
    if(!item) return null;
  
    return (
      <Pressable
        onPress={handlePress}
        style={[styles.conversationItem, { backgroundColor: cardBg, borderColor }]}>
        <View style={[styles.leftAccent, { backgroundColor: borderColor }]} />
        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.avatarContainer}>
              {otherParticipant.avatar ? (
                <Image source={{ uri: otherParticipant.avatar }} style={styles.avatar} />
              ) : (
                <ThemedView style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: tintColor }]}>
                  <ThemedText style={[styles.avatarText, { color: tintTextColor }]}>
                    {otherParticipant.name.charAt(0).toUpperCase()}
                  </ThemedText>
                </ThemedView>
              )}
            </View>
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <ThemedText style={[styles.senderName, { color: textColor }]}>
                  {otherParticipant.name}
                </ThemedText>
                {(item?.unreadCount && item?.unreadCount || 0) > 0 && (
                  <ThemedView style={[styles.unreadBadge, { backgroundColor: tintColor }]}>
                    <ThemedText style={[styles.unreadCount, { color: tintTextColor }]}>{item?.unreadCount}</ThemedText>
                  </ThemedView>
                )}
              </View>
              <View style={styles.messagePreview}>
                <ThemedText 
                  numberOfLines={1} 
                  style={[
                    styles.lastMessage, 
                    { color: secondaryText },
                    (item?.unreadCount || 0) > 0 && styles.unreadMessage
                  ]}>
                  {item.lastMessage || 'No messages yet'}
                </ThemedText>
                {item.lastMessageAt && (
                  <ThemedText style={[styles.timestamp, { color: secondaryText }]}>
                    {format(new Date(item.lastMessageAt), 'h:mm a')}
                  </ThemedText>
                )}
              </View>
              {/* Booking Context */}
              {item.booking && (
                <View style={[styles.bookingContext, { borderTopColor: secondaryText }]}>
                  <ThemedText 
                    numberOfLines={1} 
                    style={[styles.bookingDescription, { color: secondaryText }]}>
                    {item.booking.description}
                  </ThemedText>
                  <View style={styles.bookingMeta}>
                    <ThemedText style={[styles.bookingDateTime, { color: secondaryText }]}>
                      {formatDate(new Date(item.booking.date))}, {formatTime(item.booking.startTime)}
                    </ThemedText>
                    <Status booking={item.booking} />
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
};

export default ConversationItem;

const styles = StyleSheet.create({
  conversationItem: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: heightPixel(11),
    borderWidth: 0.5,
    borderLeftWidth: 0,
    overflow: 'hidden',
  },
  leftAccent: {
    width: widthPixel(4),
  },
  content: {
    flex: 1,
    paddingVertical: heightPixel(10),
    paddingHorizontal: widthPixel(12),
  },
  topRow: {
    flexDirection: 'row',
    gap: widthPixel(8),
  },
  avatarContainer: {
    width: widthPixel(42),
    height: heightPixel(42),
  },
  avatar: {
    width: widthPixel(42),
    height: heightPixel(42),
    borderRadius: 0,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
  avatarText: {
    fontSize: fontPixel(16),
    fontFamily: 'Bold',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: heightPixel(5),
  },
  senderName: {
    fontSize: fontPixel(14),
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
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
    flex: 1,
  },
  unreadMessage: {
    fontFamily: 'SemiBold',
  },
  timestamp: {
    fontSize: fontPixel(11),
    fontFamily: 'Regular',
  },
  unreadBadge: {
    borderRadius: 0,
    minWidth: widthPixel(18),
    height: heightPixel(18),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: widthPixel(5),
  },
  unreadCount: {
    fontSize: fontPixel(10),
    fontFamily: 'Bold',
  },
  bookingContext: {
    marginTop: heightPixel(7),
    paddingTop: heightPixel(7),
    borderTopWidth: 0.5,
  },
  bookingDescription: {
    fontSize: fontPixel(12),
    fontFamily: 'Regular',
    marginBottom: heightPixel(4),
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: widthPixel(8),
  },
  bookingDateTime: {
    fontSize: fontPixel(11),
    fontFamily: 'Regular',
    flex: 1,
  },
});