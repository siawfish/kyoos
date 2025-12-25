'use client';

import { useState, useRef } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput, 
  Dimensions, 
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  ImageStyle
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedView } from '@/components/ui/Themed/ThemedView';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { colors } from '@/constants/theme/colors';
import { heightPixel, widthPixel, fontPixel } from '@/constants/normalize';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  attachments?: {
    type: 'image' | 'video' | 'pdf';
    uri: string;
    name?: string;
  }[];
}

export default function ConversationScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const whiteColor = useThemeColor({}, 'white');
  const primaryColor = useThemeColor({}, 'tint');
  const greyColor = useThemeColor({}, 'misc');
  const dangerColor = useThemeColor({}, 'danger');
  const subTextColor = useThemeColor({}, 'secondary');
  const inputBackgroundColor = useThemeColor({}, 'white');
  const navButtonBackgroundColor = useThemeColor({}, 'background');

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<{ type: 'image' | 'video' | 'pdf'; uri: string; name?: string }[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  const maxMediaWidth = Math.min(screenWidth * 0.7, 300);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
      });

      if (result.assets && result.assets[0]) {
        setAttachments([...attachments, { 
          type: 'pdf', 
          uri: result.assets[0].uri,
          name: result.assets[0].name
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
      const type = asset.type === 'video' ? 'video' : 'image';
      setAttachments([...attachments, { type, uri: asset.uri }]);
    }
  };

  const sendMessage = () => {
    if (inputText.trim() === '' && attachments.length === 0) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputText,
      sender: 'user',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    setAttachments([]);
    
    // Scroll to bottom after sending message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const VideoPlayer = ({ 
    uri, 
    style, 
    showControls, 
    contentFit 
  }: { 
    uri: string; 
    style: ViewStyle; 
    showControls: boolean;
    contentFit: 'contain' | 'cover';
  }) => {
    const player = useVideoPlayer(uri, (player) => {
      player.muted = !showControls;
      player.loop = false;
    });

    return (
      <VideoView
        player={player}
        style={style}
        contentFit={contentFit}
        nativeControls={showControls}
        allowsFullscreen={showControls}
      />
    );
  };

  const renderMediaGrid = (attachments: Message['attachments']) => {
    if (!attachments) return null;
    
    const itemsPerRow = attachments.length === 1 ? 1 : 
                       attachments.length === 2 ? 2 : 
                       attachments.length === 3 ? 3 : 2;
                       
    const containerWidth = Math.min(screenWidth * 0.6, 250);
    const spacing = widthPixel(2);
    const itemWidth = (containerWidth - (spacing * (itemsPerRow - 1))) / itemsPerRow;
    const rows = Math.ceil(attachments.length / itemsPerRow);
    
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
            {attachments.slice(rowIndex * itemsPerRow, (rowIndex + 1) * itemsPerRow).map((attachment, index) => (
              <View 
                key={index} 
                style={{ 
                  width: itemWidth, 
                  height: attachment.type === 'pdf' ? heightPixel(60) : itemWidth,
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
    attachment: { type: string; uri: string; name?: string }, 
    isInMessage: boolean = false,
    forcedWidth?: number
  ) => {
    const containerStyle: ViewStyle = isInMessage ? {
      width: forcedWidth,
      height: attachment.type === 'pdf' ? 'auto' : forcedWidth,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: inputBackgroundColor,
    } : {
      width: widthPixel(60),
      height: heightPixel(60),
      borderRadius: 4,
      overflow: 'hidden',
    };

    const mediaStyle = isInMessage ? {
      width: '100%',
      height: '100%',
      borderRadius: 8,
    } : {
      width: '100%',
      height: '100%',
    };

    switch (attachment.type) {
      case 'image':
        return (
          <View style={containerStyle}>
            <Image
              source={{ uri: attachment.uri }}
              style={mediaStyle as ImageStyle}
              resizeMode="cover"
            />
          </View>
        );
      case 'video':
        return (
          <View style={containerStyle}>
            <VideoPlayer
              uri={attachment.uri}
              style={mediaStyle as ViewStyle}
              showControls={isInMessage}
              contentFit={isInMessage ? 'contain' : 'cover'}
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
      case 'pdf':
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
                {attachment.name || 'PDF Document'}
              </ThemedText>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ThemedSafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ThemedView style={{ flex: 1 }}>  
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              paddingVertical: heightPixel(16),
              paddingHorizontal: widthPixel(16),
              gap: heightPixel(16) 
          }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={{
                  alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  width: 'auto',
                }}
              >
                <View
                  style={{
                    backgroundColor: message.sender === 'user' ? primaryColor : navButtonBackgroundColor,
                    paddingHorizontal: widthPixel(12),
                    paddingVertical: heightPixel(12),
                    borderRadius: 16,
                    borderBottomRightRadius: message.sender === 'user' ? 4 : 16,
                    borderBottomLeftRadius: message.sender === 'user' ? 16 : 4,
                    width: 'auto',
                  }}
                >
                  {message.content && (
                    <ThemedText
                      type='subtitle'
                      style={{
                        color: message.sender === 'user' ? whiteColor : textColor,
                      }}
                    >
                      {message.content}
                    </ThemedText>
                  )}
                  
                  {message.attachments && message.attachments.length > 0 && (
                    <View style={{ 
                      marginTop: message.content ? heightPixel(8) : 0,
                      width: 'auto',
                    }}>
                      {renderMediaGrid(message.attachments)}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          <ThemedView 
            lightColor={colors.light.white}
            darkColor={colors.dark.black}
            style={{ 
              paddingVertical: heightPixel(16),
              paddingHorizontal: widthPixel(16),
              borderTopWidth: 1, 
              borderTopColor: greyColor,
            }}
          >
            {attachments.length > 0 && (
              <ScrollView
                horizontal
                style={{ marginBottom: heightPixel(8), paddingTop: heightPixel(8) }}
                contentContainerStyle={{ gap: heightPixel(8), paddingHorizontal: widthPixel(4) }}
              >
                {attachments.map((attachment, index) => (
                  <View 
                    key={index} 
                    style={{ 
                      width: widthPixel(60), 
                      height: heightPixel(60),
                      marginTop: heightPixel(8),
                    }}
                  >
                    {renderAttachmentPreview(attachment, false)}
                    <TouchableOpacity
                      style={{
                        position: 'absolute',
                        top: -heightPixel(8),
                        right: -widthPixel(8),
                        backgroundColor: dangerColor,
                        borderRadius: 12,
                        width: widthPixel(20),
                        height: heightPixel(20),
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1,
                      }}
                      onPress={() => {
                        setAttachments(attachments.filter((_, i) => i !== index));
                      }}
                    >
                      <Ionicons name="close" size={fontPixel(14)} color={whiteColor} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <ThemedView 
              lightColor={colors.light.white}
              darkColor={colors.dark.black}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
            >
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={pickImage}>
                  <Ionicons name="image" size={fontPixel(24)} color={primaryColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={pickDocument}>
                  <Ionicons name="document" size={fontPixel(24)} color={primaryColor} />
                </TouchableOpacity>
              </View>
              
              <ThemedView
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 20,
                  paddingHorizontal: widthPixel(16),
                  paddingVertical: heightPixel(8),
                  minHeight: heightPixel(40),
                  maxHeight: heightPixel(100),
                }}
              >
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Message"
                  placeholderTextColor={subTextColor}
                  style={{ 
                    flex: 1, 
                    color: textColor,
                    fontSize: fontPixel(16),
                  }}
                  multiline
                  scrollEnabled
                  selectionColor={primaryColor}
                  cursorColor={primaryColor}
                />
              </ThemedView>

              <TouchableOpacity
                onPress={sendMessage}
                disabled={inputText.trim() === '' && attachments.length === 0}
              >
                <Ionicons
                  name="send"
                  size={24}
                  color={inputText.trim() === '' && attachments.length === 0 ? greyColor : primaryColor}
                />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
}
