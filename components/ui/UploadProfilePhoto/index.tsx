import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { colors } from '@/constants/theme/colors';
import { Feather } from '@expo/vector-icons';
import { widthPixel, heightPixel } from '@/constants/normalize';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as ImagePicker from 'expo-image-picker';
import CameraView from '@/components/ui/CameraView';
import { MenuView } from '@react-native-menu/menu';
import { AssetModule } from '@/redux/app/types';
import { actions } from '@/redux/app/slice';
import { useDispatch } from 'react-redux';

export default function UploadProfilePhoto({
    url,
    onChange,
    setDisabled
}: {
    url: string | null;
    onChange: (url: string) => void;
    setDisabled?: (disabled: boolean) => void;
}) {
    const [isCameraViewOpen, setIsCameraViewOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!setDisabled) return;
        if (isLoading) {
            setDisabled(true);
            return;
        }

        setDisabled?.(false);
    }, [isLoading, setDisabled]);

    const onPickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            onChange(result.assets[0].uri);
            setIsLoading(true);
            uploadImage(result.assets[0].uri);
        }
    };

    const onCapture = (uri: string) => {
        onChange(uri);
        setIsCameraViewOpen(false);
        setIsLoading(true);
        uploadImage(uri);
    };

    const uploadImage = async (uri: string) => {
        const file = {
            uri,
            name: 'image.jpg',
            type: 'image/jpeg',
        } as any;
        const formData = new FormData();
        formData.append('assets', file);
        formData.append('module', AssetModule.PROFILE);
        dispatch(actions.setIsUploadingAsset({
            formData,
            callback: (assets) => {
                onChange(assets[0].url);
                setIsLoading(false);
            },
        }));
    };

    const backgroundColor = useThemeColor({
        light: colors.light.lightTint,
        dark: colors.dark.lightTint
    }, 'lightTint');

    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text');

    return (
        <View style={{ marginBottom: heightPixel(32) }}>
            <ThemedText 
                type="subtitle" 
                lightColor={colors.light.secondary}
                darkColor={colors.dark.secondary}
                style={styles.subtitle}
            >
                Please provide your name and an optional profile photo
            </ThemedText>
            <MenuView
                actions={[
                    {
                        id: 'take-photo',
                        title: 'Take Photo',
                        image: Platform.select({
                            ios: 'camera',
                            android: 'ic_menu_camera',
                        }),
                    },
                    {
                        id: 'choose-photo',
                        title: 'Choose Photo',
                        image: Platform.select({
                            ios: 'photo.on.rectangle',
                            android: 'ic_menu_gallery',
                        }),
                    },
                ]}
                onPressAction={({ nativeEvent }) => {
                    if (nativeEvent.event === 'take-photo') {
                        setIsCameraViewOpen(true);
                    } else if (nativeEvent.event === 'choose-photo') {
                        onPickImage();
                    }
                }}
            >
                <TouchableOpacity 
                    style={styles.imageContainer} 
                >
                    {url ? (
                        <Image source={{ uri: url }} style={styles.profileImage} />
                    ) : (
                        <View style={[styles.placeholderImage, { backgroundColor }]}>
                            <Feather name="camera" size={24} color={textColor} />
                        </View>
                    )}
                    {
                        isLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={colors.light.tint} />
                            </View>
                        )
                    }
                </TouchableOpacity>
            </MenuView>
            {
                isCameraViewOpen && (
                    <CameraView
                        onCapture={onCapture}
                        onClose={() => setIsCameraViewOpen(false)}
                    />
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    imageContainer: {
        alignSelf: 'center',
        position: 'relative',
    },
    profileImage: {
        width: widthPixel(120),
        height: widthPixel(120),
        borderRadius: widthPixel(60),
    },
    placeholderImage: {
        width: widthPixel(120),
        height: widthPixel(120),
        borderRadius: widthPixel(60),
        justifyContent: 'center',
        alignItems: 'center',
    },
    subtitle: {
        marginBottom: heightPixel(32),
        width: "90%",
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
});