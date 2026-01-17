import BackButton from '@/components/ui/BackButton';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SimpleLineIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { Options as OptionsType } from '@/redux/app/types';

export function Options({
    options,
    snapPoints = ['45%'],
    title = 'Portfolio Actions',
}: {
    options: OptionsType[],
    snapPoints?: string[],
    title?: string,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const borderColor = useThemeColor({
        light: colors.light.black,
        dark: colors.dark.white
    }, 'text');
    const iconColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text');
    const backgroundColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background');
    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text');
    const labelColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary
    }, 'text');
    const successColor = useThemeColor({
        light: colors.light.green,
        dark: colors.dark.green
    }, 'text');

    const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

    const handleOpen = useCallback(() => {
        setIsOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            handleClose();
        }
    }, [handleClose]);

    return (
        <>
            <TouchableOpacity
                style={{
                    width: widthPixel(28),
                    height: widthPixel(28),
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    borderRadius: 0,
                    borderWidth: 0.5,
                    borderColor: borderColor,
                }}
                onPress={handleOpen}
            >
                <SimpleLineIcons 
                    name='options' 
                    size={fontPixel(14)} 
                    color={iconColor}
                />
            </TouchableOpacity>

            {isOpen && (
                <Modal
                    visible={isOpen}
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
                            snapPoints={memoizedSnapPoints}
                            onChange={handleSheetChanges}
                            onClose={handleClose}
                            enablePanDownToClose={true}
                            enableDynamicSizing={false}
                            backgroundStyle={{
                                backgroundColor,
                                borderTopLeftRadius: 0,
                                borderTopRightRadius: 0,
                                borderTopWidth: 0.5,
                                borderColor,
                            }}
                        >
                            <BottomSheetView style={[styles.contentContainer, { backgroundColor }]}>
                                <View style={styles.header}>
                                    <View style={styles.headerLeft}>
                                        <View style={[styles.accentBar, { backgroundColor: borderColor }]} />
                                        <Text style={[styles.label, { color: labelColor }]}>OPTIONS</Text>
                                        <ThemedText 
                                            style={[styles.title, { color: textColor }]} 
                                            lightColor={colors.light.text} 
                                            darkColor={colors.dark.text}
                                        >
                                            {title}
                                        </ThemedText>
                                    </View>
                                    <BackButton iconName="x" onPress={handleClose} containerStyle={styles.closeButton} />
                                </View>

                                <View style={styles.optionsContainer}>
                                    {
                                        options.map((option) => (
                                            <TouchableOpacity 
                                                key={option.label}
                                                style={[styles.optionButton, { borderColor }]}
                                                onPress={()=>{
                                                    handleClose();
                                                    // Delay the callback to ensure modal is fully closed before triggering share
                                                    setTimeout(() => {
                                                        option?.onPress?.();
                                                    }, 300);
                                                }}
                                                disabled={option.isDisabled}
                                            >
                                                <SimpleLineIcons name={option?.icon} size={fontPixel(18)} color={option?.isDanger ? colors.light.danger : option?.isSuccess ? successColor : textColor} />
                                                <ThemedText 
                                                    style={[styles.optionText]} 
                                                    lightColor={option?.isDanger ? colors.light.danger : option?.isSuccess ? successColor : textColor} 
                                                    darkColor={option?.isDanger ? colors.dark.danger : option?.isSuccess ? successColor : textColor}
                                                >
                                                    {option.label}
                                                </ThemedText>
                                            </TouchableOpacity>
                                        ))
                                    }
                                </View>
                            </BottomSheetView>
                        </BottomSheet>
                    </View>
                </Modal>
            )}
        </>
    )
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    contentContainer: {
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

