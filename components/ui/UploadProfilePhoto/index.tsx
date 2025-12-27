import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, TouchableWithoutFeedback, Text } from 'react-native';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { colors } from '@/constants/theme/colors';
import { Feather } from '@expo/vector-icons';
import { widthPixel, heightPixel, fontPixel } from '@/constants/normalize';
import { useThemeColor } from '@/hooks/use-theme-color';
import * as ImagePicker from 'expo-image-picker';
import CameraView from '@/components/ui/CameraView';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import BackButton from '@/components/ui/BackButton';
import { AssetModule } from '@/redux/app/types';
import { actions } from '@/redux/app/slice';
import { useDispatch } from 'react-redux';

export default function UploadProfilePhoto({
    url,
    onChange,
    setDisabled,
}: {
    url: string | null;
    onChange: (url: string) => void;
    setDisabled?: (disabled: boolean) => void;
}) {
    const [isCameraViewOpen, setIsCameraViewOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['40%'], []);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!setDisabled) return;
        if (isLoading) {
            setDisabled(true);
            return;
        }

        setDisabled?.(false);
    }, [isLoading, setDisabled]);

    const uploadImage = useCallback(async (uri: string) => {
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
    }, [dispatch, onChange]);

    const onPickImage = useCallback(async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (!permissionResult.granted) {
                alert('Permission to access media library is required!');
                return;
            }

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
        } catch (error) {
            console.error('Error picking image:', error);
            alert('Failed to pick image. Please try again.');
        }
    }, [onChange, uploadImage]);

    const onCapture = (uri: string) => {
        onChange(uri);
        setIsCameraViewOpen(false);
        setIsLoading(true);
        uploadImage(uri);
    };

    const handleOpen = useCallback(() => {
        setIsBottomSheetOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsBottomSheetOpen(false);
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            handleClose();
        }
    }, [handleClose]);

    const handleTakePhoto = useCallback(() => {
        handleClose();
        setIsCameraViewOpen(true);
    }, [handleClose]);

    const handleChoosePhoto = useCallback(async () => {
        handleClose();
        // Use setTimeout to ensure modal closes before opening image picker
        setTimeout(() => {
            onPickImage();
        }, 300);
    }, [handleClose, onPickImage]);

    const backgroundColor = useThemeColor({
        light: colors.light.lightTint,
        dark: colors.dark.lightTint
    }, 'lightTint');

    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text');

    const borderColor = useThemeColor({
        light: colors.light.black,
        dark: colors.dark.white
    }, 'text');

    const labelColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary
    }, 'text');

    const bottomSheetBackgroundColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background');

    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <ThemedText 
                    type="default" 
                    lightColor={colors.light.text}
                    darkColor={colors.dark.text}
                >
                    Take a photo
                </ThemedText>
                <ThemedText 
                    type="subtitle" 
                    lightColor={colors.light.secondary}
                    darkColor={colors.dark.secondary}
                    style={styles.caption}
                >
                    Select a photo from your gallery or take a photo with your camera
                </ThemedText>
            </View>
            <TouchableOpacity 
                style={[styles.imageContainer, { backgroundColor }]} 
                disabled={isLoading}
                onPress={handleOpen}
            >
                {url ? (
                    <Image source={{ uri: url }} style={styles.profileImage} />
                ) : (
                    <View style={styles.placeholderImage}>
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
            {
                isCameraViewOpen && (
                    <CameraView
                        onCapture={onCapture}
                        onClose={() => setIsCameraViewOpen(false)}
                    />
                )
            }
            {isBottomSheetOpen && (
                <Modal
                    visible={isBottomSheetOpen}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={handleClose}
                >
                    <View style={styles.modalOverlay}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <TouchableWithoutFeedback onPress={handleClose}>
                            <View style={StyleSheet.absoluteFill} />
                        </TouchableWithoutFeedback>
                        <BottomSheet
                            ref={bottomSheetRef}
                            index={0}
                            snapPoints={snapPoints}
                            onChange={handleSheetChanges}
                            onClose={handleClose}
                            enablePanDownToClose={true}
                            enableDynamicSizing={false}
                            backgroundStyle={{
                                backgroundColor: bottomSheetBackgroundColor,
                                borderTopLeftRadius: 0,
                                borderTopRightRadius: 0,
                                borderTopWidth: 0.5,
                                borderColor,
                            }}
                        >
                            <BottomSheetView style={[styles.bottomSheetContent, { backgroundColor: bottomSheetBackgroundColor }]}>
                                <View style={styles.header}>
                                    <View style={styles.headerLeft}>
                                        <View style={[styles.accentBar, { backgroundColor: borderColor }]} />
                                        <Text style={[styles.label, { color: labelColor }]}>OPTIONS</Text>
                                        <ThemedText 
                                            style={[styles.title, { color: textColor }]} 
                                            lightColor={colors.light.text} 
                                            darkColor={colors.dark.text}
                                        >
                                            Photo Actions
                                        </ThemedText>
                                    </View>
                                    <BackButton iconName="x" onPress={handleClose} containerStyle={styles.closeButton} />
                                </View>

                                <View style={styles.optionsContainer}>
                                    <TouchableOpacity 
                                        style={[styles.optionButton, { borderColor }]}
                                        onPress={handleTakePhoto}
                                    >
                                        <Feather name="camera" size={fontPixel(18)} color={textColor} />
                                        <ThemedText 
                                            style={[styles.optionText, { color: textColor }]} 
                                            lightColor={colors.light.text} 
                                            darkColor={colors.dark.text}
                                        >
                                            TAKE PHOTO
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={[styles.optionButton, { borderColor }]}
                                        onPress={handleChoosePhoto}
                                    >
                                        <Feather name="image" size={fontPixel(18)} color={textColor} />
                                        <ThemedText 
                                            style={[styles.optionText, { color: textColor }]} 
                                            lightColor={colors.light.text} 
                                            darkColor={colors.dark.text}
                                        >
                                            CHOOSE PHOTO
                                        </ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </BottomSheetView>
                        </BottomSheet>
                    </View>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: widthPixel(16),
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: widthPixel(16),
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
        gap: heightPixel(4),
    },
    caption: {
        fontSize: fontPixel(12),
    },
    imageContainer: {
        width: widthPixel(80),
        height: widthPixel(80),
        borderRadius: 0,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
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
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    bottomSheetContent: {
        flex: 1,
        paddingTop: heightPixel(20),
        paddingBottom: heightPixel(20),
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: widthPixel(20),
        paddingBottom: heightPixel(24),
    },
    headerLeft: {
        flex: 1,
    },
    accentBar: {
        width: widthPixel(40),
        height: heightPixel(4),
        marginBottom: heightPixel(16),
    },
    label: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
        marginBottom: heightPixel(8),
    },
    title: {
        fontSize: fontPixel(24),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
        lineHeight: fontPixel(28),
    },
    closeButton: {
        marginTop: heightPixel(8),
    },
    optionsContainer: {
        paddingHorizontal: widthPixel(20),
        gap: heightPixel(12),
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(12),
        paddingVertical: heightPixel(16),
        paddingHorizontal: widthPixel(16),
        borderWidth: 0.5,
        borderRadius: 0,
    },
    optionText: {
        fontSize: fontPixel(14),
        fontFamily: 'SemiBold',
        letterSpacing: 1,
    },
});