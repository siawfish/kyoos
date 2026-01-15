import React, { useCallback, useMemo, useRef } from 'react';
import {
    StyleSheet,
    View,
    Modal,
    TouchableWithoutFeedback,
    Text,
} from 'react-native';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { colors } from '@/constants/theme/colors';
import { fontPixel, widthPixel, heightPixel } from '@/constants/normalize';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import BackButton from '../BackButton';

interface IOSDatePickerModalProps {
    visible: boolean;
    selectedDate: Date;
    onDateChange: (event: any, selectedDate?: Date) => void;
    onClose: () => void;
    minimumDate?: Date;
}

const IOSDatePickerModal = ({
    visible,
    selectedDate,
    onDateChange,
    onClose,
    minimumDate = new Date(),
}: IOSDatePickerModalProps) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    
    const backgroundColor = useThemeColor(
        {
            light: colors.light.background,
            dark: colors.dark.background,
        },
        "background"
    );
    const accentColor = isDark ? colors.dark.white : colors.light.black;
    const borderColor = accentColor;
    const labelColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary
    }, 'text');
    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text');

    const snapPoints = useMemo(() => ['40%'], []);

    // Handle closing the bottom sheet
    const handleClose = useCallback(() => {
        onClose();
    }, [onClose]);

    // Handle sheet changes
    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            handleClose();
        }
    }, [handleClose]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
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
                                <Text style={[styles.label, { color: labelColor }]}>SELECT DATE</Text>
                            </View>
                            <BackButton iconName="x" onPress={handleClose} containerStyle={styles.closeButton} />
                        </View>

                        <View style={styles.pickerContainer}>
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="spinner"
                                onChange={onDateChange}
                                minimumDate={minimumDate}
                                textColor={textColor}
                            />
                        </View>
                    </BottomSheetView>
                </BottomSheet>
            </View>
        </Modal>
    );
};

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
    },
    closeButton: {
        marginTop: heightPixel(8),
    },
    pickerContainer: {
        paddingHorizontal: widthPixel(20),
    },
});

export default IOSDatePickerModal;
