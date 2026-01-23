import BackButton from '@/components/ui/BackButton';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { useCallback, useMemo, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export interface AttachmentBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectGallery: () => void;
  onSelectDocument: () => void;
  onTakePhoto: () => void;
}

export default function AttachmentBottomSheet({
  visible,
  onClose,
  onSelectGallery,
  onSelectDocument,
  onTakePhoto,
}: AttachmentBottomSheetProps) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%'], []);

  const backgroundColor = useThemeColor(
    { light: colors.light.background, dark: colors.dark.background },
    'background'
  );
  const borderColor = useThemeColor(
    { light: colors.light.black, dark: colors.dark.white },
    'text'
  );
  const labelColor = useThemeColor(
    { light: colors.light.secondary, dark: colors.dark.secondary },
    'text'
  );
  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    'text'
  );

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const handleSelectGallery = useCallback(() => {
    onClose();
    setTimeout(() => onSelectGallery(), 300);
  }, [onClose, onSelectGallery]);

  const handleSelectDocument = useCallback(() => {
    onClose();
    setTimeout(() => onSelectDocument(), 300);
  }, [onClose, onSelectDocument]);

  const handleTakePhoto = useCallback(() => {
    onClose();
    setTimeout(() => onTakePhoto(), 300);
  }, [onClose, onTakePhoto]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <BottomSheet
          ref={sheetRef}
          index={0}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          onClose={onClose}
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
          <BottomSheetView style={[styles.attachmentSheetContent, { backgroundColor }]}>
            <View style={styles.attachmentSheetHeader}>
              <View style={styles.attachmentSheetHeaderLeft}>
                <View style={[styles.attachmentSheetAccentBar, { backgroundColor: borderColor }]} />
                <ThemedText style={[styles.attachmentSheetLabel, { color: labelColor }]}>
                  ATTACHMENT OPTIONS
                </ThemedText>
                <ThemedText
                  style={[styles.attachmentSheetTitle, { color: textColor }]}
                  lightColor={colors.light.text}
                  darkColor={colors.dark.text}
                >
                  Attachment Options
                </ThemedText>
              </View>
              <BackButton iconName="x" onPress={onClose} containerStyle={styles.attachmentSheetCloseButton} />
            </View>

            <View style={styles.attachmentOptionsContainer}>
              <TouchableOpacity
                style={[styles.attachmentOptionButton, { borderColor, backgroundColor }]}
                onPress={handleSelectGallery}
              >
                <Ionicons name="image-outline" size={fontPixel(18)} color={textColor} />
                <ThemedText
                  style={[styles.attachmentOptionText, { color: textColor }]}
                  lightColor={colors.light.text}
                  darkColor={colors.dark.text}
                >
                  SELECT FROM GALLERY
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.attachmentOptionButton, { borderColor, backgroundColor }]}
                onPress={handleSelectDocument}
              >
                <Ionicons name="document-text-outline" size={fontPixel(18)} color={textColor} />
                <ThemedText
                  style={[styles.attachmentOptionText, { color: textColor }]}
                  lightColor={colors.light.text}
                  darkColor={colors.dark.text}
                >
                  SELECT DOCUMENT
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.attachmentOptionButton, { borderColor, backgroundColor }]}
                onPress={handleTakePhoto}
              >
                <Ionicons name="camera-outline" size={fontPixel(18)} color={textColor} />
                <ThemedText
                  style={[styles.attachmentOptionText, { color: textColor }]}
                  lightColor={colors.light.text}
                  darkColor={colors.dark.text}
                >
                  TAKE A PHOTO
                </ThemedText>
              </TouchableOpacity>
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
  attachmentSheetContent: {
    flex: 1,
    paddingTop: heightPixel(20),
    paddingBottom: heightPixel(20),
    overflow: 'hidden',
  },
  attachmentSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(24),
  },
  attachmentSheetHeaderLeft: {
    flex: 1,
  },
  attachmentSheetAccentBar: {
    width: widthPixel(40),
    height: heightPixel(4),
    marginBottom: heightPixel(16),
  },
  attachmentSheetLabel: {
    fontSize: fontPixel(10),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
    marginBottom: heightPixel(8),
  },
  attachmentSheetTitle: {
    fontSize: fontPixel(24),
    fontFamily: 'Bold',
    letterSpacing: -0.5,
    lineHeight: fontPixel(28),
  },
  attachmentSheetCloseButton: {
    marginTop: heightPixel(8),
  },
  attachmentOptionsContainer: {
    paddingHorizontal: widthPixel(16),
    gap: heightPixel(12),
  },
  attachmentOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(12),
    paddingVertical: heightPixel(16),
    paddingHorizontal: widthPixel(16),
    borderWidth: 0.5,
    borderRadius: 0,
  },
  attachmentOptionText: {
    fontSize: fontPixel(14),
    fontFamily: 'SemiBold',
    letterSpacing: 1,
  },
});
