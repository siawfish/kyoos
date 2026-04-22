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
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface RatingSheetProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly onConfirm: (rating: number, comment: string) => void;
    readonly userName?: string;
}

const STAR_SIZE = 32;

const RatingSheet = ({
    isOpen,
    onClose,
    onConfirm,
    userName,
}: RatingSheetProps) => {
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

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
    const starFilledColor = isDark ? colors.dark.orange : colors.light.orange;
    const starOutlineColor = isDark ? colors.dark.grey : colors.light.grey;
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

    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setComment('');
        }
    }, [isOpen]);

    const handleStarPress = useCallback((value: number) => {
        setRating(value);
    }, []);

    const handleSubmit = useCallback(() => {
        if (rating > 0) {
            onConfirm(rating, comment);
        }
    }, [rating, comment, onConfirm]);

    const isSubmitEnabled = rating > 0;

    const renderFooter = useCallback(
        (props: BottomSheetDefaultFooterProps) => (
            <BottomSheetFooter {...props}>
                <View style={styles.footerContainer}>
                    <Button
                        style={styles.button}
                        labelStyle={styles.buttonLabel}
                        label="SUBMIT RATING"
                        onPress={handleSubmit}
                        disabled={!isSubmitEnabled}
                    />
                </View>
            </BottomSheetFooter>
        ),
        [isSubmitEnabled, handleSubmit]
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
                                            style={styles.ratingEyebrow}
                                            lightColor={colors.light.secondary}
                                            darkColor={colors.dark.secondary}
                                        >
                                            RATE
                                        </ThemedText>
                                        <ThemedText
                                            style={styles.ratingTitle}
                                            lightColor={colors.light.text}
                                            darkColor={colors.dark.text}
                                        >
                                            {userName ? `Rate ${userName}` : 'Rate User'}
                                        </ThemedText>
                                    </View>
                                </View>
                            }
                        />

                        <BottomSheetScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <TouchableOpacity
                                        key={value}
                                        onPress={() => handleStarPress(value)}
                                        style={styles.starButton}
                                        activeOpacity={0.7}
                                    >
                                        {
                                            value <= rating ? (
                                                <AntDesign
                                                    name={'star'}
                                                    size={STAR_SIZE}
                                                    color={starFilledColor}
                                                />
                                            ) : (
                                                <MaterialIcons
                                                    name={'star-outline'}
                                                    size={STAR_SIZE}
                                                    color={starOutlineColor}
                                                />
                                            )
                                        }
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.commentContainer}>
                                <ThemedText
                                    type="default"
                                    lightColor={colors.light.secondary}
                                    darkColor={colors.dark.secondary}
                                    style={styles.inputLabel}
                                >
                                    Comment (optional)
                                </ThemedText>
                                <BottomSheetTextInput
                                    placeholder="Share your experience…"
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
                                    ]}
                                    selectionColor={tintColor}
                                    cursorColor={tintColor}
                                />
                            </View>

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
    ratingEyebrow: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
        marginBottom: heightPixel(8),
    },
    ratingTitle: {
        fontSize: fontPixel(24),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
        lineHeight: fontPixel(28),
    },
    closeButton: {
        marginTop: heightPixel(8),
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: widthPixel(8),
        paddingHorizontal: widthPixel(20),
        marginBottom: heightPixel(24),
    },
    starButton: {
        padding: widthPixel(6),
    },
    commentContainer: {
        // paddingHorizontal: widthPixel(20),
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

export default RatingSheet;
