import BookingCard from '@/components/bookings/BookingCard';
import WeekCalendar from '@/components/bookings/WeekCalendar';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { formatRelativeDate } from '@/constants/helpers';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { format, isSameDay } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { AgendaEntry } from 'react-native-calendars';

interface BookingAgendaEntry extends AgendaEntry {
  booking?: any;
}

// Mock data for preview - bookings spread across different days
// TODO: Replace with actual data from Redux
const mockBookings: any[] = [];

export default function BookingsScreen() {
  // TODO: Replace with actual data from Redux
  const allBookings = mockBookings;
  const isLoading = false;
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = isDark ? colors.dark.text : colors.light.text;
  const subtitleColor = isDark ? colors.dark.secondary : colors.light.secondary;
  const accentColor = isDark ? colors.dark.white : colors.light.black;

  const backgroundColor = useThemeColor({ light: colors.light.background, dark: colors.dark.background}, 'background');

  // Calculate booking counts per day for the calendar indicators
  const bookingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allBookings.forEach((booking: any) => {
      // TODO: Adjust based on actual booking data structure
      const dateKey = booking?.service?.appointmentDateTime?.date?.value || format(selectedDate, 'yyyy-MM-dd');
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    });
    return counts;
  }, [allBookings]);

  // Filter bookings for the selected date
  const filteredBookings = useMemo(() => {
    return allBookings.filter((booking: any) => {
      // TODO: Adjust based on actual booking data structure
      const bookingDate = booking?.service?.appointmentDateTime?.date?.value;
      if (!bookingDate) return false;
      return isSameDay(new Date(bookingDate), selectedDate);
    });
  }, [allBookings, selectedDate]);

  // Convert filtered bookings to agenda items
  const agendaItems: BookingAgendaEntry[] = filteredBookings.map((booking: any) => ({
    name: `${booking?.service?.description || 'Booking'} with ${booking?.client?.name || 'Client'}`,
    height: 80,
    day: booking?.service?.appointmentDateTime?.date?.value || format(selectedDate, 'yyyy-MM-dd'),
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
            <View style={[styles.emptyCard, { borderColor: accentColor, backgroundColor }]}>
              <View style={[styles.emptyAccent, { backgroundColor: accentColor }]} />
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
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(32),
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
    paddingHorizontal: widthPixel(20),
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
    paddingHorizontal: widthPixel(20),
    gap: heightPixel(12),
  },
});
