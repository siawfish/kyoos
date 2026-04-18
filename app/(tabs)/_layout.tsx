import { Tabs, usePathname, useSegments } from 'expo-router';
import { actions } from '@/redux/app/slice';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import BottomTab from '@/components/ui/BottomTab';
import { useAppDispatch } from '@/store/hooks';
import { PermissionRequestSheet } from '@/components/ui/PermissionRequestSheet';
import { usePermissionsRequestQueue } from '@/hooks/use-permissions-request-queue';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { getCurrentLocation, MenuItems } from '@/constants/helpers';
import { PermissionStatus } from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useMessaging } from '@/hooks/useMessaging';
import { computeTabBarVisible } from '@/constants/navigation/tabBarVisibility';

interface CustomTabBarProps extends BottomTabBarProps {
  showTabBar: boolean;
}

const CustomTabBar = ({ showTabBar, ...props }: CustomTabBarProps) => {
  if (!showTabBar) {
    return null;
  }
  return <BottomTab {...props} />;
};

const handleRegistrationError = (errorMessage: string) => {
  console.warn(errorMessage);
};

export default function Layout() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const segments = useSegments();
  const { connect, disconnect } = useMessaging();
  const { currentPermission, permissionsQueue, handleOnPermissionDenied, handleOnPermissionGranted, locationPermission, pushNotificationPermission } = usePermissionsRequestQueue({
    onLocationPermissionGranted: () => setCurrentLocation(),
    onPushNotificationPermissionGranted: () => registerForPushNotificationsAsync()
  });
  
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const registerForPushNotificationsAsync = useCallback(async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  
    if (Device.isDevice) {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError('Project ID not found');
        return;
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        return pushTokenString;
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : 'An error occurred while getting push token';
        handleRegistrationError(errorMessage);
      }
    } else {
      handleRegistrationError('Must use physical device for push notifications');
    }
  }, []);

  const setCurrentLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation();
      if(!location) throw new Error('Location not found');
      dispatch(actions.setLocation({
        lat: location.lat,
        lng: location.lng,
        address: location.address,
        error: '',
        isLoading: false,
        isMapPickerOpen: false,
      }));
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error getting location',
        text2: error?.message || 'An error occurred while getting location',
      });
    }
  }, [dispatch]);

  useEffect(() => {
    if(locationPermission === PermissionStatus.GRANTED) {
      setCurrentLocation();
    }
  }, [locationPermission, setCurrentLocation]);

  useEffect(() => {
    if(pushNotificationPermission === PermissionStatus.GRANTED) {
      registerForPushNotificationsAsync().then((pushToken) => {
        if(pushToken) {
          dispatch(actions.registerPushToken(pushToken));
        }
      }).catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while registering push token';
        handleRegistrationError(errorMessage);
      });
    }
  }, [pushNotificationPermission, registerForPushNotificationsAsync, dispatch]);

  const [showTabBar, setShowTabBar] = useState(false);

  useEffect(() => {
    setShowTabBar(computeTabBarVisible(pathname, segments));
  }, [pathname, segments]);

  useEffect(() => {
    dispatch(actions.getUser());
  }, [dispatch]);

  return (
    <>
      <Tabs
        initialRouteName="(search)"
        screenOptions={{
          headerShown: false,
        }}
        tabBar={(props) => <CustomTabBar {...props} showTabBar={showTabBar} />}
      >
        {MenuItems.map((item) => (
          <Tabs.Screen
            key={item.name}
            name={item.name}
            options={{
              title: item.title,
            }}
          />
        ))}
      </Tabs>
      <PermissionRequestSheet
        isOpen={permissionsQueue.length > 0}
        isOpenChange={(isOpen) => {}}
        permissionType={currentPermission}
        onDenied={handleOnPermissionDenied}
        onGranted={handleOnPermissionGranted}
      />
    </>
  );
}
