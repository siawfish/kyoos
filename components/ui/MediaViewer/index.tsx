import Actions from "@/components/portfolio/Portfolio/Actions";
import User from "@/components/portfolio/User";
import DocumentViewer from "@/components/ui/DocumentViewer";
import { isDocument, isImage, isVideo } from "@/constants/helpers";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Portfolio } from "@/redux/portfolio/types";
import { Media } from "@/redux/app/types";
import { LinearGradient } from "expo-linear-gradient";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    NativeScrollEvent,
    NativeSyntheticEvent,
    ScrollView,
    StyleSheet,
    View
} from "react-native";
import BackButton from "../BackButton";
import { ThemedText } from "../Themed/ThemedText";
import { useThemeColor } from "@/hooks/use-theme-color";

interface MediaViewerProps {
    readonly visible: boolean;
    readonly media: Media | null;
    readonly onClose: () => void;
    readonly allMedia?: Media[];
    readonly initialIndex?: number;
    readonly portfolio?: Portfolio | null;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MediaViewer = ({
    visible,
    media,
    onClose,
    allMedia = [],
    initialIndex = 0,
    portfolio,
}: MediaViewerProps) => {
    const colorScheme = useAppTheme();
    const isDark = colorScheme === "dark";
    const backgroundColor = useThemeColor(
        { light: colors.light.background, dark: colors.dark.background },
        "background"
    );
    const textColor = useThemeColor(
        { light: colors.light.text, dark: colors.dark.text },
        "text"
    );
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const mediaList = allMedia.length > 0 ? allMedia : (media ? [media] : []);

    useEffect(() => {
        if (visible && scrollViewRef.current && mediaList.length > 0) {
            const index = Math.min(initialIndex, mediaList.length - 1);
            scrollViewRef.current.scrollTo({
                x: index * SCREEN_WIDTH,
                animated: false,
            });
            setCurrentIndex(index);
        }
    }, [visible, initialIndex, mediaList.length]);

    if (!visible || mediaList.length === 0) return null;

    const handleScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / SCREEN_WIDTH);
        setCurrentIndex(index);
    };

    const handleClose = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        // if user scroll up, close the viewer
        if (event.nativeEvent.contentOffset.y < -10) {
            onClose();
        }
    };

    const renderMediaItem = (item: Media, index: number) => {
        const itemKey = item.id || `media-${index}`;
        
        if (!item.type) {
            // Fallback to image if type is not specified
            return (
                <View key={itemKey} style={styles.mediaItem}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        maximumZoomScale={3}
                        minimumZoomScale={1}
                        onScroll={handleClose}
                    >
                        <Image
                            source={{ uri: item.url }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </ScrollView>
                </View>
            );
        }

        if (isImage(item.type)) {
            return (
                <View key={itemKey} style={styles.mediaItem}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        maximumZoomScale={3}
                        minimumZoomScale={1}
                        onScroll={handleClose}
                    >
                        <Image
                            source={{ uri: item.url }}
                            style={styles.image}
                            resizeMode="contain"
                        />
                    </ScrollView>
                </View>
            );
        }

        if (isVideo(item.type)) {
            return (
                <View key={itemKey} style={styles.mediaItem}>
                    <VideoViewer uri={item.url} isActive={currentIndex === index} />
                </View>
            );
        }

        if (isDocument(item.type)) {
            return (
                <View key={itemKey} style={styles.mediaItem}>
                    <DocumentViewer document={item} isActive={currentIndex === index} />
                </View>
            );
        }

        // Fallback to image
        return (
            <View key={itemKey} style={styles.mediaItem}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    maximumZoomScale={3}
                    minimumZoomScale={1}
                    onScroll={handleClose}
                >
                    <Image
                        source={{ uri: item.url }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </ScrollView>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor }]}>
                <View style={styles.header}>
                    <BackButton onPress={onClose} iconName="arrow-left" />
                </View>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScroll}
                    scrollEventThrottle={16}
                    style={styles.carousel}
                >
                    {mediaList.map((item, index) => renderMediaItem(item, index))}
                </ScrollView>
                {portfolio && (
                    <View style={styles.overlay}>
                        <LinearGradient
                            colors={isDark ? ['transparent', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)'] : ['transparent', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.95)']}
                            style={styles.gradient}
                        >
                            <View style={styles.overlayContent}>
                                <User
                                    name={portfolio?.createdBy?.name as string}
                                    avatar={portfolio?.createdBy?.avatar as string}
                                    createdAt={portfolio.createdAt}
                                />
                                {portfolio.description && (
                                    <ThemedText
                                        style={[styles.description, { color: textColor }]}
                                    >
                                        {portfolio.description}
                                    </ThemedText>
                                )}
                                <Actions
                                    portfolio={portfolio}
                                    onComment={onClose}
                                />
                            </View>
                        </LinearGradient>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const VideoViewer = ({ uri, isActive }: { uri: string; isActive: boolean }) => {
    const player = useVideoPlayer(uri, (player) => {
        player.muted = false;
    });

    useEffect(() => {
        if (isActive) {
            player.play();
        } else {
            player.pause();
        }
    }, [isActive, player]);

    return (
        <View style={styles.videoContainer}>
            <VideoView
                player={player}
                contentFit="contain"
                nativeControls={true}
                style={styles.video}
            />
        </View>
    );
};

export default MediaViewer;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        position: "absolute",
        top: heightPixel(70),
        left: widthPixel(20),
        zIndex: 10,
    },
    carousel: {
        flex: 1,
    },
    overlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
    },
    gradient: {
        width: "100%",
        paddingTop: heightPixel(40),
        paddingBottom: heightPixel(40),
        paddingHorizontal: widthPixel(20),
    },
    overlayContent: {
        gap: heightPixel(12),
    },
    description: {
        fontFamily: "Regular",
        fontSize: fontPixel(15),
        lineHeight: fontPixel(22),
    },
    mediaItem: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: SCREEN_WIDTH,
        minHeight: SCREEN_HEIGHT,
    },
    image: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    videoContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
    },
    video: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
});

