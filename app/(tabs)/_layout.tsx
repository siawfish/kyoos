import { Tabs } from 'expo-router';
import { actions } from '@/redux/app/slice';
import { useEffect } from 'react';
import BottomTab from '@/components/ui/BottomTab';
import { useAppDispatch } from '@/store/hooks';

export default function Layout() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(actions.getUser());
  }, [dispatch]);

  return (
    <Tabs
      initialRouteName="(search)"
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <BottomTab {...props} />}
    >
      <Tabs.Screen
        name="(search)" 
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="(settings)"
        options={{
          title: 'Settings',
          header: () => null
        }}
      />
      <Tabs.Screen
        name="(messaging)"
        options={{
          title: 'Messages',
          header: () => null
        }}
      />
      <Tabs.Screen
        name="(bookings)"
        options={{
          title: 'Bookings',
          header: () => null
        }}
      />
    </Tabs>
  );
}
