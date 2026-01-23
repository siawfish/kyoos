import { ThemedText } from '@/components/ui/Themed/ThemedText';
import MediaViewer from '@/components/ui/MediaViewer';
import { formatTime } from '@/constants/helpers';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MimeType } from '@/redux/app/types';
import { Asset, Message, MessageStatus } from '@/redux/messaging/types';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { memo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ImageStyle,
  StyleSheet,
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

export interface MessageBubbleProps {
  message: Message;
  currentUserId: string | undefined;
  onRetry: (message: Message) => void;
  onRemoveFailed: (message: Message) => void;
}

function MessageBubbleInner({
  message,
  currentUserId,
  onRetry,
  onRemoveFailed,
}: MessageBubbleProps) {
  const appTheme = useAppTheme();
  const isDark = appTheme === 'dark';
  const textColor = useThemeColor({ light: colors.light.text, dark: colors.dark.text }, 'text');
  const whiteColor = useThemeColor({ light: colors.light.white, dark: colors.dark.black }, 'white');
  const primaryColor = useThemeColor({ light: colors.light.tint, dark: colors.dark.tint }, 'tint');
  const dangerColor = useThemeColor({ light: colors.light.danger, dark: colors.dark.danger }, 'danger');
  const inputBackgroundColor = useThemeColor({ light: colors.light.white, dark: colors.dark.black }, 'white');
  const borderColor = isDark ? colors.dark.white : colors.light.black;

  const [selectedMedia, setSelectedMedia] = useState<Asset | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const handleMediaPress = (asset: Asset, index: number) => {
    setSelectedMedia(asset);
    setInitialIndex(index);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedMedia(null);
    setInitialIndex(0);
  };

  const isOwnMessage = message.senderId === currentUserId;
  const isPending = message.status === MessageStatus.PENDING;
  const isFailed = message.status === MessageStatus.FAILED;
  const isSent = message.status === MessageStatus.SENT;
  const isDelivered = message.status === MessageStatus.DELIVERED;
  const isRead = message.status === MessageStatus.READ;

  const screenWidth = Dimensions.get('window').width;

  const renderMediaPreview = (
    media: Asset,
    isInMessage: boolean = false,
    forcedWidth?: number
  ) => {
    const isPdf = media.type.toLowerCase().includes('pdf');
    const isVideo =
      media.type.toLowerCase().includes('video') ||
      media.type.toLowerCase().includes('mp4') ||
      media.type.toLowerCase().includes('mov');

    const containerStyle: ViewStyle = isInMessage
      ? {
          width: forcedWidth,
          height: isPdf ? 'auto' : forcedWidth,
          borderRadius: 0,
          overflow: 'hidden',
          backgroundColor: inputBackgroundColor,
          borderWidth: 0.5,
          borderColor,
        }
      : {
          width: widthPixel(60),
          height: heightPixel(60),
          borderRadius: 0,
          overflow: 'hidden',
          borderWidth: 0.5,
          borderColor,
        };

    const mediaStyle = isInMessage
      ? { width: '100%' as const, height: '100%' as const, borderRadius: 0 }
      : { width: '100%' as const, height: '100%' as const };

    if (isPdf) {
      return (
        <View
          style={[
            containerStyle,
            {
              backgroundColor: inputBackgroundColor,
              paddingHorizontal: isInMessage ? widthPixel(12) : widthPixel(4),
              paddingVertical: isInMessage ? heightPixel(12) : heightPixel(4),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: isInMessage ? 'flex-start' : 'center',
            } as ViewStyle,
          ]}
        >
          <Ionicons
            name="document-text"
            size={isInMessage ? 24 : 20}
            color={dangerColor}
          />
          {isInMessage && (
            <ThemedText style={{ marginLeft: widthPixel(8), flex: 1 }} numberOfLines={1}>
              PDF Document
            </ThemedText>
          )}
        </View>
      );
    }

    if (isVideo) {
      return (
        <View style={containerStyle}>
          <VideoPlayer
            uri={media.url}
            contentFit={isInMessage ? 'contain' : 'cover'}
            showControls={isInMessage}
            autoPlay={false}
            style={mediaStyle as ViewStyle}
          />
          {!isInMessage && (
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
          )}
        </View>
      );
    }

    return (
      <View style={containerStyle}>
        <Image
          source={{ uri: media.url }}
          style={mediaStyle as ImageStyle}
          resizeMode="cover"
        />
      </View>
    );
  };

  const renderMediaGrid = (mediaItems: Asset[]) => {
    if (!mediaItems || mediaItems.length === 0) return null;

    const itemsPerRow =
      mediaItems.length === 1 ? 1 : mediaItems.length === 2 ? 2 : mediaItems.length === 3 ? 3 : 2;
    const containerWidth = Math.min(screenWidth * 0.6, 250);
    const spacing = widthPixel(2);
    const itemWidth = (containerWidth - spacing * (itemsPerRow - 1)) / itemsPerRow;
    const rows = Math.ceil(mediaItems.length / itemsPerRow);

    return (
      <View
        style={{
          width: containerWidth,
          gap: spacing,
          alignSelf: 'flex-start',
        }}
      >
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <View
            key={rowIndex}
            style={{
              flexDirection: 'row',
              gap: spacing,
              justifyContent: 'flex-start',
            }}
          >
            {mediaItems
              .slice(rowIndex * itemsPerRow, (rowIndex + 1) * itemsPerRow)
              .map((item, index) => {
                const globalIndex = rowIndex * itemsPerRow + index;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleMediaPress(item, globalIndex)}
                    activeOpacity={1}
                    style={{
                      width: itemWidth,
                      height:
                        item.type === MimeType.PDF.toString()
                          ? heightPixel(60)
                          : itemWidth,
                    }}
                  >
                    {renderMediaPreview(item, true, itemWidth)}
                  </TouchableOpacity>
                );
              })}
          </View>
        ))}
      </View>
    );
  };

  const renderMessageStatus = () => {
    if (!isOwnMessage) return null;

    if (isPending) {
      return (
        <View style={styles.messageStatus}>
          <ActivityIndicator
            size="small"
            color={whiteColor}
            style={{ transform: [{ scale: 0.6 }] }}
          />
          <ThemedText style={[styles.sendingText, { color: whiteColor }]}>
            Sending...
          </ThemedText>
        </View>
      );
    }

    if (isFailed) {
      return (
        <TouchableOpacity style={styles.messageStatus} onPress={() => onRetry(message)}>
          <Ionicons name="alert-circle" size={fontPixel(14)} color={dangerColor} />
        </TouchableOpacity>
      );
    }

    if (isRead) {
      return (
        <View style={styles.messageStatus}>
          <ThemedText style={[styles.timeText, { color: whiteColor }]}>
            {formatTime(message.sentAt)}
          </ThemedText>
          <Ionicons name="checkmark-done" size={fontPixel(14)} color={whiteColor} />
        </View>
      );
    }

    if (isDelivered) {
      return (
        <View style={styles.messageStatus}>
          <ThemedText style={[styles.timeText, { color: whiteColor }]}>
            {formatTime(message.sentAt)}
          </ThemedText>
          <Ionicons
            name="checkmark-done-outline"
            size={fontPixel(14)}
            color={whiteColor}
            style={{ opacity: 0.8 }}
          />
        </View>
      );
    }

    if (isSent) {
      return (
        <View style={styles.messageStatus}>
          <ThemedText style={[styles.timeText, { color: whiteColor }]}>
            {formatTime(message.sentAt)}
          </ThemedText>
          <Ionicons name="checkmark" size={fontPixel(14)} color={whiteColor} />
        </View>
      );
    }

    return null;
  };

  const allMediaAsMedia = (message.media || []).map((a) => ({
    id: a.id,
    url: a.url,
    type: a.type as MimeType,
  }));

  return (
    <>
      <TouchableOpacity
        activeOpacity={isFailed ? 0.7 : 1}
        onPress={isFailed ? () => onRetry(message) : undefined}
        onLongPress={isFailed ? () => onRemoveFailed(message) : undefined}
        style={[
          styles.messageWrapper,
          isOwnMessage ? styles.messageWrapperRight : styles.messageWrapperLeft,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isOwnMessage ? primaryColor : whiteColor,
              borderColor: isFailed ? dangerColor : borderColor,
              opacity: isPending ? 0.8 : 1,
            },
          ]}
        >
          {message.content && (
            <ThemedText
              style={[styles.messageText, { color: isOwnMessage ? whiteColor : textColor }]}
            >
              {message.content}
            </ThemedText>
          )}

          {message.media && message.media.length > 0 && (
            <View style={styles.attachmentsContainer}>
              {renderMediaGrid(message.media)}
            </View>
          )}

          {isOwnMessage && (
            <View style={styles.messageStatusContainer}>
              {renderMessageStatus()}
              {isFailed && (
                <ThemedText style={[styles.failedText, { color: dangerColor }]}>
                  Tap to retry
                </ThemedText>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
      <MediaViewer
        visible={isViewerOpen}
        media={
          selectedMedia
            ? { id: selectedMedia.id, url: selectedMedia.url, type: selectedMedia.type as MimeType }
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
  messageStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: heightPixel(4),
    gap: widthPixel(4),
  },
  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(4),
  },
  sendingText: {
    fontSize: fontPixel(10),
    fontFamily: 'Regular',
    opacity: 0.8,
  },
  failedText: {
    fontSize: fontPixel(10),
    fontFamily: 'Regular',
  },
  timeText: {
    fontSize: fontPixel(10),
    fontFamily: 'Regular',
    opacity: 0.8,
  },
});

const MessageBubble = memo(MessageBubbleInner);
export default MessageBubble;
