import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import BottomSheet, { BottomSheetFooter, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetDefaultFooterProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types';
import { BlurView } from 'expo-blur';
import React, { useCallback, useMemo, useRef } from 'react';
import { Image, Modal, StyleProp, StyleSheet, TextStyle, TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { AccentScreenHeader } from '../AccentScreenHeader';
import BackButton from '../BackButton';
import { ThemedText } from '../Themed/ThemedText';

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
  onCancel?: () => void;
  snapPoints?: (string | number)[];
  caption?: string;
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
  onCancel,
  icon=<Image source={require('@/assets/images/caution.png')} style={styles.icon} />,
  snapPoints = ['45%'],
  caption = "CONFIRMATION",
}) => {
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
  const borderColor = isDark ? colors.dark.white : colors.light.black;
  const labelColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary
  }, 'text');
  const textColor = useThemeColor({
    light: colors.light.text,
    dark: colors.dark.text
  }, 'text');

  const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

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

  const renderFooter = useCallback(
    (props: BottomSheetDefaultFooterProps) => (
      <BottomSheetFooter {...props}>
        <View style={[styles.buttonContainer, styles.footerWrap, { backgroundColor }]}>
          <TouchableOpacity
            onPress={onCancel || handleClose}
            style={[styles.outlineButton, { borderColor }]}
          >
            <ThemedText
              style={[styles.outlineButtonText, { color: textColor }]}
              lightColor={colors.light.text}
              darkColor={colors.dark.text}
            >
              {cancelText.toUpperCase()}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            style={[
              styles.confirmButton,
              {
                borderColor,
                backgroundColor: isDark ? colors.dark.white : colors.light.black,
              },
              confirmButtonStyle,
            ]}
          >
            <ThemedText
              style={[styles.confirmButtonText, confirmTextStyle]}
              lightColor={colors.light.white}
              darkColor={colors.dark.black}
            >
              {confirmText.toUpperCase()}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </BottomSheetFooter>
    ),
    [
      backgroundColor,
      borderColor,
      cancelText,
      confirmButtonStyle,
      confirmText,
      confirmTextStyle,
      handleClose,
      handleConfirm,
      isDark,
      onCancel,
      textColor,
    ]
  );

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
          index={0}
          snapPoints={memoizedSnapPoints}
          onChange={handleSheetChanges}
          onClose={handleClose}
          enablePanDownToClose={true}
          enableDynamicSizing={false}
          footerComponent={renderFooter}
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
              renderRight={() => <BackButton iconName="x" onPress={handleClose} containerStyle={styles.closeButton} />}
              title={
                <View style={styles.titleContainer}>
                    <View style={styles.titleTextContainer}>
                      <ThemedText
                        style={styles.confirmEyebrow}
                        lightColor={colors.light.secondary}
                        darkColor={colors.dark.secondary}
                      >
                        {caption}
                      </ThemedText>
                      <ThemedText
                        style={styles.confirmTitle}
                        lightColor={colors.light.text}
                        darkColor={colors.dark.text}
                      >
                        {title}
                      </ThemedText>
                  </View>
                </View>
              }
            />

            {icon && (
              <View style={styles.iconContainer}>
                {icon}
              </View>
            )}

            <ThemedText 
              style={[styles.description, { color: labelColor }]}
              lightColor={colors.light.secondary}
              darkColor={colors.dark.secondary}
            >
              {description}
            </ThemedText>
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
    paddingBottom: heightPixel(16),
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
  closeButton: {
    marginTop: heightPixel(8),
  },
  confirmEyebrow: {
    fontSize: fontPixel(10),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
    marginBottom: heightPixel(8),
  },
  confirmTitle: {
    fontSize: fontPixel(24),
    fontFamily: 'Bold',
    letterSpacing: -0.5,
    lineHeight: fontPixel(28),
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: heightPixel(24),
    paddingHorizontal: widthPixel(20),
  },
  icon: {
    width: widthPixel(60),
    height: widthPixel(60),
  },
  description: {
    fontSize: fontPixel(15),
    fontFamily: 'Regular',
    lineHeight: fontPixel(22),
    marginBottom: heightPixel(20),
    paddingHorizontal: widthPixel(20),
  },
  footerWrap: {
    paddingBottom: heightPixel(50),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: widthPixel(12),
    paddingHorizontal: widthPixel(20),
  },
  outlineButton: {
    minWidth: widthPixel(100),
    paddingVertical: heightPixel(14),
    paddingHorizontal: widthPixel(20),
    borderWidth: 0.5,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    fontSize: fontPixel(12),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
  },
  confirmButton: {
    minWidth: widthPixel(100),
    paddingVertical: heightPixel(14),
    paddingHorizontal: widthPixel(20),
    borderWidth: 0.5,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: fontPixel(12),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
  },
});
