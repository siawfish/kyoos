import BookingCard from '@/components/bookings/BookingCard';
import BookingCardSkeleton from '@/components/bookings/BookingCardSkeleton';
import WeekCalendar from '@/components/bookings/WeekCalendar';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { formatRelativeDate } from '@/constants/helpers';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { format } from 'date-fns';
import React, { useEffect, useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { AgendaEntry } from 'react-native-calendars';
import { FlashList } from '@shopify/flash-list';
import { selectBookings, selectIsLoading, selectSelectedDate } from '@/redux/bookings/selector';
import { actions } from '@/redux/bookings/slice';
import { Booking } from '@/redux/booking/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
interface BookingAgendaEntry extends AgendaEntry {
  booking?: Booking;
}

export default function BookingsScreen() {
  const dispatch = useAppDispatch();
  const bookings = useAppSelector(selectBookings);
  const isLoading = useAppSelector(selectIsLoading);
  const selectedDateString = useAppSelector(selectSelectedDate);  

  useEffect(() => {
    dispatch(actions.fetchBookings());
  }, [dispatch]);
  
  const selectedDate = new Date(selectedDateString);
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
  const borderColor = isDark ? colors.dark.secondary : colors.light.black;

  const cardBg = isDark ? 'transparent' : colors.light.background;

  // Calculate booking counts per day for the calendar indicators
  const bookingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((booking: Booking) => {
      const dateKey = booking.date;
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  // Convert filtered bookings to agenda items
  const agendaItems: BookingAgendaEntry[] = bookings.map((booking: Booking) => ({
    name: `${booking.description} with ${booking.worker.name}`,
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
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyCard, { borderColor, backgroundColor: cardBg }]}>
          <View style={[styles.emptyAccent, { backgroundColor: borderColor }]} />
          <View style={styles.emptyInner}>
            <Image source={require('@/assets/images/empty-list.png')} style={styles.emptyImage} />
            <Text style={[styles.emptyTitle, { color: textColor }]}>
              No bookings
            </Text>
            <Text style={[styles.emptySubtitle, { color: subtitleColor }]}>
              No bookings scheduled for this day
            </Text>
          </View>
        </View>
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
        ListEmptyComponent={renderEmptyList}
        ItemSeparatorComponent={renderItemSeparator}
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
    paddingTop: heightPixel(20),
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
