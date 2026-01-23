import { ThemedView } from '@/components/ui/Themed/ThemedView';
import MediaViewer from '@/components/ui/MediaViewer';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Media, MimeType } from '@/redux/app/types';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import {
  Image,
  ImageStyle,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

const VideoPlayer = ({
  uri,
  contentFit = 'cover',
  showControls = false,
  autoPlay = false,
  style,
}: {
  uri: string;
  contentFit?: 'contain' | 'cover';
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

export interface MessageInputProps {
  inputText: string;
  onInputChange: (text: string) => void;
  attachments: Media[];
  onRemoveAttachment: (index: number) => void;
  onAttachmentSheetOpen: () => void;
  onSend: () => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  maxAttachments?: number;
  placeholder?: string;
  disabled?: boolean;
}

const DEFAULT_MAX_ATTACHMENTS = 5;

function MessageInput({
  inputText,
  onInputChange,
  attachments,
  onRemoveAttachment,
  onAttachmentSheetOpen,
  onSend,
  onTypingStart,
  onTypingStop,
  maxAttachments = DEFAULT_MAX_ATTACHMENTS,
  placeholder = 'Message',
  disabled = false,
}: MessageInputProps) {
  const appTheme = useAppTheme();
  const isDark = appTheme === 'dark';
  const textColor = useThemeColor({ light: colors.light.text, dark: colors.dark.text }, 'text');
  const primaryColor = useThemeColor({ light: colors.light.tint, dark: colors.dark.tint }, 'tint');
  const greyColor = useThemeColor({ light: colors.light.misc, dark: colors.dark.misc }, 'misc');
  const dangerColor = useThemeColor({ light: colors.light.danger, dark: colors.dark.danger }, 'danger');
  const subTextColor = useThemeColor({ light: colors.light.secondary, dark: colors.dark.secondary }, 'secondary');
  const inputBackgroundColor = useThemeColor({ light: colors.light.white, dark: colors.dark.black }, 'white');
  const borderColor = isDark ? colors.dark.white : colors.light.black;

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Media | null>(null);
  const [initialIndex, setInitialIndex] = useState(0);

  const handlePreviewPress = (attachment: Media, index: number) => {
    setSelectedAttachment(attachment);
    setInitialIndex(index);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedAttachment(null);
    setInitialIndex(0);
  };

  const canSend = inputText.trim() !== '' || attachments.length > 0;
  const atAttachmentLimit = attachments.length >= maxAttachments;

  const renderAttachmentPreview = (attachment: Media) => {
    const mediaSource = attachment.uri || attachment.url;
    const containerStyle: ViewStyle = {
      width: widthPixel(60),
      height: heightPixel(60),
      borderRadius: 0,
      overflow: 'hidden',
      borderWidth: 0.5,
      borderColor,
    };
    const mediaStyle = { width: '100%' as const, height: '100%' as const };

    switch (attachment.type) {
      case MimeType.JPEG:
      case MimeType.JPG:
      case MimeType.PNG:
        return (
          <View style={containerStyle}>
            <Image
              source={{ uri: mediaSource }}
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
              uri={mediaSource || ''}
              contentFit="cover"
              showControls={false}
              autoPlay={false}
              style={mediaStyle as ViewStyle}
            />
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.2)',
              }}
            >
              <Ionicons name="play-circle" size={24} color="#fff" />
            </View>
          </View>
        );
      case MimeType.PDF:
        return (
          <View
            style={[
              containerStyle,
              {
                backgroundColor: inputBackgroundColor,
                paddingHorizontal: widthPixel(4),
                paddingVertical: heightPixel(4),
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              } as ViewStyle,
            ]}
          >
            <Ionicons name="document-text" size={20} color={dangerColor} />
          </View>
        );
      default:
        return null;
    }
  };

  const allMediaAsMedia = attachments.map((a) => ({
    id: a.id,
    url: a.uri || a.url,
    type: a.type,
  }));

  return (
    <>
      <ThemedView
        lightColor={colors.light.white}
        darkColor={colors.dark.black}
        style={[styles.inputContainer, { borderTopColor: borderColor, opacity: disabled ? 0.6 : 1 }]}
      >
        {attachments.length > 0 && (
          <ScrollView
            horizontal
            style={styles.attachmentsPreview}
            contentContainerStyle={styles.attachmentsPreviewContent}
          >
            {attachments.map((attachment, index) => (
              <View key={index} style={styles.attachmentPreviewItem}>
                <Pressable onPress={() => handlePreviewPress(attachment, index)}>
                  {renderAttachmentPreview(attachment)}
                </Pressable>
                <TouchableOpacity
                  style={[styles.attachmentCloseButton, { backgroundColor: dangerColor, opacity: disabled ? 0.5 : 1 }]}
                  onPress={() => onRemoveAttachment(index)}
                  disabled={disabled}
                >
                  <Ionicons
                    name="close"
                    size={fontPixel(14)}
                    color={isDark ? colors.dark.black : colors.light.white}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.inputRow}>
          <TouchableOpacity
            onPress={onAttachmentSheetOpen}
            disabled={atAttachmentLimit || disabled}
            style={{ opacity: (atAttachmentLimit || disabled) ? 0.4 : 1 }}
          >
            <Ionicons name="attach-outline" size={fontPixel(24)} color={primaryColor} />
          </TouchableOpacity>

          <View
            style={[
              styles.textInputContainer,
              {
                borderColor,
                backgroundColor: inputBackgroundColor,
              },
            ]}
          >
            <TextInput
              value={inputText}
              onChangeText={(text) => {
                onInputChange(text);
                if (text.length > 0 && onTypingStart) onTypingStart();
              }}
              onBlur={() => onTypingStop?.()}
              placeholder={placeholder}
              placeholderTextColor={subTextColor}
              style={[styles.textInput, { color: textColor }]}
              multiline
              scrollEnabled
              selectionColor={primaryColor}
              cursorColor={primaryColor}
              editable={!disabled}
            />
          </View>

          <TouchableOpacity
            onPress={onSend}
            disabled={!canSend || disabled}
            style={[
              styles.sendButton,
              {
                backgroundColor: isDark ? colors.dark.white : colors.light.black,
                borderColor: isDark ? colors.dark.white : colors.light.black,
                opacity: (canSend && !disabled) ? 1 : 0.5,
              },
            ]}
          >
            <Ionicons
              name="send"
              size={fontPixel(24)}
              color={(canSend && !disabled) ? (isDark ? colors.dark.black : colors.light.white) : greyColor}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>
      <MediaViewer
        visible={isViewerOpen}
        media={
          selectedAttachment
            ? {
                id: selectedAttachment.id,
                url: selectedAttachment.uri || selectedAttachment.url,
                type: selectedAttachment.type,
              }
            : null
        }
        onClose={handleCloseViewer}
        allMedia={allMediaAsMedia}
        initialIndex={initialIndex}
      />
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    paddingVertical: heightPixel(16),
    paddingHorizontal: widthPixel(16),
    borderTopWidth: 0.5,
    paddingBottom: heightPixel(16),
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
});

export default MessageInput;
