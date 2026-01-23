import BackButton from '@/components/ui/BackButton';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectUser } from '@/redux/app/selector';
import { Media, MimeType } from '@/redux/app/types';
import { selectConversations, selectCurrentConversationMessages, selectTypingUsersInConversation } from '@/redux/messaging/selector';
import { actions } from '@/redux/messaging/slice';
import { Message } from '@/redux/messaging/types';
import { useMessaging } from '@/hooks/useMessaging';
import AttachmentBottomSheet from '@/components/messaging/AttachmentBottomSheet';
import MessageBubble from '@/components/messaging/MessageBubble';
import MessageInput from '@/components/messaging/MessageInput';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState, useEffect } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

function getVideoMimeType(mime: string | undefined): MimeType {
  const m = mime?.toLowerCase();
  if (m === 'video/mp4') return MimeType.MP4;
  if (m === 'video/quicktime' || m === 'video/x-quicktime' || m === 'video/mov') return MimeType.MOV;
  if (m === 'video/x-m4v') return MimeType.M4V;
  if (m === 'video/webm') return MimeType.WEBM;
  return MimeType.MP4;
}

export default function ConversationScreen() {
  const appTheme = useAppTheme();
  const isDark = appTheme === 'dark';
  const textColor = useThemeColor({ light: colors.light.text, dark: colors.dark.text }, 'text');
  const whiteColor = useThemeColor({ light: colors.light.white, dark: colors.dark.black }, 'white');
  const primaryColor = useThemeColor({ light: colors.light.tint, dark: colors.dark.tint }, 'tint');
  const subTextColor = useThemeColor({ light: colors.light.secondary, dark: colors.dark.secondary }, 'secondary');
  const backgroundColor = useThemeColor({ light: colors.light.background, dark: colors.dark.background }, 'background');
  const accentColor = isDark ? colors.dark.white : colors.light.black;

  const conversations = useAppSelector(selectConversations);
  const conversationMessages = useAppSelector(selectCurrentConversationMessages);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Media[]>([]);
  const [isAttachmentSheetOpen, setIsAttachmentSheetOpen] = useState(false);
  const scrollViewRef = useRef<any>(null);
  const prevMessageCountRef = useRef(0);
  const shouldAutoScrollRef = useRef(true);
  const isPickerActiveRef = useRef(false);
  const dispatch = useAppDispatch();
  const { id } = useLocalSearchParams();
  const user = useAppSelector(selectUser);
  const conversation = conversations.find(m => m.id === id);
  const otherParticipant = user?.id === conversation?.clientId ? conversation?.worker : conversation?.client;
  const typingUsers = useAppSelector(selectTypingUsersInConversation(id as string));
  const { sendTypingIndicator, stopTypingIndicator } = useMessaging(id as string);

  // Fetch messages for this conversation
  useEffect(() => {
    if (id) {
      dispatch(actions.fetchConversationMessages(id as string));
    }
  }, [id, dispatch]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    const currentCount = conversationMessages.length;
    const prevCount = prevMessageCountRef.current;
    
    // Check if a new message was added
    if (currentCount > prevCount && currentCount > 0) {
      // Check if the new message is from the current user (they just sent a message)
      const lastMessage = conversationMessages[currentCount - 1];
      const isOwnNewMessage = lastMessage?.senderId === user?.id;
      
      // Always scroll for own messages, or if auto-scroll is enabled
      if (isOwnNewMessage || shouldAutoScrollRef.current) {
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        });
      }
    }
    
    // Update previous count
    prevMessageCountRef.current = currentCount;
  }, [conversationMessages, user?.id]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (conversationMessages.length > 0 && prevMessageCountRef.current === 0) {
      // Initial load - scroll to bottom without animation
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      });
    }
  }, [conversationMessages.length]);

  // Scroll to bottom when keyboard opens
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        // Delay to allow keyboard animation to progress
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, Platform.OS === 'ios' ? 50 : 150);
      }
    );

    // Also handle keyboard did show for a second scroll (ensures content is visible)
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // Final scroll after keyboard is fully visible
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      });
    });

    return () => {
      keyboardWillShowListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleAttachmentSheetOpen = useCallback(() => {
    setIsAttachmentSheetOpen(true);
  }, []);

  const handleAttachmentSheetClose = useCallback(() => {
    setIsAttachmentSheetOpen(false);
  }, []);

  const MAX_ATTACHMENTS = 5;

  const pickDocument = async () => {
    // Check attachment limit
    if (attachments.length >= MAX_ATTACHMENTS) {
      alert(`You can only attach up to ${MAX_ATTACHMENTS} items at a time.`);
      return;
    }
    
    // Prevent multiple picker calls
    if (isPickerActiveRef.current) return;
    isPickerActiveRef.current = true;
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
      });

      if (result.assets && result.assets[0]) {
        setAttachments([...attachments, { 
          type: MimeType.PDF, 
          uri: result.assets[0].uri,
          id: result.assets[0].name,
        }]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    } finally {
      isPickerActiveRef.current = false;
    }
  };

  const pickImage = async () => {
    // Check attachment limit
    if (attachments.length >= MAX_ATTACHMENTS) {
      alert(`You can only attach up to ${MAX_ATTACHMENTS} items at a time.`);
      return;
    }
    
    // Prevent multiple picker calls
    if (isPickerActiveRef.current) return;
    isPickerActiveRef.current = true;
    
    try {
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need media library permissions to select images and videos!');
        isPickerActiveRef.current = false;
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        allowsMultipleSelection: true,
        selectionLimit: MAX_ATTACHMENTS - attachments.length,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets?.length) {
        setAttachments((prev) => {
          const remaining = MAX_ATTACHMENTS - prev.length;
          const toAdd = result.assets!.slice(0, remaining).map((asset, i) => {
            const isVideo = asset.type === 'video';
            const type = isVideo
              ? getVideoMimeType(asset.mimeType)
              : ((asset.mimeType as MimeType) || MimeType.JPEG);
            const id = asset.fileName || asset.uri || (isVideo ? `video_${Date.now()}_${i}.mp4` : `image_${Date.now()}_${i}.jpg`);
            return { type, uri: asset.uri, id };
          });
          return [...prev, ...toAdd];
        });
      }
    } catch (err) {
      console.error('Error picking image:', err);
    } finally {
      isPickerActiveRef.current = false;
    }
  };

  const takePhoto = async () => {
    // Check attachment limit
    if (attachments.length >= MAX_ATTACHMENTS) {
      alert(`You can only attach up to ${MAX_ATTACHMENTS} items at a time.`);
      return;
    }
    
    // Prevent multiple picker calls
    if (isPickerActiveRef.current) return;
    isPickerActiveRef.current = true;
    
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to take photos!');
        isPickerActiveRef.current = false;
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const type = asset.type === 'video' ? MimeType.MP4 : MimeType.JPEG;
        setAttachments([...attachments, { type, uri: asset.uri, id: asset.fileName as string || 'photo.jpg' }]);
      }
    } catch (err) {
      console.error('Error taking photo:', err);
    } finally {
      isPickerActiveRef.current = false;
    }
  };

  // Generate a unique temporary ID for optimistic messages
  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const sendMessage = () => {
    if (inputText.trim() === '' && attachments.length === 0) return;
    if (!user) return;

    // Stop typing indicator when sending
    if (id) {
      stopTypingIndicator(id as string);
    }

    const tempId = generateTempId();

    dispatch(actions.sendMessage({
      conversationId: id as string,
      message: {
        content: inputText,
        attachments: attachments,
      },
      tempId,
      senderId: user.id,
      sender: {
        id: user.id,
        name: user.name,
        avatar: user.avatar || '',
      },
    }));
    
    // Clear local state (form is also cleared in reducer)
    setInputText('');
    setAttachments([]);
  };

  // Retry sending a failed message
  const retryFailedMessage = (message: Message) => {
    if (!message.tempId) return;
    
    const newTempId = generateTempId();
    
    dispatch(actions.retryMessage({
      tempId: message.tempId,
      newTempId,
      conversationId: message.conversationId,
      content: message.content,
      media: message.media,
    }));
  };

  // Remove a failed message
  const removeFailedMessage = (message: Message) => {
    if (!message.tempId) return;
    dispatch(actions.removeFailedMessage(message.tempId));
  };

  const handleBookingPress = () => {
    router.push({
      pathname: '/(tabs)/(bookings)/[id]',
      params: {
        id: conversation?.bookingId as string,
      },
    });
  };

  return (
    <ThemedSafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerSection}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} iconName="arrow-left" />
          <View style={styles.headerRight}>
            {/* {otherParticipant?.avatar ? (
              <Image source={{ uri: otherParticipant.avatar }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder, { backgroundColor: primaryColor }]}>
                <ThemedText style={[styles.headerAvatarText, { color: whiteColor }]}>
                  {otherParticipant?.name?.charAt(0).toUpperCase() || '?'}
                </ThemedText>
              </View>
            )} */}
            <TouchableOpacity onPress={handleBookingPress}>
              <MaterialCommunityIcons name="calendar-outline" size={fontPixel(24)} color={textColor} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <FlashList
          ref={scrollViewRef}
          data={conversationMessages}
          contentContainerStyle={styles.listContainer}
          keyboardShouldPersistTaps="handled"
          onScroll={(event: any) => {
            // Check if user is near the bottom (within 100 pixels)
            const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
            const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
            shouldAutoScrollRef.current = isNearBottom;
          }}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              currentUserId={user?.id}
              onRetry={retryFailedMessage}
              onRemoveFailed={removeFailedMessage}
            />
          )}
        />

        {/* Typing Indicator */}
        {typingUsers && typingUsers.length > 0 && (
          <View style={[styles.typingIndicator, { backgroundColor }]}>
            <View style={styles.typingDots}>
              <View style={[styles.typingDot, { backgroundColor: subTextColor }]} />
              <View style={[styles.typingDot, styles.typingDotMiddle, { backgroundColor: subTextColor }]} />
              <View style={[styles.typingDot, { backgroundColor: subTextColor }]} />
            </View>
            <ThemedText style={[styles.typingText, { color: subTextColor }]}>
              {otherParticipant?.name || 'Someone'} is typing...
            </ThemedText>
          </View>
        )}

        <MessageInput
          inputText={inputText}
          onInputChange={setInputText}
          attachments={attachments}
          onRemoveAttachment={(index: number) => setAttachments(attachments.filter((_, i) => i !== index))}
          onAttachmentSheetOpen={handleAttachmentSheetOpen}
          onSend={sendMessage}
          onTypingStart={id ? () => sendTypingIndicator(id as string) : undefined}
          onTypingStop={id ? () => stopTypingIndicator(id as string) : undefined}
          maxAttachments={MAX_ATTACHMENTS}
        />
      </KeyboardAvoidingView>

      <AttachmentBottomSheet
        visible={isAttachmentSheetOpen}
        onClose={handleAttachmentSheetClose}
        onSelectGallery={pickImage}
        onSelectDocument={pickDocument}
        onTakePhoto={takePhoto}
      />
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(20),
  },
  accentBar: {
    width: widthPixel(40),
    height: heightPixel(4),
    marginBottom: heightPixel(10),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(12),
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerAvatar: {
    width: widthPixel(32),
    height: widthPixel(32),
    borderRadius: 0,
  },
  headerAvatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
  headerAvatarText: {
    fontSize: fontPixel(16),
    fontFamily: 'Bold',
  },
  listContainer: {
    paddingVertical: heightPixel(20),
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(100),
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: widthPixel(16),
    paddingVertical: heightPixel(8),
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: widthPixel(8),
  },
  typingDot: {
    width: widthPixel(6),
    height: widthPixel(6),
    borderRadius: widthPixel(3),
    marginHorizontal: widthPixel(2),
    opacity: 0.6,
  },
  typingDotMiddle: {
    opacity: 0.8,
  },
  typingText: {
    fontSize: fontPixel(13),
    fontFamily: 'Regular',
    fontStyle: 'italic',
  },
});
