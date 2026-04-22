import { AccentScreenHeader } from '@/components/ui/AccentScreenHeader';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import BottomSheet, { BottomSheetFooter, BottomSheetTextInput, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetDefaultFooterProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    FadeOutDown,
    FadeOutUp,
} from 'react-native-reanimated';

export const BOOKING_REPORT_REASONS = [
    'Unprofessional behavior',
    'No-show',
    'Safety concerns',
    'Payment issues',
    'Other',
] as const;

export const PORTFOLIO_REPORT_REASONS = [
    'Inappropriate or offensive content',
    'Misleading or misrepresented work',
    'Spam or excessive promotion',
    'Copyright or ownership concern',
    'Harassment or hate',
    'Other',
] as const;

/** @deprecated Use BOOKING_REPORT_REASONS; kept for backward compatibility. */
export const REPORT_REASONS = BOOKING_REPORT_REASONS;

export type ReportReason =
    | (typeof BOOKING_REPORT_REASONS)[number]
    | (typeof PORTFOLIO_REPORT_REASONS)[number];

export type ReportSubject = 'booking' | 'portfolio';

interface ReasonsSectionProps {
    reason: string;
    reasons: readonly string[];
    onSelect: (value: string) => void;
    isDark: boolean;
    borderColor: string;
    labelColor: string;
    textColor: string;
}

const ReasonsSection = ({
    reason,
    reasons,
    onSelect,
    isDark,
    borderColor,
    labelColor,
    textColor,
}: ReasonsSectionProps) => (
    <>
        <Text style={[styles.sectionLabel, { color: labelColor }]}>Reason (required)</Text>
        <View style={styles.reasonsList}>
            {reasons.map((r) => {
                const isSelected = reason === r;
                return (
                    <TouchableOpacity
                        key={r}
                        onPress={() => onSelect(r)}
                        style={[
                            styles.reasonOption,
                            { borderColor },
                            isSelected && {
                                backgroundColor: isDark ? colors.dark.misc : colors.light.misc,
                                borderLeftWidth: widthPixel(4),
                                borderLeftColor: colors.light.danger,
                            },
                        ]}
                        activeOpacity={0.7}
                    >
                        <ThemedText
                            style={[styles.reasonText, { color: textColor }]}
                            lightColor={colors.light.text}
                            darkColor={colors.dark.text}
                        >
                            {r}
                        </ThemedText>
                    </TouchableOpacity>
                );
            })}
        </View>
    </>
);

interface ReportSheetProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly onConfirm: (reason: string, comment: string) => void;
    readonly userName?: string;
    /** Which report reason set to show. Default `booking` for existing call sites. */
    readonly subject?: ReportSubject;
}

