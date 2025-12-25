import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import BottomTab from '@/components/ui/BottomTab';
import { actions } from '@/redux/app/slice';

export default function Layout() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(actions.getUser());
  }, []);

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
