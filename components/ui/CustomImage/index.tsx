import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useState, memo } from 'react';
import { DimensionValue, StyleSheet, TouchableOpacity, View } from 'react-native';

interface CustomImageProps {
    readonly source?: string;
    readonly width?: DimensionValue;
    readonly height?: DimensionValue;
    readonly onPress?: () => void;
}

const CustomImage = ({
    source,
    width,
    height,
    onPress,
}:CustomImageProps) => {
    const [error, setError] = useState(false);
    const color = useThemeColor({ light: colors.light.white, dark: colors.dark.white }, 'text');
    const backgroundColor = useThemeColor({ light: colors.light.grey, dark: colors.dark.grey }, 'background');

    const handleError = useCallback(() => setError(true), []);
    const handleLoad = useCallback(() => setError(false), []);

    const containerStyle = {
        ...styles.container,
        width,
        height,
        backgroundColor,
    };
    const imageSource = source ? { uri: source } : undefined;
    const imageRecyclingKey = source || undefined;

    const imageContent = (
        <>
            {error && (
                <View style={styles.center}>
                    <MaterialIcons name="broken-image" size={24} color={color} />
                </View>
            )}
            <Image
                style={styles.img}
                source={imageSource}
                onError={handleError}
                onLoad={handleLoad}
                cachePolicy="memory-disk"
                transition={120}
                contentFit="cover"
                recyclingKey={imageRecyclingKey}
                pointerEvents="none"
            />
        </>
    );

    if (onPress) {
        return (
            <TouchableOpacity style={containerStyle} onPress={onPress} activeOpacity={0.8}>
                {imageContent}
            </TouchableOpacity>
        );
    }

    return <View style={containerStyle}>{imageContent}</View>;
}

const arePropsEqual = (prevProps: CustomImageProps, nextProps: CustomImageProps) => {
    // If source hasn't changed, don't rerender
    if (prevProps.source !== nextProps.source) {
        return false;
    }
    // Also check other props for completeness
    return (
        prevProps.width === nextProps.width &&
        prevProps.height === nextProps.height &&
        prevProps.onPress === nextProps.onPress
    );
};

export default memo(CustomImage, arePropsEqual)

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        flex: 1,
    },
    img: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    center: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 2,
    }
})