import { useAppSelector } from '@/store/hooks';
import { selectSearchHistoryId } from '@/redux/booking/selector';
import { Redirect, Stack } from 'expo-router';
import { useMemo } from 'react';

export default function BookingLayout() {
  const searchId = useAppSelector(selectSearchHistoryId);
  const isBookingReady = useMemo(() => {
    return searchId !== '';
  }, [searchId]);
  if(!isBookingReady) {
    return <Redirect href="/(tabs)/(search)" />;
  }
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="booking" 
      />
      <Stack.Screen 
        name="review-booking" 
      />
    </Stack>
  );
}


