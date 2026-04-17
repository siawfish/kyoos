import { AccentScreenHeader } from '@/components/ui/AccentScreenHeader';
import BackButton from '@/components/ui/BackButton';
import SmartTextArea from '@/components/ui/SmartTextArea';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import BottomSheet, { BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { Portal } from '@gorhom/portal';
import { BlurView } from 'expo-blur';
import React, { useCallback, useMemo, useRef } from 'react';
import {
    Keyboard,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface AdditionalInfoSheetProps {
    visible: boolean;
    value: string;
    onChangeText: (text: string) => void;
    onClose: () => void;
    placeholder?: string;
    maxLength?: number;
}

const AdditionalInfoSheet = ({
    visible,
    value,
    onChangeText,
    onClose,
    placeholder = 'e.g., I need help with...',
    maxLength = 255,
}: AdditionalInfoSheetProps) => {
    const insets = useSafeAreaInsets();
    const sheetRef = useRef<BottomSheet>(null);
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const accentColor = isDark ? colors.dark.white : colors.light.black;

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

    const snapPoints = useMemo(() => ['55%', '85%'], []);

    const handleClose = useCallback(() => {
        Keyboard.dismiss();
        onClose();
    }, [onClose]);

    const handleSheetChange = useCallback(
        (index: number) => {
            if (index === -1) {
                Keyboard.dismiss();
                onClose();
            }
        },
        [onClose]
    );

    if (!visible) return null;

    return (
        <Portal>
            <View style={styles.overlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableWithoutFeedback onPress={handleClose}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>
                <BottomSheet
                    ref={sheetRef}
                    index={0}
                    snapPoints={snapPoints}
                    onChange={handleSheetChange}    
                    onClose={handleClose}
                    enablePanDownToClose
                    enableDynamicSizing={false}
                    keyboardBehavior="extend"
                    keyboardBlurBehavior="restore"
                    bottomInset={insets.bottom}
                    backgroundStyle={{
                        backgroundColor,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                        borderTopWidth: 0.5,
                        borderColor: accentColor,
                    }}
                >
                    <BottomSheetView style={[styles.content, { backgroundColor }]}>
                        <AccentScreenHeader
                            style={styles.header}
                            accentColor={accentColor}
                            title={
                                <View style={styles.titleContainer}>
                                    <View style={styles.titleTextContainer}>
                                        <ThemedText
                                            style={[styles.headerEyebrow, { color: secondaryColor }]}
                                            lightColor={colors.light.secondary}
                                            darkColor={colors.dark.secondary}
                                        >
                                            OPTIONAL
                                        </ThemedText>
                                        <ThemedText
                                            style={[styles.title, { color: textColor }]}
                                            lightColor={colors.light.text}
                                            darkColor={colors.dark.text}
                                        >
                                            Additional information
                                        </ThemedText>
                                    </View>
                                    <BackButton
                                        iconName="x"
                                        onPress={handleClose}
                                        containerStyle={styles.closeButton}
                                    />
                                </View>
                            }
                        />
                        <SmartTextArea
                            inputComponent={BottomSheetTextInput}
                            density="sheet"
                            borderColor={borderColor}
                            tintColor={tintColor}
                            textColor={textColor}
                            placeholderTextColor={secondaryColor + '80'}
                            selectionColor={tintColor}
                            placeholder={placeholder}
                            value={value}
                            onChangeText={onChangeText}
                            maxLength={maxLength}
                            containerStyle={{
                                marginHorizontal: widthPixel(16),
                                marginBottom: 0,
                            }}
                            footer={
                                <View style={[styles.inputFooter, { borderTopColor: borderColor }]}>
                                    <View style={[styles.charCountContainer, { marginLeft: 'auto' }]}>
                                        <ThemedText
                                            style={[
                                                styles.charCount,
                                                {
                                                    color:
                                                        value.length > maxLength - 25
                                                            ? colors.light.danger
                                                            : secondaryColor,
                                                },
                                            ]}
                                        >
                                            {value.length}
                                        </ThemedText>
                                        <ThemedText style={[styles.charCountTotal, { color: secondaryColor }]}>
                                            /{maxLength}
                                        </ThemedText>
                                    </View>
                                </View>
                            }
                        />
                    </BottomSheetView>
                </BottomSheet>
            </View>
        </Portal>
    );
};

export default AdditionalInfoSheet;

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end',
    },
    content: {
        flex: 1,
        paddingBottom: heightPixel(12),
        overflow: 'hidden',
    },
    header: {
        paddingHorizontal: widthPixel(16),
        paddingBottom: heightPixel(16),
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: widthPixel(12),
    },
    titleTextContainer: {
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
    },
    headerEyebrow: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
        marginBottom: heightPixel(8),
    },
    title: {
        fontSize: fontPixel(22),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
        lineHeight: fontPixel(26),
    },
    closeButton: {
        marginTop: heightPixel(4),
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
});
