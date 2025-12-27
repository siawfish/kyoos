import { widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'
import { EvilIcons } from '@expo/vector-icons'
import React from 'react'
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity } from 'react-native'

interface ThumbnailProps {
    onPress: () => void;
    imageUri?: string | null;
    isLoading?: boolean;
    disabled?: boolean;
}

const Thumbnail = ({
    onPress,
    imageUri,
    isLoading,
    disabled,
}: ThumbnailProps) => {
    const backgroundColor = useThemeColor({
        light: colors.light.lightTint,
        dark: colors.dark.secondary
    }, 'background');

    return (
        <TouchableOpacity onPress={onPress} style={[styles.thumbnail, {backgroundColor}]} disabled={disabled || isLoading}>
            {isLoading ? (
                <ActivityIndicator size="large" color={colors.light.text} />
            ) : (
                <>
                    {imageUri ? (
                        <Image 
                            source={{ uri: imageUri }} 
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <EvilIcons name="camera" size={40} color={colors.light.text} />
                    )}
                </>
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    thumbnail: {
        width: widthPixel(80),
        height: widthPixel(80),
        borderRadius: 0,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    }
})

export default Thumbnail;
