import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectDescriptionModalVisible, selectIsLoading } from '@/redux/search/selector';
import { actions } from '@/redux/search/slice';
import { Worker } from '@/redux/search/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Feather } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFooter, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetDefaultFooterProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Keyboard,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface BookingDescriptionModalProps {
    artisan?: Worker;
}

const BookingDescriptionModal = ({ artisan }: BookingDescriptionModalProps) => {
    const [localDescription, setLocalDescription] = useState('');
    const descriptionModalVisible = useAppSelector(selectDescriptionModalVisible);
    const dispatch = useAppDispatch();
    const inputRef = useRef<any>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const accentColor = isDark ? colors.dark.white : colors.light.black;
    const isLoading = useAppSelector(selectIsLoading);
        
    const snapPoints = useMemo(() => ['90%', '100%'], []);

    const backgroundColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background,
    }, 'background');

    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');

    const secondaryColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary,
    }, 'secondary');

    const borderColor = useThemeColor({
        light: colors.light.grey,
        dark: colors.dark.grey,
    }, 'grey');

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    const miscColor = useThemeColor({
        light: colors.light.misc,
        dark: colors.dark.misc,
    }, 'misc');

    const iconColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black,
    }, 'text');

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            if (isLoading) {
                // Prevent closing during search - expand back to prevent dismissal
                bottomSheetRef.current?.expand();
                return;
            }
            dispatch(actions.setDescriptionModalVisible(false));
        }
    }, [dispatch, isLoading]);

    useEffect(() => {
        if (descriptionModalVisible) {
            setLocalDescription('');
            bottomSheetRef.current?.expand();
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        } else {
            bottomSheetRef.current?.close();
        }
    }, [descriptionModalVisible]);

    const handleSubmit = useCallback(() => {
        if (localDescription.trim()) {
            // Dispatch action to set description in booking state
            dispatch(actions.setSearch(localDescription.trim()));
            dispatch(actions.onSearch(artisan?.id));
        }
    }, [localDescription, dispatch, artisan?.id]);

    const handleClose = useCallback(() => {
        if (isLoading) {
            return;
        }
        Keyboard.dismiss();
        dispatch(actions.setDescriptionModalVisible(false));
    }, [dispatch, isLoading]);

    const handleClearInput = () => {
        setLocalDescription('');
        inputRef.current?.focus();
    };

    const renderFooter = useCallback(
        (props: BottomSheetDefaultFooterProps) => (
            <BottomSheetFooter {...props}>
                <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor }]}>
                    <Button
                        label="Continue to Booking"
                        onPress={handleSubmit}
                        disabled={!localDescription.trim() || isLoading}
                        isLoading={isLoading}
                        style={styles.submitButton}
                        icon={<Feather name="arrow-right" size={18} color={iconColor} />}
                    />
                    <ThemedText style={[styles.footerHint, { color: secondaryColor }]}>
                        Provide details about the service you need
                    </ThemedText>
                </View>
            </BottomSheetFooter>
        ),
        [localDescription, borderColor, backgroundColor, secondaryColor, handleSubmit, isLoading, iconColor]
    );

    if (!descriptionModalVisible) return null;

    return (
        <Modal
            visible={descriptionModalVisible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableWithoutFeedback onPress={isLoading ? undefined : handleClose}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>
                <BottomSheet
                    ref={bottomSheetRef}
                    snapPoints={snapPoints}
                    index={0}
                    onChange={handleSheetChanges}
                    onClose={handleClose}
                    enablePanDownToClose={!isLoading}
                    enableDynamicSizing={true}
                    keyboardBehavior="extend"
                    keyboardBlurBehavior="restore"
                    android_keyboardInputMode="adjustResize"
                    handleIndicatorStyle={{ backgroundColor: borderColor, width: widthPixel(40) }}
                    backgroundStyle={{
                        backgroundColor,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                    }}
                    footerComponent={renderFooter}
                >
                    <BottomSheetView style={styles.bottomSheetContent}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                                <View style={styles.headerLabelRow}>
                                    <ThemedText style={[styles.headerLabel, { color: secondaryColor }]}>
                                        BOOKING REQUEST
                                    </ThemedText>
                                </View>
                                <ThemedText 
                                    style={[styles.headerTitle, { color: textColor }]}
                                    lightColor={colors.light.text}
                                    darkColor={colors.dark.text}
                                >
                                    Describe Your Issue
                                </ThemedText>
                            </View>
                            <BackButton iconName="x" onPress={isLoading ? undefined : handleClose} containerStyle={styles.closeButton} />
                        </View>

                        {/* Content */}
                        <ScrollView 
                            style={styles.content}
                            keyboardShouldPersistTaps="never"
                            showsVerticalScrollIndicator={false}
                            keyboardDismissMode="on-drag"
                        >
                            {/* Description Input */}
                            <View style={[styles.inputWrapper, { borderColor }]}>
                                <View style={[styles.inputAccent, { backgroundColor: tintColor }]} />
                                <View style={styles.inputInner}>
                                    <View style={styles.inputHeader}>
                                        <ThemedText style={[styles.inputLabel, { color: secondaryColor }]}>
                                            DESCRIPTION
                                        </ThemedText>
                                        {localDescription.length > 0 && (
                                            <TouchableOpacity 
                                                onPress={handleClearInput}
                                                style={styles.clearButton}
                                                activeOpacity={0.7}
                                            >
                                                <Feather name="x" size={14} color={secondaryColor} />
                                                <ThemedText style={[styles.clearText, { color: secondaryColor }]}>
                                                    Clear
                                                </ThemedText>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <BottomSheetTextInput
                                        ref={inputRef}
                                        style={[styles.textInput, { color: textColor }]}
                                        placeholder="e.g., My kitchen sink has been leaking for a week and I need it fixed urgently..."
                                        placeholderTextColor={secondaryColor + '80'}
                                        multiline
                                        value={localDescription}
                                        onChangeText={setLocalDescription}
                                        textAlignVertical="top"
                                        selectionColor={tintColor}
                                        maxLength={255}
                                    />
                                    <View style={[styles.inputFooter, { borderTopColor: borderColor }]}>
                                        <View style={styles.charCountContainer}>
                                            <ThemedText style={[
                                                styles.charCount, 
                                                { color: localDescription.length > 230 ? colors.light.danger : secondaryColor }
                                            ]}>
                                                {localDescription.length}
                                            </ThemedText>
                                            <ThemedText style={[styles.charCountTotal, { color: secondaryColor }]}>
                                                /255
                                            </ThemedText>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Tips Section */}
                            <View style={[styles.tipsContainer, { backgroundColor: miscColor }]}>
                                <View style={styles.tipHeader}>
                                    <Feather name="info" size={14} color={secondaryColor} />
                                    <ThemedText style={[styles.tipTitle, { color: secondaryColor }]}>
                                        TIP
                                    </ThemedText>
                                </View>
                                <ThemedText style={[styles.tipText, { color: textColor }]}>
                                    Be specific about your issue, location, and any special requirements to help the service provider prepare.
                                </ThemedText>
                            </View>
                        </ScrollView>
                    </BottomSheetView>
                </BottomSheet>
            </View>
        </Modal>
    );
};

export default BookingDescriptionModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    bottomSheetContent: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(20),
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
    headerLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
        marginBottom: heightPixel(8),
    },
    headerLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
    },
    headerTitle: {
        fontSize: fontPixel(24),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
        lineHeight: fontPixel(28),
    },
    closeButton: {
        marginTop: heightPixel(8),
    },
    content: {
        flex: 1,
        paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(20),
    },
    inputWrapper: {
        flexDirection: 'row',
        borderWidth: 0.5,
        borderLeftWidth: 0,
        marginBottom: heightPixel(24),
    },
    inputAccent: {
        width: widthPixel(4),
    },
    inputInner: {
        flex: 1,
    },
    inputHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: widthPixel(16),
        paddingTop: heightPixel(14),
        paddingBottom: heightPixel(8),
    },
    inputLabel: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(4),
    },
    clearText: {
        fontSize: fontPixel(11),
        fontFamily: 'Medium',
    },
    textInput: {
        minHeight: heightPixel(100),
        maxHeight: heightPixel(140),
        paddingHorizontal: widthPixel(16),
        paddingBottom: heightPixel(12),
        fontSize: fontPixel(16),
        fontFamily: 'Regular',
        lineHeight: fontPixel(24),
    },
    inputFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(12),
        borderTopWidth: 0.5,
    },
    charCountContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    charCount: {
        fontSize: fontPixel(14),
        fontFamily: 'SemiBold',
    },
    charCountTotal: {
        fontSize: fontPixel(12),
        fontFamily: 'Regular',
    },
    tipsContainer: {
        padding: widthPixel(16),
        marginBottom: heightPixel(20),
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
        marginBottom: heightPixel(8),
    },
    tipTitle: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
    },
    tipText: {
        fontSize: fontPixel(13),
        fontFamily: 'Regular',
        lineHeight: fontPixel(20),
    },
    footer: {
        paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(16),
        paddingBottom: heightPixel(40),
        borderTopWidth: 0.5,
    },
    submitButton: {
        marginHorizontal: 0,
        height: heightPixel(54),
    },
    footerHint: {
        fontSize: fontPixel(11),
        fontFamily: 'Regular',
        textAlign: 'center',
        marginTop: heightPixel(12),
    },
});

