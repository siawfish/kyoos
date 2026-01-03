import BackButton from '@/components/ui/BackButton';
import ThemedText from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppTheme } from '@/hooks/use-app-theme';
import { SimpleLineIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export function Options({
    onEdit,
    onDelete,
    label = 'Portfolio Options',
}: {
    onEdit: () => void,
    onDelete: () => void,
    label?: string,
}) {
    const theme = useAppTheme();
    const isDark = theme === 'dark';
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

    const snapPoints = useMemo(() => ['40%'], []);

    const handleOpen = useCallback(() => {
        setIsOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleEdit = useCallback(() => {
        handleClose();
        onEdit();
    }, [handleClose, onEdit]);

    const handleDelete = useCallback(() => {
        handleClose();
        onDelete();
    }, [handleClose, onDelete]);

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
                            snapPoints={snapPoints}
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
                                            Portfolio Actions
                                        </ThemedText>
                                    </View>
                                    <BackButton iconName="x" onPress={handleClose} containerStyle={styles.closeButton} />
                                </View>

                                <View style={styles.optionsContainer}>
                                    <TouchableOpacity 
                                        style={[styles.optionButton, { borderColor }]}
                                        onPress={handleEdit}
                                    >
                                        <SimpleLineIcons name="pencil" size={fontPixel(18)} color={textColor} />
                                        <ThemedText 
                                            style={[styles.optionText, { color: textColor }]} 
                                            lightColor={colors.light.text} 
                                            darkColor={colors.dark.text}
                                        >
                                            EDIT
                                        </ThemedText>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={[styles.optionButton, { borderColor }]}
                                        onPress={handleDelete}
                                    >
                                        <SimpleLineIcons name="trash" size={fontPixel(18)} color={colors.light.danger} />
                                        <ThemedText 
                                            style={[styles.optionText, { color: colors.light.danger }]} 
                                            lightColor={colors.light.danger} 
                                            darkColor={colors.light.danger}
                                        >
                                            DELETE
                                        </ThemedText>
                                    </TouchableOpacity>
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

