import { fontPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { actions } from '@/redux/app/slice'
import { Asset, AssetModule } from '@/redux/app/types'
import { useAppDispatch } from '@/store/hooks'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import CameraView from '../CameraView'
import { ThemedText } from '../Themed/ThemedText'
import Thumbnail from '../Thumbnail'

interface ImageThumbnailUploaderProps {
    module: AssetModule;
    onChange: (asset: Asset) => void;
    value: string | null;
    error?: string;
    disabled?: boolean;
}

const ImageThumbnailUploader = ({module, onChange, value, error, disabled}: ImageThumbnailUploaderProps) => {
    const [showCamera, setShowCamera] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!imageUri || isLoading) return;
        setIsLoading(true);
        const formData = new FormData();
        formData.append('module', module);
        formData.append('assets', {
            uri: imageUri,
            name: 'image.jpg',
            type: 'image/jpeg',
        } as any);
        dispatch(actions.setIsUploadingAsset({
            formData,
            callback: (assets) => {
                if (assets.length > 0) {
                    onChange(assets[0]);
                    setImageUri(assets[0].url);
                }
                setIsLoading(false);
            },
            notify: true,
        }));
    }, [imageUri, isLoading]);

    const handleCapture = (uri: string) => {
        setImageUri(uri);
        setShowCamera(false);
    };

    if (showCamera && !isLoading) {
        return (
            <CameraView
                onCapture={handleCapture}
                onClose={() => setShowCamera(false)}
            />
        );
    }

    return (
        <View
            style={styles.row}
        >
            <View
                style={styles.textContainer}
            >
                <ThemedText
                    type='default'
                    lightColor={colors.light.text} 
                    darkColor={colors.dark.text} 
                >
                    Take a photo
                </ThemedText>
                <ThemedText
                    type='subtitle'
                    lightColor={error ? colors.light.danger : colors.light.secondary} 
                    darkColor={error ? colors.dark.danger : colors.dark.secondary} 
                    style={styles.caption}
                >
                    {error || 'Open your camera to take a photo of yourself'}
                </ThemedText>
            </View>

            <Thumbnail 
                disabled={disabled}
                onPress={() => setShowCamera(true)}
                imageUri={imageUri || value}
                isLoading={isLoading}
            />
        </View>
    )
}

export default ImageThumbnailUploader;

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: widthPixel(5),
        justifyContent: 'space-between',
    },
    textContainer: {
        flexDirection: 'column',
    },
    caption: {
        fontSize: fontPixel(12),
    },
});

