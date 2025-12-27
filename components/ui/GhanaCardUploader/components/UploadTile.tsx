import ImagePlaceholder from '@/assets/images/image.png'
import { ConfirmActionSheet } from '@/components/ui/ConfirmActionSheet'
import { ThemedText } from '@/components/ui/Themed/ThemedText'
import { fontPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import React, { useState } from 'react'
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native'

interface UploadTileProps {
    isLoading?: boolean;
    title?: string;
    caption?: string;
    image?: any;
    error?: string;
    onPress?: (option: 'camera' | 'gallery') => void;
    disabled?: boolean;
}

const UploadTile = ({
    isLoading=false,
    image,
    title='Upload the front side of your Ghana Card',
    caption='Ensure the image is clear and all details are visible',
    error,
    onPress,
    disabled
}:UploadTileProps) => {
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

    const handleOptionSelect = (option: 'camera' | 'gallery') => {
        if (onPress) {
            onPress(option);
            setIsBottomSheetOpen(false);
        }
    };

    return (
        <>
            <TouchableOpacity disabled={disabled || isLoading} style={[styles.row, {opacity: isLoading ? 0.5 : 1}]} onPress={() => setIsBottomSheetOpen(true)}>
                <View style={styles.innerRow}>
                    <View style={styles.innerWrapperRow}>
                        <Image style={styles.icon} source={image || ImagePlaceholder} />
                        <View style={styles.textContainer}>
                            <ThemedText
                                type='default'
                                lightColor={colors.light.text} 
                                darkColor={colors.dark.text} 
                                style={styles.subtitle}
                            >
                                {title}
                            </ThemedText>
                            
                            <ThemedText
                                type='subtitle'
                                lightColor={error ? colors.light.danger : colors.light.secondary} 
                                darkColor={error ? colors.dark.danger : colors.dark.secondary} 
                                style={styles.caption}
                            >
                                {error || caption}
                            </ThemedText>
                        </View>
                    </View>

                    {
                        isLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={image ? colors.light.danger : colors.light.green} />
                            </View>
                        )
                    }
                </View>
            </TouchableOpacity>

            <ConfirmActionSheet
                isOpen={isBottomSheetOpen}
                isOpenChange={setIsBottomSheetOpen}
                title={title}
                description={caption}
                confirmText="Take Photo"
                cancelText="Choose From Gallery"
                onConfirm={() => handleOptionSelect('camera')}
                onCancel={() => handleOptionSelect('gallery')}
                icon={<Image source={image || ImagePlaceholder} style={styles.bottomSheetIcon} />}
            />
        </>
    )
}

export default UploadTile

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: widthPixel(5),
        justifyContent: 'space-between',
        paddingHorizontal: widthPixel(16),
        position: 'relative',
    },
    innerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: widthPixel(5),
        justifyContent: 'space-between',
    },
    innerWrapperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(5),
    },
    icon: {
        width: 40,
        height: 40
    },
    textContainer: {
        flexDirection: 'column',
        gap: widthPixel(5),
    },
    caption: {
        fontSize: fontPixel(12),
    },
    subtitle: {
        fontSize: fontPixel(14),
    },
    bottomSheetIcon: {
        width: 60,
        height: 60
    },
    loadingContainer: {
    }
})

