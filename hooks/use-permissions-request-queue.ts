import { useEffect, useMemo, useState } from "react";
import { PermissionType } from "@/redux/app/types";
import { PermissionStatus, useCameraPermissions, useMediaLibraryPermissions } from "expo-image-picker";
import { getForegroundPermissionsAsync } from "expo-location";
import { Alert } from "react-native";
import { actions } from "@/redux/app/slice";
import { getPermissionRequestMessage } from "@/constants/helpers";
import { usePathname } from "expo-router";
import * as Notifications from 'expo-notifications';
import { useAppDispatch } from "@/store/hooks";

export const usePermissionsRequestQueue = ({ onLocationPermissionGranted }: { onLocationPermissionGranted?: () => void }) => {
  const [cameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission] = useMediaLibraryPermissions();
  const [permissionsQueue, setPermissionsQueue] = useState<PermissionType[]>([]);
  const [locationPermission, setLocationPermission] = useState<PermissionStatus | undefined>(PermissionStatus.UNDETERMINED);
  const [pushNotificationPermission, setPushNotificationPermission] = useState<PermissionStatus | undefined>(PermissionStatus.UNDETERMINED);
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await getForegroundPermissionsAsync();
      setLocationPermission(status);
    };
    requestLocationPermission();
  }, []);

  useEffect(() => {
    const requestPushNotificationPermission = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setPushNotificationPermission(status);
    };
    requestPushNotificationPermission();
  }, []);

  useEffect(() => {
    let permissionsArray: PermissionType[] = [];
    if(cameraPermission?.status !== 'granted') {
      permissionsArray.push(PermissionType.CAMERA);
    } else {
      permissionsArray = permissionsArray.filter((permission) => permission !== PermissionType.CAMERA);
    }
    if(mediaLibraryPermission?.status !== 'granted') {
      permissionsArray.push(PermissionType.MEDIA_LIBRARY);
    } else {
      permissionsArray = permissionsArray.filter((permission) => permission !== PermissionType.MEDIA_LIBRARY);
    }
    if(locationPermission !== 'granted') {
      permissionsArray.push(PermissionType.LOCATION);
    } else {
      permissionsArray = permissionsArray.filter((permission) => permission !== PermissionType.LOCATION);
    }
    if(pushNotificationPermission !== 'granted') {
      permissionsArray.push(PermissionType.PUSH_NOTIFICATION);
    } else {
      permissionsArray = permissionsArray.filter((permission) => permission !== PermissionType.PUSH_NOTIFICATION);
    }
    setPermissionsQueue(permissionsArray);
  }, [cameraPermission?.status, mediaLibraryPermission?.status, locationPermission, pushNotificationPermission]);

  const currentPermission = useMemo(() => {
    return permissionsQueue[0];
  }, [permissionsQueue]);
  
  const handleOnPermissionDenied = () => {
    Alert.alert(
      getPermissionRequestMessage(currentPermission).title, 
      getPermissionRequestMessage(currentPermission).message, 
      pathname === '/register' ?
      [
        { text: 'Cancel', style: 'destructive' },
      ] :
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', 
          style: 'destructive', 
          onPress: () => dispatch(actions.logout())
        },
      ]
    ); 
  }

  const handleOnPermissionGranted = async () => {
    const newPermissionsQueue = permissionsQueue.filter((permission) => permission !== currentPermission);
    setPermissionsQueue(newPermissionsQueue);
    if(!newPermissionsQueue.find((permission) => permission === PermissionType.LOCATION)) {
      onLocationPermissionGranted?.();
    }
  }

  return {
    permissionsQueue,
    currentPermission,
    handleOnPermissionDenied,
    handleOnPermissionGranted,
    locationPermission,
    cameraPermission: cameraPermission?.status,
    mediaLibraryPermission: mediaLibraryPermission?.status,
    pushNotificationPermission: pushNotificationPermission,
  };
};
