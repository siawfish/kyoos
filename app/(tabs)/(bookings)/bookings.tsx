import BookingCard from '@/components/bookings/BookingCard';
import BookingCardSkeleton from '@/components/bookings/BookingCardSkeleton';
import WeekCalendar from '@/components/bookings/WeekCalendar';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { formatRelativeDate } from '@/constants/helpers';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Booking } from '@/redux/booking/types';
import { selectBookings, selectBookingsForSelectedDate, selectCurrentWeekStart, selectIsLoading, selectIsRefreshing, selectSelectedDate } from '@/redux/bookings/selector';
import { actions } from '@/redux/bookings/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { FlashList } from '@shopify/flash-list';
import { format, startOfWeek } from 'date-fns';
import React, { useCallback, useEffect, useMemo } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AgendaEntry } from 'react-native-calendars';
import EmptyList from '@/components/ui/EmptyList';
interface BookingAgendaEntry extends AgendaEntry {
  booking?: Booking;
}

export default function BookingsScreen() {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(selectBookings);
  const bookingsForSelectedDate = useAppSelector(selectBookingsForSelectedDate);
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
      // Week changed - update week start (this will trigger fetch via saga)
      dispatch(actions.setCurrentWeekStart(newWeekStart.toISOString()));
    }
  }, [selectedDate, currentWeekStart, dispatch]);

  // Initial fetch on mount (uses current week start from state)
  useEffect(() => {
    dispatch(actions.fetchBookings());
  }, [dispatch]);
  const theme = useAppTheme();
  const isDark = theme === 'dark';

  const textColor = useThemeColor({
    light: colors.light.text,
    dark: colors.dark.text
  }, 'text');
  const subtitleColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary
  }, 'text');
  const accentColor = isDark ? colors.dark.white : colors.light.black;

  // Calculate booking counts per day for the calendar indicators
  const bookingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((booking: Booking) => {
      // Normalize date to 'yyyy-MM-dd' format to match WeekCalendar lookup
      const dateKey = booking.date.includes('T') 
        ? format(new Date(booking.date), 'yyyy-MM-dd')
        : booking.date;
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  // Convert filtered bookings to agenda items (for selected day display)
  const agendaItems: BookingAgendaEntry[] = bookingsForSelectedDate.map((booking: Booking) => ({
    name: `${booking.description} with ${booking?.worker?.name}`,
    height: 80,
    day: booking.date,
    booking
  }));

  // Create skeleton data array when loading
  const skeletonData = useMemo(() => {
    if (isLoading) {
      return Array(3).fill(null).map((_, index) => ({ id: `skeleton-${index}`, isSkeleton: true }));
    }
    return [];
  }, [isLoading]);

  // Determine which data to show
  const listData = isLoading ? skeletonData : agendaItems;

  const handleDateSelect = (date: Date) => {
    dispatch(actions.setSelectedDate(date.toISOString()));
  };

  const onRefresh = useCallback(() => {
    dispatch(actions.refreshBookings());
  }, [dispatch]);

  const renderItem = ({ item, index }: { item: BookingAgendaEntry | { id: string; isSkeleton: boolean }; index: number }) => {
    if ('isSkeleton' in item && item.isSkeleton) {
      return <BookingCardSkeleton />;
    }
    return (
      <BookingCard 
        reservation={item as BookingAgendaEntry} 
        isFirst={index === 0} 
      />
    );
  };

  const renderItemSeparator = () => {
    return <View style={styles.itemSeparator} />;
  };

  const renderEmptyList = () => {
    if (isLoading || isRefreshing) return null;
    return (
      <EmptyList containerStyle={styles.emptyContainer} message="No bookings scheduled for this day" />
    );
  };

  const renderListHeader = () => {
    if (!isRefreshing) return null;
    return (
      <View>
        <BookingCardSkeleton />
        <View style={styles.itemSeparator} />
      </View>
    );
  };
  
  return (
    <ThemedSafeAreaView 
      style={styles.containerStyle}
    >
      <View style={styles.header}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <Text style={[styles.label, { color: subtitleColor }]}>
          BOOKINGS
        </Text>
        <Text style={[styles.title, { color: textColor }]}>
          {formatRelativeDate(format(selectedDate, 'yyyy-MM-dd'))}
        </Text>
        <Text style={[styles.subtitle, { color: subtitleColor }]}>
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </Text>
      </View>

      {/* Week Calendar */}
      <WeekCalendar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        bookingCounts={bookingCounts}
      />
      <FlashList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => {
          if ('isSkeleton' in item && item.isSkeleton) {
            return item.id;
          }
          const agendaItem = item as BookingAgendaEntry;
          return agendaItem.booking?.id || String(agendaItem.day);
        }}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyList}
        ItemSeparatorComponent={renderItemSeparator}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      />
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(100),
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
    paddingTop: heightPixel(100),
  },
  itemSeparator: {
    height: heightPixel(12),
  },
  emptyCard: {
    borderWidth: 0.5,
    borderTopWidth: 0,
    overflow: 'hidden',
  },
  emptyAccent: {
    height: heightPixel(3),
    width: '100%',
  },
  emptyInner: {
    alignItems: 'center',
    paddingVertical: heightPixel(48),
    paddingHorizontal: widthPixel(24),
  },
  emptyImage: {
    width: widthPixel(80),
    height: widthPixel(80),
    marginBottom: heightPixel(20),
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: fontPixel(18),
    fontFamily: 'SemiBold',
    marginBottom: heightPixel(8),
  },
  emptySubtitle: {
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
    textAlign: 'center',
  },
  bookingsList: {
    gap: heightPixel(12),
  },
});
