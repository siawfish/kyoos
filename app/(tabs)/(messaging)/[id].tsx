import BackButton from '@/components/ui/BackButton';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { ThemedView } from '@/components/ui/Themed/ThemedView';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectUser } from '@/redux/app/selector';
import { Media, MimeType } from '@/redux/app/types';
import { selectMessages } from '@/redux/messaging/selector';
import { actions } from '@/redux/messaging/slice';
import { Message } from '@/redux/messaging/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageStyle,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

const VideoPlayer = ({ 
  uri, 
  contentFit = "cover", 
  showControls = false, 
  autoPlay = false,
  style
}: { 
  uri: string; 
  contentFit?: "contain" | "cover"; 
  showControls?: boolean; 
  autoPlay?: boolean;
  style?: ViewStyle;
}) => {
  const player = useVideoPlayer(uri, (player) => {
    player.muted = !showControls;
    if (autoPlay) {
      player.play();
    }
  });

  return (
    <VideoView 
      player={player} 
      contentFit={contentFit}
      nativeControls={showControls}
      style={style}
    />
  );
};

export default function ConversationScreen() {
  const appTheme = useAppTheme();
  const isDark = appTheme === 'dark';
  const textColor = useThemeColor({ light: colors.light.text, dark: colors.dark.text }, 'text');
  const whiteColor = useThemeColor({ light: colors.light.white, dark: colors.dark.black }, 'white');
  const primaryColor = useThemeColor({ light: colors.light.tint, dark: colors.dark.tint }, 'tint');
  const greyColor = useThemeColor({ light: colors.light.misc, dark: colors.dark.misc }, 'misc');
  const dangerColor = useThemeColor({ light: colors.light.danger, dark: colors.dark.danger }, 'danger');
  const subTextColor = useThemeColor({ light: colors.light.secondary, dark: colors.dark.secondary }, 'secondary');
  const inputBackgroundColor = useThemeColor({ light: colors.light.white, dark: colors.dark.black }, 'white');
  const backgroundColor = useThemeColor({ light: colors.light.background, dark: colors.dark.background }, 'background');
  const accentColor = isDark ? colors.dark.white : colors.light.black;
  const borderColor = accentColor;
  const labelColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary
  }, 'text');
  
  const messages = useSelector(selectMessages);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Media[]>([]);
  const [isAttachmentSheetOpen, setIsAttachmentSheetOpen] = useState(false);
  const scrollViewRef = useRef<any>(null);
  const attachmentSheetRef = useRef<BottomSheet>(null);
  const dispatch = useDispatch();
  const screenWidth = Dimensions.get('window').width;
  const { id } = useLocalSearchParams();
  const user = useSelector(selectUser);
  const conversation = messages.find(m => m.id === id);
  const sender = conversation?.participants.find(p => p.id !== user?.id);

  const snapPoints = useMemo(() => ['40%'], []);

  const handleAttachmentSheetOpen = useCallback(() => {
    setIsAttachmentSheetOpen(true);
  }, []);

  const handleAttachmentSheetClose = useCallback(() => {
    setIsAttachmentSheetOpen(false);
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      handleAttachmentSheetClose();
    }
  }, [handleAttachmentSheetClose]);

  const pickDocument = async () => {
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
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const type = asset.type === 'video' ? MimeType.MP4 : MimeType.JPEG;
      setAttachments([...attachments, { type, uri: asset.uri, id: asset.fileName as string }]);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera permissions to take photos!');
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
    }
  };

  const sendMessage = () => {
    if (inputText.trim() === '' && attachments.length === 0) return;

    dispatch(actions.sendMessage({
      conversationId: id as string,
      message: {
        content: inputText,
        attachments: attachments,
      }
    }));
    setInputText('');
    setAttachments([]);
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMediaGrid = (messageAttachments: Message['attachments']) => {
    if (!messageAttachments) return null;
    
    const itemsPerRow = messageAttachments.length === 1 ? 1 : 
                       messageAttachments.length === 2 ? 2 : 
                       messageAttachments.length === 3 ? 3 : 2;
                       
    const containerWidth = Math.min(screenWidth * 0.6, 250);
    const spacing = widthPixel(2);
    const itemWidth = (containerWidth - (spacing * (itemsPerRow - 1))) / itemsPerRow;
    const rows = Math.ceil(messageAttachments.length / itemsPerRow);
    
    return (
      <View style={{ 
        width: containerWidth, 
        gap: spacing,
        alignSelf: 'flex-start',
      }}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <View 
            key={rowIndex} 
            style={{ 
              flexDirection: 'row', 
              gap: spacing,
              justifyContent: 'flex-start',
            }}
          >
            {messageAttachments.slice(rowIndex * itemsPerRow, (rowIndex + 1) * itemsPerRow).map((attachment, index) => (
              <View 
                key={index} 
                style={{ 
                  width: itemWidth, 
                  height: attachment.type === MimeType.PDF ? heightPixel(60) : itemWidth,
                }}
              >
                {renderAttachmentPreview(attachment, true, itemWidth)}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderAttachmentPreview = (
    attachment: Media, 
    isInMessage: boolean = false,
    forcedWidth?: number
  ) => {
    const containerStyle: ViewStyle = isInMessage ? {
      width: forcedWidth,
      height: attachment.type === MimeType.PDF ? 'auto' : forcedWidth,
      borderRadius: 0,
      overflow: 'hidden',
      backgroundColor: inputBackgroundColor,
      borderWidth: 0.5,
      borderColor: borderColor,
    } : {
      width: widthPixel(60),
      height: heightPixel(60),
      borderRadius: 0,
      overflow: 'hidden',
      borderWidth: 0.5,
      borderColor: borderColor,
    };

    const mediaStyle = isInMessage ? {
      width: '100%',
      height: '100%',
      borderRadius: 0,
    } : {
      width: '100%',
      height: '100%',
    };

    switch (attachment.type) {
      case MimeType.JPEG:
      case MimeType.JPG:
      case MimeType.PNG:
        return (
          <View style={containerStyle}>
            <Image
              source={{ uri: attachment.uri }}
              style={mediaStyle as ImageStyle}
              resizeMode="cover"
            />
          </View>
        );
      case MimeType.MP4:
      case MimeType.MOV:
        return (
          <View style={containerStyle}>
            <VideoPlayer
              uri={attachment.uri}
              contentFit={isInMessage ? "contain" : "cover"}
              showControls={isInMessage}
              autoPlay={false}
              style={mediaStyle as ViewStyle}
            />
            {!isInMessage && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.2)',
              }}>
                <Ionicons name="play-circle" size={24} color="#fff" />
              </View>
            )}
          </View>
        );
      case MimeType.PDF:
        return (
          <View style={[
            containerStyle,
            {
              backgroundColor: inputBackgroundColor,
              paddingHorizontal: isInMessage ? widthPixel(12) : widthPixel(4),
              paddingVertical: isInMessage ? heightPixel(12) : heightPixel(4),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: isInMessage ? 'flex-start' : 'center',
            } as ViewStyle
          ]}>
            <Ionicons 
              name="document-text" 
              size={isInMessage ? 24 : 20} 
              color={dangerColor}
            />
            {isInMessage && (
              <ThemedText style={{ marginLeft: widthPixel(8), flex: 1 }} numberOfLines={1}>
                {attachment.id || 'PDF Document'}
              </ThemedText>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ThemedSafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerSection}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} iconName="arrow-left" />
          <View style={styles.headerRight}>
            {sender?.avatar ? (
              <Image source={{ uri: sender.avatar }} style={styles.headerAvatar} />
            ) : (
              <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder, { backgroundColor: primaryColor }]}>
                <ThemedText style={[styles.headerAvatarText, { color: whiteColor }]}>
                  {sender?.name?.charAt(0).toUpperCase() || '?'}
                </ThemedText>
              </View>
            )}
            <Link href="/(tabs)/(bookings)/bookings" asChild>
              <TouchableOpacity>
                <MaterialCommunityIcons name="calendar-outline" size={fontPixel(24)} color={textColor} />
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 110 : 0}
      >
        <FlashList
          ref={scrollViewRef}
          data={messages.find(m => m.id === id)?.messages as Message[]}
          contentContainerStyle={styles.listContainer}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item: message }) => {
            const isOwnMessage = message.senderId === user?.id;
            return (
              <View
                style={[
                  styles.messageWrapper,
                  isOwnMessage ? styles.messageWrapperRight : styles.messageWrapperLeft
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    { 
                      backgroundColor: isOwnMessage ? primaryColor : whiteColor,
                      borderColor: borderColor,
                    }
                  ]}
                >
                  {message.content && (
                    <ThemedText
                      style={[
                        styles.messageText,
                        { color: isOwnMessage ? whiteColor : textColor }
                      ]}
                    >
                      {message.content}
                    </ThemedText>
                  )}
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <View style={styles.attachmentsContainer}>
                      {renderMediaGrid(message.attachments)}
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />

        <ThemedView 
          lightColor={colors.light.white}
          darkColor={colors.dark.black}
          style={[
            styles.inputContainer,
            { borderTopColor: borderColor }
          ]}
        >
          {attachments.length > 0 && (
            <ScrollView
              horizontal
              style={styles.attachmentsPreview}
              contentContainerStyle={styles.attachmentsPreviewContent}
            >
              {attachments.map((attachment, index) => (
                <View 
                  key={index} 
                  style={styles.attachmentPreviewItem}
                >
                  {renderAttachmentPreview(attachment, false)}
                  <TouchableOpacity
                    style={[styles.attachmentCloseButton, { backgroundColor: dangerColor }]}
                    onPress={() => {
                      setAttachments(attachments.filter((_, i) => i !== index));
                    }}
                  >
                    <Ionicons name="close" size={fontPixel(14)} color={isDark ? colors.dark.black : colors.light.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.inputRow}>
            <TouchableOpacity onPress={handleAttachmentSheetOpen}>
              <Ionicons name="attach-outline" size={fontPixel(24)} color={primaryColor} />
            </TouchableOpacity>
            
            <View
              style={[
                styles.textInputContainer,
                { 
                  borderColor: borderColor,
                  backgroundColor: inputBackgroundColor,
                }
              ]}
            >
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Message"
                placeholderTextColor={subTextColor}
                style={[
                  styles.textInput,
                  { color: textColor }
                ]}
                multiline
                scrollEnabled
                selectionColor={primaryColor}
                cursorColor={primaryColor}
              />
            </View>

            <TouchableOpacity
              onPress={sendMessage}
              disabled={inputText.trim() === '' && attachments.length === 0}
              style={[
                styles.sendButton,
                {
                  backgroundColor: isDark ? colors.dark.white : colors.light.black,
                  borderColor: isDark ? colors.dark.white : colors.light.black,
                  opacity: inputText.trim() === '' && attachments.length === 0 
                    ? 0.5 
                    : 1,
                }
              ]}
            >
              <Ionicons
                name="send"
                size={fontPixel(24)}
                color={inputText.trim() === '' && attachments.length === 0 
                  ? greyColor 
                  : (isDark ? colors.dark.black : colors.light.white)}
              />
            </TouchableOpacity>
          </View>
        </ThemedView>
      </KeyboardAvoidingView>

      {isAttachmentSheetOpen && (
        <Modal
          visible={isAttachmentSheetOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={handleAttachmentSheetClose}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
            <TouchableWithoutFeedback onPress={handleAttachmentSheetClose}>
              <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>
            <BottomSheet
              ref={attachmentSheetRef}
              index={0}
              snapPoints={snapPoints}
              onChange={handleSheetChanges}
              onClose={handleAttachmentSheetClose}
              enablePanDownToClose={true}
              enableDynamicSizing={false}
              backgroundStyle={{
                backgroundColor,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderTopWidth: 0.5,
                borderColor,
              }}
            >
              <BottomSheetView style={[styles.attachmentSheetContent, { backgroundColor }]}>
                <View style={styles.attachmentSheetHeader}>
                  <View style={styles.attachmentSheetHeaderLeft}>
                    <View style={[styles.attachmentSheetAccentBar, { backgroundColor: borderColor }]} />
                    <ThemedText style={[styles.attachmentSheetLabel, { color: labelColor }]}>ATTACHMENT OPTIONS</ThemedText>
                    <ThemedText 
                      style={[styles.attachmentSheetTitle, { color: textColor }]} 
                      lightColor={colors.light.text} 
                      darkColor={colors.dark.text}
                    >
                      Attachment Options
                    </ThemedText>
                  </View>
                  <BackButton iconName="x" onPress={handleAttachmentSheetClose} containerStyle={styles.attachmentSheetCloseButton} />
                </View>

                <View style={styles.attachmentOptionsContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.attachmentOptionButton, 
                      { 
                        borderColor,
                        backgroundColor,
                      }
                    ]}
                    onPress={() => {
                      handleAttachmentSheetClose();
                      pickImage();
                    }}
                  >
                    <Ionicons name="image-outline" size={fontPixel(18)} color={textColor} />
                    <ThemedText 
                      style={[styles.attachmentOptionText, { color: textColor }]} 
                      lightColor={colors.light.text} 
                      darkColor={colors.dark.text}
                    >
                      SELECT FROM GALLERY
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.attachmentOptionButton, 
                      { 
                        borderColor,
                        backgroundColor,
                      }
                    ]}
                    onPress={() => {
                      handleAttachmentSheetClose();
                      pickDocument();
                    }}
                  >
                    <Ionicons name="document-text-outline" size={fontPixel(18)} color={textColor} />
                    <ThemedText 
                      style={[styles.attachmentOptionText, { color: textColor }]} 
                      lightColor={colors.light.text} 
                      darkColor={colors.dark.text}
                    >
                      SELECT DOCUMENT
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[
                      styles.attachmentOptionButton, 
                      { 
                        borderColor,
                        backgroundColor,
                      }
                    ]}
                    onPress={() => {
                      handleAttachmentSheetClose();
                      takePhoto();
                    }}
                  >
                    <Ionicons name="camera-outline" size={fontPixel(18)} color={textColor} />
                    <ThemedText 
                      style={[styles.attachmentOptionText, { color: textColor }]} 
                      lightColor={colors.light.text} 
                      darkColor={colors.dark.text}
                    >
                      TAKE A PHOTO
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </BottomSheetView>
            </BottomSheet>
          </View>
        </Modal>
      )}
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
    marginBottom: heightPixel(20),
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
  messageWrapper: {
    width: '100%',
    marginBottom: heightPixel(12),
  },
  messageWrapperLeft: {
    alignItems: 'flex-start',
  },
  messageWrapperRight: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: widthPixel(16),
    paddingVertical: heightPixel(12),
    borderWidth: 0.5,
    borderRadius: 0,
  },
  messageText: {
    fontSize: fontPixel(15),
    fontFamily: 'Regular',
    lineHeight: fontPixel(22),
  },
  attachmentsContainer: {
    marginTop: heightPixel(8),
  },
  inputContainer: {
    paddingVertical: heightPixel(16),
    paddingHorizontal: widthPixel(16),
    borderTopWidth: 0.5,
    paddingBottom: Platform.OS === 'ios' ? heightPixel(16) : heightPixel(16),
  },
  attachmentsPreview: {
    marginBottom: heightPixel(8),
    paddingTop: heightPixel(8),
  },
  attachmentsPreviewContent: {
    gap: widthPixel(8),
    paddingHorizontal: widthPixel(4),
  },
  attachmentPreviewItem: {
    width: widthPixel(60),
    height: heightPixel(60),
    position: 'relative',
  },
  attachmentCloseButton: {
    position: 'absolute',
    top: -heightPixel(8),
    right: -widthPixel(8),
    borderRadius: 0,
    width: widthPixel(20),
    height: heightPixel(20),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(8),
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 0,
    borderWidth: 0.5,
    paddingHorizontal: widthPixel(16),
    paddingVertical: heightPixel(8),
    minHeight: heightPixel(40),
    maxHeight: heightPixel(100),
  },
  textInput: {
    flex: 1,
    fontSize: fontPixel(15),
    fontFamily: 'Regular',
  },
  sendButton: {
    width: widthPixel(40),
    height: widthPixel(40),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderRadius: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  attachmentSheetContent: {
    flex: 1,
    paddingTop: heightPixel(20),
    paddingBottom: heightPixel(20),
    overflow: 'hidden',
  },
  attachmentSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(24),
  },
  attachmentSheetHeaderLeft: {
    flex: 1,
  },
  attachmentSheetAccentBar: {
    width: widthPixel(40),
    height: heightPixel(4),
    marginBottom: heightPixel(16),
  },
  attachmentSheetLabel: {
    fontSize: fontPixel(10),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
    marginBottom: heightPixel(8),
  },
  attachmentSheetTitle: {
    fontSize: fontPixel(24),
    fontFamily: 'Bold',
    letterSpacing: -0.5,
    lineHeight: fontPixel(28),
  },
  attachmentSheetCloseButton: {
    marginTop: heightPixel(8),
  },
  attachmentOptionsContainer: {
    paddingHorizontal: widthPixel(16),
    gap: heightPixel(12),
  },
  attachmentOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(12),
    paddingVertical: heightPixel(16),
    paddingHorizontal: widthPixel(16),
    borderWidth: 0.5,
    borderRadius: 0,
  },
  attachmentOptionText: {
    fontSize: fontPixel(14),
    fontFamily: 'SemiBold',
    letterSpacing: 1,
  },
});
