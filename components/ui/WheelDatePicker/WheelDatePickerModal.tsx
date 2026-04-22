import WheelDatePicker from '@/components/ui/WheelDatePicker';
import { AccentScreenHeader } from '@/components/ui/AccentScreenHeader';
import BackButton from '@/components/ui/BackButton';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import React, { useCallback, useMemo, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export interface WheelDatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  title?: string;
  caption?: string;
}

export default function WheelDatePickerModal({
  visible,
  onClose,
  value,
  onChange,
  minimumDate,
  title = 'Select Date',
  caption = 'DATE PICKER',
}: Readonly<WheelDatePickerModalProps>) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const theme = useAppTheme();
  const isDark = theme === 'dark';

  const backgroundColor = useThemeColor(
    { light: colors.light.background, dark: colors.dark.background },
    'background'
  );

  const borderColor = isDark ? colors.dark.white : colors.light.black;

  const snapPoints = useMemo(() => ['45%'], []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        handleClose();
      }
    },
    [handleClose]
  );

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
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
          enablePanDownToClose
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
            <AccentScreenHeader
              renderRight={() => (
                <BackButton
                  iconName="x"
                  onPress={handleClose}
                  containerStyle={styles.closeButton}
                />
              )}
              title={
                <View style={styles.titleContainer}>
                  <ThemedText
                    style={styles.eyebrow}
                    lightColor={colors.light.secondary}
                    darkColor={colors.dark.secondary}
                  >
                    {caption}
                  </ThemedText>
                  <ThemedText
                    style={styles.title}
                    lightColor={colors.light.text}
                    darkColor={colors.dark.text}
                  >
                    {title}
                  </ThemedText>
                </View>
              }
            />
            <View style={styles.pickerWrap}>
              <WheelDatePicker
                value={value}
                onChange={onChange}
                minimumDate={minimumDate}
              />
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    flex: 1,
    paddingBottom: heightPixel(16),
    overflow: 'hidden',
  },
  titleContainer: {
    flex: 1,
  },
  closeButton: {
    marginTop: heightPixel(8),
  },
  eyebrow: {
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
  pickerWrap: {
    paddingHorizontal: widthPixel(4),
  },
});
