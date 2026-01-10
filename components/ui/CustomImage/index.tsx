import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState, memo } from 'react';
import { ActivityIndicator, DimensionValue, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const color = useThemeColor({ light: colors.light.white, dark: colors.dark.white }, 'text');
    const backgroundColor = useThemeColor({ light: colors.light.grey, dark: colors.dark.grey }, 'background');
    return (
        <TouchableOpacity
            style={{
                ...styles.container,
                width,
                height,
                backgroundColor,
            }}
            onPress={onPress}
        >
            {
                loading && (
                    <View style={styles.center}>
                        <ActivityIndicator size="small" />
                    </View>
                )
            }
            {
                error && (
                    <View style={styles.center}>
                        <MaterialIcons name="broken-image" size={24} color={color} />
                    </View>
                )
            }
            <Image
                style={styles.img}
                source={{uri: source}}
                onLoadStart={() => {
                    setLoading(true);
                    setError(false);
                }}
                onLoadEnd={() => setLoading(false)}
                onError={() => setError(true)}
            />
        </TouchableOpacity>
    )
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