import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { StyleSheet, TouchableOpacity, View, Modal, TouchableWithoutFeedback } from 'react-native';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useCallback, useMemo, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Media, MediaType } from '@/redux/app/types';
import { BlurView } from 'expo-blur';

export default function AttachMedia({
  disabled = false,
  onChange
}: {
  disabled?: boolean;
  onChange?: (media: Media[]) => void;
}) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const snapPoints = useMemo(() => ['22%'], []);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const textColor = useThemeColor({
      light: colors.light.text,
      dark: colors.dark.text,
    }, 'text');
    const backgroundColor = useThemeColor({
      light: colors.light.background,
      dark: colors.dark.background,
    }, 'background');
    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');
    const buttonBackgroundColor = useThemeColor({
      light: colors.light.white,
      dark: colors.dark.black,
    }, 'white');

    const handleAttachMedia = () => {
      setIsBottomSheetOpen(true);
      bottomSheetRef.current?.expand();
    };

    const handleClose = () => {
      setIsBottomSheetOpen(false);
      bottomSheetRef.current?.close();
    };

    const handleMediaPicker = async () => {
      try {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (!permissionResult.granted) {
          alert('Permission to access media library is required!');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsMultipleSelection: true,
          quality: 1,
          selectionLimit: 10,
        });
    
        handleClose();
        
        if (!result.canceled) {
          onChange?.(result.assets.map((asset) => ({
            type: asset.type === 'video' ? MediaType.VIDEO : MediaType.IMAGE,
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
          })));
        }
      } catch (error) {
        console.error('Error picking media:', error);
        alert('Failed to pick media. Please try again.');
        handleClose();
      }
    };
  
    const handleCamera = async () => {
      try {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        
        if (!permissionResult.granted) {
          alert('Permission to access camera is required!');
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          quality: 1,
        });
    
        handleClose();
        
        if (!result.canceled) {
          onChange?.(result.assets.map((asset) => ({
            type: asset.type === 'video' ? MediaType.VIDEO : MediaType.IMAGE,
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
          })));
        }
      } catch (error) {
        console.error('Error using camera:', error);
        alert('Failed to capture media. Please try again.');
        handleClose();
      }
    };

    const handleSheetChanges = useCallback((index: number) => {
      setIsBottomSheetOpen(index !== -1);
    }, []);
    
  return (
    <>
        <TouchableOpacity 
            style={[styles.actionButton, { borderColor: tintColor, backgroundColor: buttonBackgroundColor }]}
            onPress={handleAttachMedia}
            disabled={disabled}
        >
          <Ionicons name="images" size={16} color={tintColor} />
          <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>Attach Media</ThemedText>
        </TouchableOpacity>
        <Modal
            visible={isBottomSheetOpen}
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
                    snapPoints={snapPoints}
                    onChange={handleSheetChanges}
                    onClose={handleClose}
                    enablePanDownToClose
                    backgroundStyle={{
                        backgroundColor,
                        borderTopLeftRadius: 15,
                        borderTopRightRadius: 15,
                    }}
                >
                    <BottomSheetView style={styles.bottomSheetContent}>
                        <TouchableOpacity 
                            style={styles.bottomSheetItem} 
                            onPress={handleMediaPicker}
                        >
                            <Ionicons name="images" size={24} color={textColor} />
                            <ThemedText style={styles.bottomSheetText}>Upload Photo/Video</ThemedText>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.bottomSheetItem}
                            onPress={handleCamera}
                        >
                            <Ionicons name="camera" size={24} color={textColor} />
                            <ThemedText style={styles.bottomSheetText}>Open Camera</ThemedText>
                        </TouchableOpacity>
                    </BottomSheetView>
                </BottomSheet>
            </View>
        </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bottomSheetContent: {
    flex: 1,
    padding: widthPixel(16),
    paddingBottom: heightPixel(40),
  },
  bottomSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(12),
    paddingVertical: heightPixel(12),
  },
  bottomSheetText: {
    fontSize: fontPixel(16),
    fontFamily: 'Medium',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(6),
    paddingVertical: heightPixel(8),
    paddingHorizontal: widthPixel(16),
    borderRadius: widthPixel(20),
    borderWidth: 1,
    backgroundColor: 'white',
  },
  actionButtonText: {
    fontSize: fontPixel(12),
    fontFamily: 'Medium',
  },
});