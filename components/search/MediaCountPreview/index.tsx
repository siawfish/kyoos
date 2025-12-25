import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { fontPixel, widthPixel } from '@/constants/normalize';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { Media, MediaType } from '@/redux/app/types';
import { useMemo } from 'react';

export default function MediaCountPreview({
    media,
    onRemove
}:{
    media: Media[];
    onRemove?: () => void;
}) {

    const characterCountBackgroundColor = useThemeColor({
      light: 'rgba(255, 255, 255, 0.9)',
      dark: 'rgba(0, 0, 0, 0.7)',
    }, 'background');
  
    const secondaryTextColor = useThemeColor({
      light: colors.light.secondary,
      dark: colors.dark.secondary,
    }, 'secondary');

    const tintColor = useThemeColor({
      light: colors.light.tint,
      dark: colors.dark.tint,
    }, 'tint');

    const images = useMemo(() => media.filter((item) => item.type === MediaType.IMAGE), [media]);
    const videos = useMemo(() => media.filter((item) => item.type === MediaType.VIDEO), [media]);   
      
    return (
        <View style={styles.mediaCountContainer}>
            {
                images.length > 0 && (
                    <View style={[styles.mediaCount, { backgroundColor: characterCountBackgroundColor }]}>
                        <ThemedText style={styles.mediaCountText} lightColor={secondaryTextColor} darkColor={secondaryTextColor}>
                            {images.length} {images.length === 1 ? 'image' : 'images'}
                        </ThemedText>
                    </View>
                )
            }
            {
                onRemove && (
                    <TouchableOpacity 
                        style={[styles.removeButton, { backgroundColor: characterCountBackgroundColor }]}
                        onPress={onRemove}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                       <ThemedText style={styles.removeButtonText} lightColor={secondaryTextColor} darkColor={secondaryTextColor}>
                            Remove
                       </ThemedText>
                    </TouchableOpacity>
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    mediaCountContainer: {
        flexDirection: 'row',
        gap: widthPixel(4),
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        top: widthPixel(8),
        right: widthPixel(10),
        left: widthPixel(10),
    },
    mediaCount: {
        paddingHorizontal: widthPixel(8),
        paddingVertical: widthPixel(4),
        borderRadius: 8,
    },
    mediaCountText: {
        fontSize: fontPixel(12),
        fontFamily: 'CabinetGrotesk-Regular',
    },
    removeButtonText: {
        fontSize: fontPixel(12),
        fontFamily: 'CabinetGrotesk-Regular',
        color: colors.light.danger,
    },
    removeButton: {
        paddingHorizontal: widthPixel(6),
        paddingVertical: widthPixel(4),
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
});