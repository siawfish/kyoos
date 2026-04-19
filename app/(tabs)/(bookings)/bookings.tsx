import BookingDayTimeline from '@/components/bookings/BookingDayTimeline';
import WeekCalendar from '@/components/bookings/WeekCalendar';
import { AccentScreenHeader } from '@/components/ui/AccentScreenHeader';
import { ConfirmActionSheet } from '@/components/ui/ConfirmActionSheet';
import OverlayLoader from '@/components/ui/OverlayLoader';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { formatRelativeDate } from '@/constants/helpers';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { selectFetchingConversation } from '@/redux/messaging/selector';
import { router, useFocusEffect } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { actions as messagingActions } from '@/redux/messaging/slice';
import HeaderNotificationButton from '@/components/ui/AccentScreenHeader/HeaderNotificationButton';

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
  const isLoadingMessaging = useAppSelector(selectFetchingConversation);
  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    'text'
  );
  const secondaryColor = useThemeColor(
    { light: colors.light.secondary, dark: colors.dark.secondary },
    'text'
  );

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRebookConfirm, setShowRebookConfirm] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);

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

  useFocusEffect(useCallback(() => {
    dispatch(actions.fetchBookings());
  }, [dispatch]));

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

  const handleDateSelect = useCallback((date: Date) => {
    dispatch(actions.setSelectedDate(date.toISOString()));
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    dispatch(actions.refreshBookings());
  }, [dispatch]);

  const handleChatWorker = (booking: Booking) => {
    if(!booking) return;
    dispatch(messagingActions.fetchOrCreateConversationByBooking(booking.id));
  };

  const confirmReschedule = (booking: Booking) => {
    if(!booking) return;
    setShowReschedule(false);
    dispatch(actions.rescheduleBooking(booking.id));
    router.push({
      pathname: '/(tabs)/(bookings)/booking',
      params: {
        callbackRoute: `/(tabs)/(bookings)/bookings`,
      },
    });
  };

  const handleReschedule = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowReschedule(true);
  };

  const handleCancel = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = (booking: Booking) => {
    if(!booking) return;
    setShowCancelConfirm(false);
    dispatch(actions.cancelBooking(booking.id));
  };

  const handleConfirmDelete = (booking: Booking) => {
    if(!booking) return;
    setShowDeleteConfirm(false);
    dispatch(actions.deleteBooking(booking.id));
  };

  const handleRebook = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowRebookConfirm(true);
  };

  const handleConfirmRebook = (booking: Booking) => {
    if(!booking) return;
    setShowRebookConfirm(false);
    dispatch(actions.rebookBooking(booking.id));
    router.push({
      pathname: '/(tabs)/(bookings)/booking',
      params: {
        callbackRoute: `/(tabs)/(bookings)/bookings`,
      },
    });
  };

  const handleReport = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowReportConfirm(true);
  };

  const handleConfirmReport = (booking: Booking) => {
    if(!booking) return;
    setShowReportConfirm(false);
    dispatch(actions.reportBooking(booking.id));
  };



  const pageHeader = useMemo(
    () => (
      <AccentScreenHeader
        renderRight={()=><HeaderNotificationButton />}
        title={
          <View>
            <Text style={[styles.bookingsEyebrow, { color: secondaryColor }]}>BOOKINGS</Text>
            <Text
              style={[
                styles.bookingsHeroTitle,
                { color: textColor, textTransform: 'capitalize' },
              ]}
            >
              {formatRelativeDate(format(selectedDate, 'yyyy-MM-dd'))}
            </Text>
            <Text style={[styles.bookingsSubtitle, { color: secondaryColor }]}>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
        }
      />
    ),
    [selectedDate, textColor, secondaryColor]
  );

  const weekCalendar = useMemo(
    () => (
      <WeekCalendar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        bookingCounts={bookingCounts}
      />
    ),
    [selectedDate, bookingCounts, handleDateSelect]
  );

  return (
    <ScreenLayout style={styles.containerStyle}>
      <View style={styles.timelineWrap}>
        <BookingDayTimeline
          bookings={bookingsForSelectedDate}
          selectedDate={selectedDate}
          isLoading={isLoading}
          pageHeader={pageHeader}
          calendar={weekCalendar}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          onChatWorker={handleChatWorker}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
          onRebook={handleRebook}
          onReport={handleReport}
        />
      </View>
      {isLoadingMessaging && (
          <OverlayLoader />
      )}
      {showReschedule && (
          <ConfirmActionSheet 
              isOpen={showReschedule} 
              isOpenChange={(open) => {
                setShowReschedule(open);
                if (!open) setSelectedBooking(null);
              }} 
              onConfirm={() => {
                if (selectedBooking) confirmReschedule(selectedBooking);
              }} 
              title="Reschedule Booking?" 
              icon={<Image source={require('@/assets/images/event.png')} style={styles.dangerIcon} />}
              description={`Are you sure you want to reschedule this booking${selectedBooking?.worker?.name ? ` with ${selectedBooking.worker.name}` : ''}?`}
              confirmText="Yes, Reschedule Booking"
              cancelText="Cancel"
          />
      )}
      {showCancelConfirm && (
          <ConfirmActionSheet 
              isOpen={showCancelConfirm} 
              isOpenChange={(open) => {
                setShowCancelConfirm(open);
                if (!open) setSelectedBooking(null);
              }} 
              onConfirm={() => {
                if (selectedBooking) handleConfirmCancel(selectedBooking);
              }} 
              title="Cancel Booking?" 
              icon={<Image source={require('@/assets/images/danger.png')} style={styles.dangerIcon} />}
              description={`Are you sure you want to cancel this booking? This action cannot be reversed.${selectedBooking?.worker?.name ? ` ${selectedBooking.worker.name} will also be notified.` : ''}`}
              confirmText="Yes, Cancel Booking"
              cancelText="Cancel"
          />
      )}
      {showDeleteConfirm && (
          <ConfirmActionSheet 
              isOpen={showDeleteConfirm} 
              isOpenChange={(open) => {
                setShowDeleteConfirm(open);
                if (!open) setSelectedBooking(null);
              }} 
              onConfirm={() => {
                if (selectedBooking) handleConfirmDelete(selectedBooking);
              }} 
              title="Delete Booking?" 
              icon={<Image source={require('@/assets/images/danger.png')} style={styles.dangerIcon} />}
              description="Are you sure you want to delete this booking? This action cannot be reversed."
              confirmText="Yes, Delete"
              cancelText="Cancel"
          />
      )}
      {showRebookConfirm && (
          <ConfirmActionSheet 
              isOpen={showRebookConfirm} 
              isOpenChange={(open) => {
                setShowRebookConfirm(open);
                if (!open) setSelectedBooking(null);
              }} 
              onConfirm={() => {
                if (selectedBooking) handleConfirmRebook(selectedBooking);
              }} 
              title="Rebook Booking?" 
              icon={<Image source={require('@/assets/images/event.png')} style={styles.dangerIcon} />}
              description={`Are you sure you want to book another session${selectedBooking?.worker?.name ? ` with ${selectedBooking.worker.name}` : ''}?`}
              confirmText="Yes, Rebook Booking"
              cancelText="Cancel"
          />
      )}
      {showReportConfirm && (
          <ConfirmActionSheet 
              isOpen={showReportConfirm} 
              isOpenChange={(open) => {
                setShowReportConfirm(open);
                if (!open) setSelectedBooking(null);
              }} 
              onConfirm={() => {
                if (selectedBooking) handleConfirmReport(selectedBooking);
              }} 
              title="Report Booking?" 
              icon={<Image source={require('@/assets/images/danger.png')} style={styles.dangerIcon} />}
              description={`Are you sure you want to report this booking${selectedBooking?.worker?.name ? ` with ${selectedBooking.worker.name}` : ''}?`}
              confirmText="Yes, Report Booking"
              cancelText="Cancel"
          />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
  },
  timelineWrap: {
    flex: 1,
  },
  bookingsHeader: {
    paddingHorizontal: widthPixel(16),
    marginBottom: heightPixel(24),
  },
  bookingsEyebrow: {
    fontSize: fontPixel(11),
    fontFamily: 'SemiBold',
    letterSpacing: 2,
    marginBottom: heightPixel(8),
  },
  bookingsHeroTitle: {
    fontSize: fontPixel(36),
    fontFamily: 'Bold',
    letterSpacing: -1,
    marginBottom: heightPixel(4),
  },
  bookingsSubtitle: {
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
  },
  dangerIcon: {
      width: widthPixel(60),
      height: widthPixel(60),
  }
});
