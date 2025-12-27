import ImagePlaceholder from '@/assets/images/image-back.png'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { actions } from '@/redux/app/slice'
import { Asset, AssetModule } from '@/redux/app/types'
import { useAppDispatch } from '@/store/hooks'
import * as ImagePicker from 'expo-image-picker'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Toast from 'react-native-toast-message'
import CameraView from '../CameraView'
import { ThemedText } from '../Themed/ThemedText'
import UploadTile from './components/UploadTile'

interface GhanaCardUploaderProps {
    front: string;
    back: string;
    frontError?: string;
    backError?: string;
    onChangeFront: (asset: Asset) => void;
    onChangeBack: (asset: Asset) => void;
    disabled?: boolean;
}

const GhanaCardUploader = ({front, back, frontError, backError, onChangeFront, onChangeBack, disabled}: GhanaCardUploaderProps) => {
    const [frontIsUploading, setFrontIsUploading] = useState(false);
    const [backIsUploading, setBackIsUploading] = useState(false);
    const [showCamera, setShowCamera] = useState<'front' | 'back' | null>(null);
    const dispatch = useAppDispatch();

    const handleFrontUpload = async (option: 'camera' | 'gallery') => {
        setFrontIsUploading(true);
        if (option === 'camera') {
            takePhoto('front');
        } else {
            await pickImageFromGallery('front');
        }
    }

    const takePhoto = async (type: 'front' | 'back') => {
        setShowCamera(type);
    }

    const handleCapture = async (uri: string, type: 'front' | 'back') => {
        setShowCamera(null);
        const file = {
            uri,
            name: 'image.jpg',
            type: 'image/jpeg',
        } as any;
        const formData = new FormData();
        formData.append('assets', file);
        formData.append('module', AssetModule.DOCUMENTS);
        dispatch(actions.setIsUploadingAsset({
            formData,
            callback: (assets) => {
                onComplete(assets[0], type);
            },
        }));
    }

    const pickImageFromGallery = async (type: 'front' | 'back') => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (permissionResult.granted === false) {
                alert("You need to grant permission to access the gallery");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                const asset = result.assets[0];
                const file = {
                    uri: asset.uri,
                    name: asset.fileName,
                    type: asset.type,
                } as any;
                const formData = new FormData();
                formData.append('assets', file);
                formData.append('module', AssetModule.DOCUMENTS);
                dispatch(actions.setIsUploadingAsset({
                    formData,
                    callback: (assets) => {
                        onComplete(assets[0], type);
                    },
                }));
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error picking image from gallery',
                text2: 'Please try again',
            });
        }
    }

    const onComplete = (asset: Asset, type: 'front' | 'back') => {
        if (type === 'front') {
            if(asset?.url) {
                onChangeFront(asset);
            }
            setFrontIsUploading(false);
        } else {
            if(asset?.url) {
                onChangeBack(asset);
            }
            setBackIsUploading(false);
        }
    }

    const handleBackUpload = (option: 'camera' | 'gallery') => {
        setBackIsUploading(true);
        if (option === 'camera') {
            takePhoto('back');
        } else {
            pickImageFromGallery('back');
        }
    }


    if (!!showCamera) {
        return (
            <CameraView
                onCapture={(uri) => handleCapture(uri, showCamera)}
                onClose={() => setShowCamera(null)}
            />
        );
    }

    return (
        <View style={styles.container}>
            <ThemedText 
                lightColor={colors.light.text} 
                darkColor={colors.dark.text} 
                type='default'
                style={styles?.ghanaCard}
            >
                Ghana Card Photo
            </ThemedText>

            <UploadTile 
                error={frontError}
                isLoading={frontIsUploading}
                title={front ? 'Upload a new photo' : 'Upload the front side of your Ghana Card'}
                caption={frontIsUploading ? 'Uploading, please wait...' : 'Ensure the image is clear and all details are visible'}
                onPress={handleFrontUpload}
                disabled={disabled || frontIsUploading}
            />

            <UploadTile 
                error={backError}
                isLoading={backIsUploading}
                image={ImagePlaceholder}
                title={back ? 'Upload a new photo' : 'Upload the back side of your Ghana Card'}
                caption={backIsUploading ? 'Uploading, please wait...' : 'Ensure the image is clear and all details are visible'}
                onPress={handleBackUpload}
                disabled={disabled || backIsUploading}
            />
        </View>
    )
}

export default GhanaCardUploader

const styles = StyleSheet.create({
    container: {
        gap: heightPixel(16),
    },
    ghanaCard: {
        fontSize: fontPixel(18),
        marginBottom: heightPixel(10),
        paddingHorizontal: widthPixel(16),
    },
})

