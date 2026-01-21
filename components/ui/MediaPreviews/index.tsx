import { heightPixel, widthPixel } from "@/constants/normalize";
import { Media, MimeType } from "@/redux/app/types";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from 'expo-video';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

interface MediaPreviewsProps {
  media: Media[];
  backgroundColor: string;
  tintColor: string;
  onRemove?: (index: number) => void;
  containerStyle?: ViewStyle;
}

const VideoThumbnail = ({ uri }: { uri: string }) => {
  const player = useVideoPlayer(uri, (player) => {
    player.muted = true;
    // Don't autoplay for preview thumbnails
  });

  return (
    <View style={styles.mediaPreviewImage}>
      <VideoView 
        player={player} 
        contentFit="cover"
        style={styles.mediaPreviewImage}
      />
      <View style={styles.videoOverlay}>
        <Ionicons name="play-circle" size={16} color="white" />
      </View>
    </View>
  );
};

export default function MediaPreviews({ 
  media, 
  backgroundColor, 
  tintColor,
  onRemove,
  containerStyle
}: MediaPreviewsProps) {
  if (!media || media.length === 0) return null;

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={[styles.mediaPreviewContainer, containerStyle]}
      contentContainerStyle={[styles.mediaPreviewContent, containerStyle]}
    >
      {media.map((item, index) => (
        <View key={index} style={[styles.mediaPreview, { backgroundColor }]}>
          {item.type === MimeType.JPEG || item.type === MimeType.PNG || item.type === MimeType.GIF ? (
            <Image
              source={{ uri: item.url }}
              style={styles.mediaPreviewImage}
              resizeMode="cover"
            />
          ) : (
            <VideoThumbnail uri={item.url} />
          )}
          {onRemove && (
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => onRemove(index)}
            >
              <Ionicons name="close-circle" size={16} color={tintColor} />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    mediaPreviewContainer: {
      maxHeight: heightPixel(80),
    },
    mediaPreviewContent: {
      gap: widthPixel(8),
      paddingHorizontal: widthPixel(16),
    },
    mediaPreview: {
      width: widthPixel(60),
      height: widthPixel(60),
      borderRadius: widthPixel(8),
      overflow: 'hidden',
    },
    mediaPreviewImage: {
      width: '100%',
      height: '100%',
    },
    videoOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    removeButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: 'white',
      borderRadius: 10,
    },
}); 