import CustomImage from "@/components/ui/CustomImage";
import DocumentViewer from "@/components/ui/DocumentViewer";
import MediaViewer from "@/components/ui/MediaViewer";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { isDocument, isImage, isVideo } from "@/constants/helpers";
import { heightPixel, widthPixel } from "@/constants/normalize";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Portfolio } from "@/redux/portfolio/types";
import { Media } from "@/redux/app/types";
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useState } from "react";
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

interface ThumbnailsProps {
    readonly onPress?: (id: string) => void;
    readonly onViewMore?: () => void;
    readonly containerStyle?: StyleProp<ViewStyle>;
    readonly portfolio?: Portfolio | null;
}

interface MediaThumbnailProps {
    readonly media: Media;
    readonly onPress?: () => void;
}

const VideoThumbnail = ({ uri, onPress }: { uri: string; onPress?: () => void }) => {
    const player = useVideoPlayer(uri, (player) => {
        player.loop = true;
        player.muted = true;
        
        player.play();
    });

    return (
        <TouchableOpacity onPress={onPress} style={styles.mediaContainer}>
            <VideoView player={player} style={styles.video} contentFit="cover" />
            <View style={styles.playOverlay}>
                <Ionicons name="play-circle" size={24} color="#fff" />
            </View>
        </TouchableOpacity>
    );
};

const DocumentThumbnail = ({ media, onPress }: { media: Media; onPress?: () => void }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[styles.mediaContainer, styles.documentContainer]}
            activeOpacity={0.9}
        >
            <DocumentViewer document={media} thumbnail={true} isActive={true} />
        </TouchableOpacity>
    );
};

const MediaThumbnail = ({ media, onPress }: MediaThumbnailProps) => {
    if (!media.type) {
        // Fallback to image if type is not specified
        return (
            <CustomImage
                source={media.url}
                width="100%"
                height="100%"
                onPress={onPress}
            />
        );
    }

    if (isImage(media.type)) {
        return (
            <CustomImage
                source={media.url}
                width="100%"
                height="100%"
                onPress={onPress}
            />
        );
    }

    if (isVideo(media.type)) {
        return <VideoThumbnail uri={media.url} onPress={onPress} />;
    }

    if (isDocument(media.type)) {
        return <DocumentThumbnail media={media} onPress={onPress} />;
    }

    // Fallback to image for unknown types
    return (
        <CustomImage
            source={media.url}
            width="100%"
            height="100%"
            onPress={onPress}
        />
    );
};

const Thumbnails = ({
    onPress,
    onViewMore,
    containerStyle,
    portfolio,
}:ThumbnailsProps) => {
    const data = portfolio?.assets || [];
    const backgroundColor = useThemeColor({ light: '', dark: '' }, 'background');
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [initialIndex, setInitialIndex] = useState(0);

    const handleMediaPress = (media: Media) => {
        if (onPress) {
            // If onPress prop is provided, call it for backward compatibility
            onPress(media.id as string);
        } else {
            // Otherwise, open the internal viewer
            const index = data.findIndex((item) => item.id === media.id);
            setInitialIndex(index >= 0 ? index : 0);
            setSelectedMedia(media);
            setIsViewerOpen(true);
        }
    };

    const handleCloseViewer = () => {
        setIsViewerOpen(false);
        setSelectedMedia(null);
        setInitialIndex(0);
    };

    return (
        <>
            <View style={[styles.container, containerStyle]}>
                {
                    data?.[0] &&
                    <View style={styles.mainMedia}>
                        <MediaThumbnail
                            media={data[0]}
                            onPress={() => handleMediaPress(data[0])}
                        />
                    </View>
                }
                {
                    data?.length > 1 &&
                    <View style={styles.stack}>
                        {
                            data?.[1] && (
                                <View style={data?.length > 2 ? styles.stackItemHalf : styles.stackItemFull}>
                                    <MediaThumbnail
                                        media={data[1]}
                                        onPress={() => handleMediaPress(data[1])}
                                    />
                                </View>
                            )
                        }
                        {
                            data?.length > 2 && (
                                <View style={styles.stackItemHalf}>
                                    {
                                        data?.[2] && (
                                            <MediaThumbnail
                                                media={data[2]}
                                                onPress={() => handleMediaPress(data[2])}
                                            />
                                        )
                                    }
                                    {
                                        data?.length > 3 && (
                                            <TouchableOpacity 
                                                onPress={onViewMore}
                                                style={[styles.remaining, { backgroundColor }]}
                                            >
                                                <ThemedText type="title">
                                                    +{data?.length - 3}
                                                </ThemedText>
                                            </TouchableOpacity>
                                        )
                                    }
                                </View>
                            )
                        }
                    </View>
                }
            </View>
            <MediaViewer
                visible={isViewerOpen}
                media={selectedMedia}
                onClose={handleCloseViewer}
                allMedia={data}
                initialIndex={initialIndex}
                portfolio={portfolio}
            />
        </>
    );
};

export default Thumbnails;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: heightPixel(200),
        flexDirection: "row",
        justifyContent: "space-evenly",
        gap: 3,
        borderRadius: 0,
        overflow: "hidden",
    },
    mainMedia: {
        flex: 1,
        position: "relative",
        overflow: "hidden",
    },
    stack: {
        flex: 1,
        height: "100%",
        flexDirection: "column",
        gap: 3,
    },
    stackItemFull: {
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "hidden",
    },
    stackItemHalf: {
        position: "relative",
        height: "49%",
        width: "100%",
        overflow: "hidden",
    },
    remaining: {
        position: "absolute",
        bottom: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
        padding: widthPixel(10),
        borderRadius: 0,
    },
    mediaContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
    },
    video: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    playOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.2)",
    },
    documentContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
});
