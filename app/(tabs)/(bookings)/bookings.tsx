import BookingDayTimeline from '@/components/bookings/BookingDayTimeline';
import WeekCalendar from '@/components/bookings/WeekCalendar';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { formatRelativeDate } from '@/constants/helpers';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Booking } from '@/redux/booking/types';
import {
  selectBookings,
  selectBookingsForSelectedDateSorted,
  selectCurrentWeekStart,
  selectIsLoading,
  selectIsRefreshing,
  selectSelectedDate,
} from '@/redux/bookings/selector';
import { actions } from '@/redux/bookings/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { format, startOfWeek } from 'date-fns';
import React, { useCallback, useEffect, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import EmptyList from '@/components/ui/EmptyList';

export default function BookingsScreen() {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(selectBookings);
  const bookingsForSelectedDate = useAppSelector(
    selectBookingsForSelectedDateSorted
  );
  const isLoading = useAppSelector(selectIsLoading);
  const isRefreshing = useAppSelector(selectIsRefreshing);
  const selectedDateString = useAppSelector(selectSelectedDate);
  const currentWeekStart = useAppSelector(selectCurrentWeekStart);

  const selectedDate = useMemo(() => {
    return new Date(selectedDateString);
  }, [selectedDateString]);

  // Sync week start and fetch bookings when week changes
  useEffect(() => {
    const newWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const currentWeekStartDate = new Date(currentWeekStart);

    if (newWeekStart.getTime() !== currentWeekStartDate.getTime()) {
      dispatch(actions.setCurrentWeekStart(newWeekStart.toISOString()));
    }
  }, [selectedDate, currentWeekStart, dispatch]);

  // Initial fetch on mount (uses current week start from state)
  useEffect(() => {
    dispatch(actions.fetchBookings());
  }, [dispatch]);

  const theme = useAppTheme();
  const isDark = theme === 'dark';

  const textColor = useThemeColor(
    {
      light: colors.light.text,
      dark: colors.dark.text,
    },
    'text'
  );
  const subtitleColor = useThemeColor(
    {
      light: colors.light.secondary,
      dark: colors.dark.secondary,
    },
    'text'
  );
  const accentColor = isDark ? colors.dark.white : colors.light.black;

  const bookingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((booking: Booking) => {
      const dateKey = booking.date.includes('T')
        ? format(new Date(booking.date), 'yyyy-MM-dd')
        : booking.date;
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  const handleDateSelect = (date: Date) => {
    dispatch(actions.setSelectedDate(date.toISOString()));
  };

  const onRefresh = useCallback(() => {
    dispatch(actions.refreshBookings());
  }, [dispatch]);

  const showEmpty =
    !isLoading && !isRefreshing && bookingsForSelectedDate.length === 0;

  return (
    <ThemedSafeAreaView style={styles.containerStyle}>
      <View style={styles.header}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <Text style={[styles.label, { color: subtitleColor }]}>BOOKINGS</Text>
        <Text style={[styles.title, { color: textColor }]}>
          {formatRelativeDate(format(selectedDate, 'yyyy-MM-dd'))}
        </Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </Text>
      </View>

      <WeekCalendar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        bookingCounts={bookingCounts}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        }
      >
        <BookingDayTimeline
          bookings={bookingsForSelectedDate}
          selectedDate={selectedDate}
          isLoading={isLoading}
        />
        {showEmpty ? (
          <EmptyList
            containerStyle={styles.emptyContainer}
            message="No bookings scheduled for this day"
          />
        ) : null}
      </ScrollView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(100),
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: widthPixel(16),
    marginBottom: heightPixel(24),
  },
  accentBar: {
    width: widthPixel(40),
    height: heightPixel(4),
    marginBottom: heightPixel(20),
  },
  label: {
    fontSize: fontPixel(11),
    fontFamily: 'SemiBold',
    letterSpacing: 2,
    marginBottom: heightPixel(8),
  },
  title: {
    fontSize: fontPixel(36),
    fontFamily: 'Bold',
    letterSpacing: -1,
    marginBottom: heightPixel(4),
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
  },
  emptyContainer: {
    flex: 1,
    paddingTop: heightPixel(48),
    minHeight: heightPixel(200),
  },
});
