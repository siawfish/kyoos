import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { PermissionType } from '@/redux/app/types';
import { BlurView } from 'expo-blur';
import { useCameraPermissions, useMediaLibraryPermissions } from 'expo-image-picker';
import { requestForegroundPermissionsAsync } from 'expo-location';
import { router } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { Alert, Dimensions, Image, Linking, Modal, StyleProp, StyleSheet, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Button from '../Button';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import * as Notifications from 'expo-notifications';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.45;

interface PermissionRequestSheetProps {
  isOpen: boolean;
  isOpenChange: (isOpen: boolean) => void;
  permissionType: PermissionType;
  title?: string;
  description?: string;
  onGranted?: () => void;
  onDenied?: () => void;
  customIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}
// Default messages based on permission type
const getDefaultMessages = (permissionType: PermissionType) => {
  switch (permissionType) {
    case PermissionType.CAMERA:
      return {
        title: "Camera Access Required",
        description: "We need access to your camera to capture photos and videos. This helps you share moments with your friends and family.",
        icon: require('@/assets/images/camera-permission.png'),
      };
    case PermissionType.LOCATION:
      return {
        title: "Location Access Required",
        description: "We need access to your location to provide you with location-based features and services.",
        icon: require('@/assets/images/location-permission.png'),
      };
    case PermissionType.MEDIA_LIBRARY:
      return {
        title: "Media Library Access Required",
        description: "We need access to your media library to upload photos and videos.",
        icon: require('@/assets/images/media-library-permission.png'),
      };
    case PermissionType.PUSH_NOTIFICATION:
      return {
        title: "Push Notification Access Required",
        description: "We need access to your push notifications to receive notifications from us.",
        icon: require('@/assets/images/notification-bell.png'),
      };
    // Add more cases for other permission types
    default:
      return {
        title: "Permission Required",
        description: "We need your permission to provide you with the best experience.",
        icon: require('@/assets/images/permission.png'),
      };
  }
};

export const PermissionRequestSheet: React.FC<PermissionRequestSheetProps> = ({
  isOpen,
  isOpenChange,
  permissionType = PermissionType.CAMERA,
  onGranted,
  onDenied,
  customIcon,
  style,
}) => {
  const [, requestPermission] = useCameraPermissions();
  const [, requestMediaLibraryPermission] = useMediaLibraryPermissions();
  const translateY = useSharedValue(0);
  const context = useSharedValue({ y: 0 });
  const active = useSharedValue(false);

  const backgroundColor = useThemeColor(
    {
      light: colors.light.background,
      dark: colors.dark.background,
    },
    "background"
  );

  const textColor = useThemeColor(
    {
      light: colors.light.text,
      dark: colors.dark.text,
    },
    "text"
  );

  const buttonTextColor = useThemeColor(
    {
      light: colors.light.white,
      dark: colors.dark.black,
    },
    "text"
  );

  const { title: defaultTitle, description: defaultDescription, icon: defaultIcon } = getDefaultMessages(permissionType);

  useEffect(() => {
    if (isOpen) {
      translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
      active.value = true;
    } else {
      translateY.value = withSpring(0, { damping: 50 });
      active.value = false;
    }
  }, [isOpen]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = event.translationY + context.value.y;
      translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
    })
    .onEnd(() => {
      if (translateY.value > -SCREEN_HEIGHT * 0.3) {
        translateY.value = withSpring(0, { damping: 50 });
        runOnJS(handleClose)();
      } else {
        translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
      }
    });

  const rBottomSheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const getAppropriatePermission = () => {
    if(permissionType === PermissionType.CAMERA) return requestPermission;
    if(permissionType === PermissionType.MEDIA_LIBRARY) return requestMediaLibraryPermission;
    if(permissionType === PermissionType.LOCATION) return async () => requestForegroundPermissionsAsync();
    if(permissionType === PermissionType.PUSH_NOTIFICATION) return async () => await Notifications.requestPermissionsAsync();
    return () => Promise.resolve({ status: 'denied' });
  }

  const handleClose = useCallback(() => {
    isOpenChange(false);
    onDenied?.();
  }, [isOpenChange, onDenied]);

  const handleRequestPermission = useCallback(async () => {
    try {
      const { status } = await getAppropriatePermission()();
      if (status === 'granted') {
        onGranted?.();
      } else if(status === 'denied') {
        Alert.alert('Permission Denied', 'Goto settings to enable permission', [
          { text: 'Go to settings', onPress: () => {
            Linking.openSettings();
          } },
          { text: 'Cancel', style: 'destructive', onPress: () => {
            router.push('/(auth)');
          } },
        ]);
      }
      isOpenChange(false);
    } catch (error) {
      console.error('Error requesting permission:', error);
      handleClose();
    }
  }, [permissionType, onGranted, isOpenChange, handleClose]);

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
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[
              styles.bottomSheetContainer,
              rBottomSheetStyle,
              { backgroundColor },
              style
            ]}
          >
            <View style={styles.line} />
            <View style={[styles.contentContainer, { backgroundColor }]}>
              <View style={styles.iconContainer}>
                {customIcon || (
                  <Image 
                    source={defaultIcon}
                    style={styles.icon} 
                    resizeMode="contain"
                  />
                )}
              </View>
              <ThemedText type="defaultSemiBold" style={styles.title}>
                {defaultTitle}
              </ThemedText>
              <ThemedText 
                style={styles.description}
                lightColor={colors.light.secondary}
                darkColor={colors.dark.secondary}
              >
                {defaultDescription}
              </ThemedText>
              <View style={styles.buttonContainer}>
                <Button
                  onPress={handleClose}
                  style={[styles.outlineButton, { borderColor: textColor }]}
                  label="Not Now"
                  labelStyle={{ color: textColor }}
                />
                <Button
                  onPress={handleRequestPermission}
                  style={styles.button}
                  label="Allow Access"
                  labelStyle={{ color: buttonTextColor }}
                />
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: SCREEN_HEIGHT,
    borderRadius: 0,
    zIndex: 100,
  },
  line: {
    width: 75,
    height: 4,
    backgroundColor: 'grey',
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 0,
  },
  contentContainer: {
    paddingHorizontal: widthPixel(24),
    paddingVertical: heightPixel(24),
    minHeight: heightPixel(350),
    alignItems: 'center',
  },
  title: {
    fontSize: fontPixel(24),
    marginBottom: heightPixel(12),
    textAlign: 'center',
  },
  description: {
    fontSize: fontPixel(16),
    marginBottom: heightPixel(32),
    textAlign: 'center',
    lineHeight: heightPixel(24),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: widthPixel(12),
    width: '100%',
  },
  button: {
    flex: 1,
    marginHorizontal: 0,
    paddingHorizontal: widthPixel(16),
  },
  outlineButton: {
    flex: 1,
    marginHorizontal: 0,
    backgroundColor: 'transparent',
    borderWidth: 1,
    paddingHorizontal: widthPixel(16),
  },
  iconContainer: {
    marginBottom: heightPixel(24),
    alignItems: 'center',
  },
  icon: {
    width: widthPixel(80),
    height: widthPixel(80),
  },
});
