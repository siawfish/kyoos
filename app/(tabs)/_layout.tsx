import { Tabs, usePathname } from 'expo-router';
import { actions } from '@/redux/app/slice';
import { useCallback, useEffect, useState } from 'react';
import BottomTab from '@/components/ui/BottomTab';
import { useAppDispatch } from '@/store/hooks';
import { PermissionRequestSheet } from '@/components/ui/PermissionRequestSheet';
import { usePermissionsRequestQueue } from '@/hooks/use-permissions-request-queue';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { getCurrentLocation } from '@/constants/helpers';
import { PermissionStatus } from 'expo-location';

const MenuItems = [
  {
    name: '(search)',
    title: 'Home',
    icon: 'home',
    iconOutline: 'home-outline'
  },
  {
    name: '(bookings)',
    title: 'Bookings',
    icon: 'calendar-check',
    iconOutline: 'calendar-outline'
  },
  {
    name: '(messaging)',
    title: 'Messages',
    icon: 'chat',
    iconOutline: 'chat-outline'
  },
  {
    name: 'notifications',
    title: 'Notifications',
    icon: 'bell',
    iconOutline: 'bell-outline'
  },
  {
    name: '(settings)',
    title: 'Settings',
    icon: 'cog',
    iconOutline: 'cog-outline'
  }
];

interface CustomTabBarProps extends BottomTabBarProps {
  showTabBar: boolean;
}

const CustomTabBar = ({ showTabBar, ...props }: CustomTabBarProps) => {
  if (!showTabBar) {
    return null;
  }
  return <BottomTab {...props} />;
};

export default function Layout() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const { currentPermission, permissionsQueue, handleOnPermissionDenied, handleOnPermissionGranted, locationPermission } = usePermissionsRequestQueue({
    onLocationPermissionGranted: () => {
      setCurrentLocation();
    }
  });

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

  const [showTabBar, setShowTabBar] = useState(false);

  useEffect(() => {
    const mainRoutes = [
      '/',
      '/(search)',
      '/bookings',
      '/(bookings)/bookings',
      '/messaging',
      '/(messaging)/messaging',
      '/settings',
      '/(settings)/settings',
    ];

    const shouldShowTabBar = mainRoutes.includes(pathname);
    setShowTabBar(shouldShowTabBar);
  }, [pathname]);

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
