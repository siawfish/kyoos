import React, { useCallback, useRef } from 'react';
import { View, StyleSheet, Image, StyleProp, ViewStyle, TextStyle, Modal, TouchableWithoutFeedback } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Button from '../Button';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { BlurView } from 'expo-blur';

interface ConfirmActionSheetProps {
  isOpen: boolean;
  isOpenChange: (isOpen: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonStyle?: StyleProp<ViewStyle>;
  confirmTextStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const ConfirmActionSheet: React.FC<ConfirmActionSheetProps> = ({
  isOpen,
  isOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Yes",
  cancelText = "Cancel",
  confirmButtonStyle,
  confirmTextStyle={},
  icon=<Image source={require('@/assets/images/caution.png')} style={styles.icon} />,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const backgroundColor = useThemeColor(
    {
      light: colors.light.background,
      dark: colors.dark.background,
    },
    "background"
  );
  const outlineButtonColor = useThemeColor(
    {
      light: colors.light.black,
      dark: colors.dark.secondary,
    },
    "background"
  );

  // Handle closing the bottom sheet
  const handleClose = useCallback(() => {
    isOpenChange(false);
  }, [isOpenChange]);

  // Handle confirmation
  const handleConfirm = useCallback(() => {
    onConfirm();
    handleClose();
  }, [onConfirm, handleClose]);

  // Handle sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      handleClose();
    }
  }, [handleClose]);

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
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
          snapPoints={['40%']}
          onChange={handleSheetChanges}
          onClose={handleClose}
          enablePanDownToClose
          backgroundStyle={{
            backgroundColor,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }}
        >
          <BottomSheetView style={[styles.contentContainer, { backgroundColor }]}>
            <View style={styles.iconContainer}>
              {icon}
            </View>
            <ThemedText type="defaultSemiBold" style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.description}>{description}</ThemedText>
            <View style={styles.buttonContainer}>
              <Button
                onPress={handleClose}
                style={[styles.outlineButton, {borderColor: outlineButtonColor}]}
                labelStyle={[{color: outlineButtonColor}]}
                label={cancelText}
              />
              <Button
                onPress={handleConfirm}
                style={[styles.button, confirmButtonStyle]}
                label={confirmText}
                labelStyle={[styles.confirmText, confirmTextStyle]}
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
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingHorizontal: widthPixel(16),
    paddingVertical: heightPixel(16),
    minHeight: heightPixel(320),
  },
  title: {
    fontSize: fontPixel(20),
    marginBottom: heightPixel(8),
  },
  description: {
    fontSize: fontPixel(16),
    color: '#666',
    marginBottom: heightPixel(24),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: widthPixel(12),
  },
  button: {
    marginHorizontal: 0,
    minWidth: widthPixel(100),
    paddingHorizontal: widthPixel(32),
  },
  outlineButton: {
    marginHorizontal: 0,
    minWidth: widthPixel(100),
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  iconContainer: {
    marginBottom: heightPixel(16),
  },
  icon: {
    width: widthPixel(60),
    height: widthPixel(60),
  },
  confirmText: {
    fontFamily: 'Bold',
  },
});