const ReportSheet = ({
    isOpen,
    onClose,
    onConfirm,
    userName: _userName,
    subject = 'booking',
}: ReportSheetProps) => {
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const [reason, setReason] = useState<string>('');
    const [comment, setComment] = useState('');
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    const backgroundColor = useThemeColor(
        {
            light: colors.light.background,
            dark: colors.dark.background,
        },
        'background'
    );
    const borderColor = isDark ? colors.dark.white : colors.light.black;
    const textColor = useThemeColor(
        {
            light: colors.light.text,
            dark: colors.dark.text,
        },
        'text'
    );
    const labelColor = useThemeColor(
        {
            light: colors.light.secondary,
            dark: colors.dark.secondary,
        },
        'text'
    );
    const inputBackground = useThemeColor(
        { light: colors.light.misc, dark: colors.dark.misc },
        'misc'
    );
    const inputBorderColor = useThemeColor(
        { light: colors.light.tint, dark: colors.dark.tint },
        'tint'
    );
    const tintColor = useThemeColor(
        { light: colors.light.tint, dark: colors.dark.tint },
        'tint'
    );

    const reportReasons = useMemo(
        () => (subject === 'portfolio' ? PORTFOLIO_REPORT_REASONS : BOOKING_REPORT_REASONS),
        [subject]
    );

    useEffect(() => {
        if (isOpen) {
            setReason('');
            setComment('');
        }
    }, [isOpen, subject]);

    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
        const hide = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    const handleReasonSelect = useCallback((value: string) => {
        setReason(value);
    }, []);

    const handleSubmit = useCallback(() => {
        if (reason) {
            onConfirm(reason, comment);
        }
    }, [reason, comment, onConfirm]);

    const isSubmitEnabled = !!reason;

    const renderFooter = useCallback(
        (props: BottomSheetDefaultFooterProps) => (
            <BottomSheetFooter {...props} style={{ backgroundColor }}>
                <View style={styles.footerContainer}>
                    <Button
                        style={styles.button}
                        labelStyle={styles.buttonLabel}
                        label="SUBMIT REPORT"
                        onPress={handleSubmit}
                        disabled={!isSubmitEnabled}
                    />
                </View>
            </BottomSheetFooter>
        ),
        [isSubmitEnabled, handleSubmit, backgroundColor]
    );

    if (!isOpen) return null;

    return (
        <Modal visible={isOpen} transparent={true} animationType="fade">
            <View style={styles.modalOverlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>
                <BottomSheet
                    onClose={onClose}
                    enablePanDownToClose={false}
                    enableDynamicSizing={true}
                    style={[{ backgroundColor }, styles.container]}
                    keyboardBehavior="interactive"
                    keyboardBlurBehavior="restore"
                    enableBlurKeyboardOnGesture={true}
                    backgroundStyle={{
                        backgroundColor,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                        borderTopWidth: 0.5,
                        borderColor,
                    }}
                    footerComponent={renderFooter}
                >
                    <BottomSheetView style={[styles.contentContainer, { backgroundColor }]}>
                        <AccentScreenHeader
                            renderRight={() => (
                                <BackButton
                                    iconName="x"
                                    onPress={onClose}
                                    containerStyle={styles.closeButton}
                                />
                            )}
                            title={
                                <View style={styles.titleContainer}>
                                    <View style={styles.titleTextContainer}>
                                        <ThemedText
                                            style={styles.reportEyebrow}
                                            lightColor={colors.light.secondary}
                                            darkColor={colors.dark.secondary}
                                        >
                                            REPORT
                                        </ThemedText>
                                        <ThemedText
                                            style={styles.reportTitle}
                                            lightColor={colors.light.text}
                                            darkColor={colors.dark.text}
                                        >
                                            Report Issue
                                        </ThemedText>
                                    </View>
                                </View>
                            }
                        />

                        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
                            {!isKeyboardVisible && (
                                <Animated.View
                                    entering={FadeInUp.duration(200)}
                                    exiting={FadeOutDown.duration(200)}
                                >
                                    <ReasonsSection
                                        reason={reason}
                                        reasons={reportReasons}
                                        onSelect={handleReasonSelect}
                                        isDark={isDark}
                                        borderColor={borderColor}
                                        labelColor={labelColor}
                                        textColor={textColor}
                                    />
                                </Animated.View>
                            )}

                            <View style={styles.commentContainer}>
                                <ThemedText
                                    type="default"
                                    lightColor={colors.light.secondary}
                                    darkColor={colors.dark.secondary}
                                    style={styles.inputLabel}
                                >
                                    Additional details (optional)
                                </ThemedText>
                                <BottomSheetTextInput
                                    placeholder="Provide more context…"
                                    value={comment}
                                    onChangeText={setComment}
                                    multiline={true}
                                    style={[
                                        styles.inputBase,
                                        {
                                            backgroundColor: inputBackground,
                                            color: textColor,
                                            borderColor: inputBorderColor,
                                        },
                                        styles.commentInput,
                                    ]}
                                    selectionColor={tintColor}
                                    cursorColor={tintColor}
                                />
                            </View>

                            {isKeyboardVisible && (
                                <Animated.View
                                    style={{ backgroundColor }}
                                    entering={FadeInDown.duration(200)}
                                    exiting={FadeOutUp.duration(200)}
                                >
                                    <ReasonsSection
                                        reason={reason}
                                        reasons={reportReasons}
                                        onSelect={handleReasonSelect}
                                        isDark={isDark}
                                        borderColor={borderColor}
                                        labelColor={labelColor}
                                        textColor={textColor}
                                    />
                                </Animated.View>
                            )}

                            <View style={styles.footerSpacer} />
                        </BottomSheetScrollView>
                    </BottomSheetView>
                </BottomSheet>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    contentContainer: {
        flex: 1,
        overflow: 'hidden',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: widthPixel(12),
    },
    titleTextContainer: {
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
    },
    reportEyebrow: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
        marginBottom: heightPixel(8),
    },
    reportTitle: {
        fontSize: fontPixel(24),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
        lineHeight: fontPixel(28),
    },
    closeButton: {
        marginTop: heightPixel(8),
    },
    sectionLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
        marginBottom: heightPixel(12),
        paddingHorizontal: widthPixel(20),
    },
    reasonsList: {
        paddingHorizontal: widthPixel(20),
        marginBottom: heightPixel(24),
    },
    reasonOption: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.5,
        paddingVertical: heightPixel(14),
        paddingHorizontal: widthPixel(16),
        marginBottom: heightPixel(8),
    },
    reasonText: {
        fontSize: fontPixel(15),
        fontFamily: 'Regular',
    },
    commentContainer: {
        marginBottom: heightPixel(24),
        gap: widthPixel(8),
    },
    inputLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
        paddingHorizontal: widthPixel(20),
    },
    inputBase: {
        fontSize: fontPixel(18),
        fontFamily: 'Light',
        padding: widthPixel(16),
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        minHeight: heightPixel(120),
    },
    commentInput: {
        marginBottom: 0,
        minHeight: heightPixel(120),
    },
    footerContainer: {
        paddingHorizontal: widthPixel(20),
        paddingBottom: heightPixel(50),
    },
    button: {
        marginHorizontal: 0,
    },
    buttonLabel: {
        fontSize: fontPixel(12),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    footerSpacer: {
        height: heightPixel(200),
    },
});

export default ReportSheet;
