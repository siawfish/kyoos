import { widthPixel } from '@/constants/normalize';
import { PermissionType } from '@/redux/app/types';
import { useCameraPermissions, useMediaLibraryPermissions } from 'expo-image-picker';
import { requestForegroundPermissionsAsync } from 'expo-location';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { Alert, Image, Linking, StyleSheet, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ConfirmActionSheet } from '../ConfirmActionSheet';

interface PermissionRequestSheetProps {
  isOpen: boolean;
  isOpenChange: (isOpen: boolean) => void;
  permissionType: PermissionType;
  title?: string;
  description?: string;
  onGranted?: () => void;
  onDenied?: () => void;
  customIcon?: React.ReactNode;
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
  title,
  description,
  onGranted,
  onDenied,
  customIcon,
}) => {
  const [, requestPermission] = useCameraPermissions();
  const [, requestMediaLibraryPermission] = useMediaLibraryPermissions();
  const { title: defaultTitle, description: defaultDescription, icon: defaultIcon } = getDefaultMessages(permissionType);

  const getAppropriatePermission = useCallback(() => {
    if(permissionType === PermissionType.CAMERA) return requestPermission;
    if(permissionType === PermissionType.MEDIA_LIBRARY) return requestMediaLibraryPermission;
    if(permissionType === PermissionType.LOCATION) return async () => requestForegroundPermissionsAsync();
    if(permissionType === PermissionType.PUSH_NOTIFICATION) return async () => await Notifications.requestPermissionsAsync();
    return () => Promise.resolve({ status: 'denied' });
  }, [permissionType, requestMediaLibraryPermission, requestPermission]);

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
  }, [getAppropriatePermission, onGranted, isOpenChange, handleClose]);

  if (!isOpen) return null;

  return (
    <ConfirmActionSheet
      isOpen={isOpen}
      isOpenChange={isOpenChange}
      title={title || defaultTitle}
      description={description || defaultDescription}
      onConfirm={handleRequestPermission}
      confirmText="Allow Access"
      cancelText="Not Now"
      onCancel={handleClose}
      icon={
        customIcon || (
          <View style={styles.iconContainer}>
            <Image
              source={defaultIcon}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
        )
      }
      caption="PERMISSION REQUIRED"
      snapPoints={['45%']}
    />
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: '100%',
    alignItems: 'center',
  },
  icon: {
    width: widthPixel(80),
    height: widthPixel(80),
  },
});
