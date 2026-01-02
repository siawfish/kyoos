import BookingCard from '@/components/bookings/BookingCard';
import WeekCalendar from '@/components/bookings/WeekCalendar';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { formatRelativeDate } from '@/constants/helpers';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { format, isSameDay } from 'date-fns';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AgendaEntry } from 'react-native-calendars';
import { useDispatch, useSelector } from 'react-redux';
import { selectBookings, selectIsLoading } from '@/redux/bookings/selector';
import { actions } from '@/redux/bookings/slice';
import { Booking } from '@/redux/bookings/types';

interface BookingAgendaEntry extends AgendaEntry {
  booking?: Booking;
}

export default function BookingsScreen() {
  const dispatch = useDispatch();
  const allBookings = useSelector(selectBookings);
  const isLoading = useSelector(selectIsLoading);

  useEffect(() => {
    dispatch(actions.fetchBookings());
  }, [dispatch]);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
    allBookings.forEach((booking: Booking) => {
      const dateKey = booking.service.appointmentDateTime.date.value;
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });
    return counts;
  }, [allBookings]);

  // Filter bookings for the selected date
  const filteredBookings = useMemo(() => {
    return allBookings.filter((booking: Booking) => {
      const bookingDate = booking.service.appointmentDateTime.date.value;
      if (!bookingDate) return false;
      return isSameDay(new Date(bookingDate), selectedDate);
    });
  }, [allBookings, selectedDate]);

  // Convert filtered bookings to agenda items
  const agendaItems: BookingAgendaEntry[] = filteredBookings.map((booking: Booking) => ({
    name: `${booking.service.description} with ${booking.client.name}`,
    height: 80,
    day: booking.service.appointmentDateTime.date.value,
    booking
  }));
  
  return (
    <ThemedSafeAreaView 
      style={styles.containerStyle}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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
          onDateSelect={setSelectedDate}
          bookingCounts={bookingCounts}
        />

        {/* Content */}
        {isLoading && !filteredBookings.length ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={accentColor} />
          </View>
        ) : filteredBookings.length === 0 ? (
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
        ) : (
          <View style={styles.bookingsList}>
            {agendaItems.map((item, index) => (
              <BookingCard 
                key={item.booking?.id || index} 
                reservation={item} 
                isFirst={index === 0} 
              />
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: heightPixel(40),
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: heightPixel(100),
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: widthPixel(16),
    paddingTop: heightPixel(20),
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
    paddingHorizontal: widthPixel(16),
    gap: heightPixel(12),
  },
});
