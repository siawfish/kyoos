import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Image, ActivityIndicator, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { ScreenLayout } from "@/components/layout/ScreenLayout";
import BookingDetails from "@/components/bookings/BookingDetails";
import Actions from "@/components/bookings/BookingDetails/Actions";
import { AccentScreenHeader } from "@/components/ui/AccentScreenHeader";
import { ConfirmActionSheet } from "@/components/ui/ConfirmActionSheet";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useAppTheme } from "@/hooks/use-app-theme";
import { selectBooking, selectBookings, selectIsLoading } from "@/redux/bookings/selector";
import { actions } from "@/redux/bookings/slice";
import { Booking } from "@/redux/booking/types";
import EmptyList from "@/components/ui/EmptyList";
import BackButton from "@/components/ui/BackButton";
import RatingSheet from "@/components/ui/RatingSheet";
import ReportSheet from "@/components/ui/ReportSheet";
import { BookingStatuses } from "@/redux/app/types";

const Details = () => {
  const dispatch = useDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const allBookings = useSelector(selectBookings);
  const booking = useSelector(selectBooking);
  const isLoading = useSelector(selectIsLoading);
  const theme = useAppTheme();
  const isDark = theme === 'dark';

  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRebookConfirm, setShowRebookConfirm] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);
  const [showRateWorker, setShowRateWorker] = useState(false);

  // Find the booking by ID
  const stateBooking = useMemo(() => {
    return allBookings.find((b: Booking) => b.id === id);
  }, [allBookings, id]);

  // Fetch bookings if not already loaded
  useEffect(() => {
    if(stateBooking) {
      dispatch(actions.fetchBookingSuccess(stateBooking));
    }
    dispatch(actions.fetchBooking(id));
  }, [dispatch, id, stateBooking]);
  
  const accentColor = isDark ? colors.dark.white : colors.light.black;
  const textColor = isDark ? colors.dark.text : colors.light.text;
  const labelColor = isDark ? colors.dark.secondary : colors.light.secondary;
  const handleBack = () => {
    router.back();
  };

  const handleRebook = () => {
    setShowRebookConfirm(true);
  };

  const renderBookingDetailHeader = (b: Booking | null | undefined) => (
    <AccentScreenHeader
      renderRight={b?.status === BookingStatuses.COMPLETED ? 
        () => <BackButton iconName="refresh-ccw" onPress={handleRebook} /> : 
        () => <BackButton iconName="x" onPress={handleBack} />
      }
      onBackPress={b?.status === BookingStatuses.COMPLETED ? handleBack : undefined}
      title={
        b ? (
          <View>
            <Text style={[styles.detailSectionLabel, { color: labelColor }]}>
              BOOKING DETAILS
            </Text>
            <Text style={[styles.detailTitle, { color: textColor }]}>{b.description}</Text>
            <View style={styles.clientRow}>
              <Text style={[styles.withText, { color: labelColor }]}>with</Text>
              <Image
                source={{ uri: b.worker?.avatar }}
                style={[styles.avatar, { backgroundColor: labelColor }]}
              />
              <Text style={[styles.clientName, { color: textColor }]}>
                {b.worker?.name}
              </Text>
            </View>
          </View>
        ) : undefined
      }
    />
  );

  // Loading state
  if (isLoading && !booking) {
    return (
      <ScreenLayout style={styles.container}>
        {renderBookingDetailHeader(undefined)}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      </ScreenLayout>
    );
  }

  const confirmReschedule = () => {
    if(!booking) return;
    setShowReschedule(false);
    dispatch(actions.rescheduleBooking(booking.id));
    router.push({
      pathname: '/(tabs)/(bookings)/booking',
      params: {
        callbackRoute: `/(tabs)/(bookings)/${booking.id}`,
      },
    });
  };

  const handleReschedule = () => {
      setShowReschedule(true);
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    if(!booking) return;
    setShowCancelConfirm(false);
    dispatch(actions.cancelBooking(booking.id));
  };

  const handleConfirmDelete = () => {
    if(!booking) return;
    setShowDeleteConfirm(false);
    dispatch(actions.deleteBooking(booking.id));
  };

  const handleConfirmRebook = () => {
    if(!booking) return;
    setShowRebookConfirm(false);
    dispatch(actions.rebookBooking(booking.id));
    router.push({
      pathname: '/(tabs)/(bookings)/booking',
      params: {
        callbackRoute: `/(tabs)/(bookings)/${booking.id}`,
      },
    });
  };

  const handleReport = () => {
      setShowReportConfirm(true);
  };

  const handleConfirmReport = (reason: string, comment: string) => {
    if (!booking) return;
    setShowReportConfirm(false);
    dispatch(
      actions.reportBooking({
        bookingId: booking.id,
        reason,
        comment,
      })
    );
  };

  const handleRateWorker = () => {
    if(!booking) return;
    setShowRateWorker(true);
  };

  const handleConfirmRateWorker = (rating: number, comment: string) => {
    if (!booking) return;
    setShowRateWorker(false);
    dispatch(actions.rateWorker({ bookingId: booking.id, rating, comment }));
  };

  // Booking not found state
  if (!booking) {
    return (
      <ScreenLayout style={styles.container}>
        {renderBookingDetailHeader(undefined)}
        <EmptyList
          containerStyle={styles.notFoundContainer}
          message="The booking you're looking for doesn't exist or has been removed."
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout style={styles.container}>
      {renderBookingDetailHeader(booking)}
      <View style={styles.contentContainer}>
        <BookingDetails booking={booking} />
      </View>
        <Actions 
          onCancel={handleCancel} 
          onReport={handleReport} 
          onRateWorker={handleRateWorker} 
          onReschedule={handleReschedule}
        />
        {showReschedule && (
          <ConfirmActionSheet 
            isOpen={showReschedule} 
            isOpenChange={setShowReschedule} 
            onConfirm={confirmReschedule} 
            title="Reschedule Booking?" 
            icon={<Image source={require('@/assets/images/event.png')} style={styles.dangerIcon} />}
            description={`Are you sure you want to reschedule this booking with ${booking?.worker?.name}?`}
            confirmText="Yes, Reschedule Booking"
            cancelText="Cancel"
          />
        )}
        {showCancelConfirm && (
          <ConfirmActionSheet 
            isOpen={showCancelConfirm} 
            isOpenChange={setShowCancelConfirm} 
            onConfirm={handleConfirmCancel} 
            title="Cancel Booking?" 
            icon={<Image source={require('@/assets/images/danger.png')} style={styles.dangerIcon} />}
            description={`Are you sure you want to cancel this booking? This action cannot be reversed. ${booking?.worker?.name} will also be notified.`}
            confirmText="Yes, Cancel Booking"
            cancelText="Cancel"
          />
        )}
        {showDeleteConfirm && (
          <ConfirmActionSheet 
            isOpen={showDeleteConfirm} 
            isOpenChange={setShowDeleteConfirm} 
            onConfirm={handleConfirmDelete} 
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
            isOpenChange={setShowRebookConfirm} 
            onConfirm={handleConfirmRebook} 
            title="Rebook Booking?" 
            icon={<Image source={require('@/assets/images/event.png')} style={styles.dangerIcon} />}
            description={`Are you sure you want to book another session with ${booking?.worker?.name}?`}
            confirmText="Yes, Rebook Booking"
            cancelText="Cancel"
          />
        )}


        {showReportConfirm && (
          <ReportSheet
            isOpen={showReportConfirm}
            onClose={() => setShowReportConfirm(false)}
            onConfirm={handleConfirmReport}
            userName={booking.worker?.name}
          />
        )}
        {showRateWorker && (
          <RatingSheet
            isOpen={showRateWorker}
            onClose={() => setShowRateWorker(false)}
            onConfirm={handleConfirmRateWorker}
            userName={booking.worker?.name}
          />
        )}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  detailSectionLabel: {
    fontSize: fontPixel(10),
    fontFamily: 'SemiBold',
    letterSpacing: 2,
    marginBottom: heightPixel(8),
  },
  detailTitle: {
    fontSize: fontPixel(28),
    fontFamily: 'Bold',
    letterSpacing: -0.5,
    marginBottom: heightPixel(12),
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(8),
  },
  withText: {
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
  },
  avatar: {
    width: widthPixel(24),
    height: widthPixel(24),
    borderRadius: 0,
  },
  clientName: {
    fontSize: fontPixel(14),
    fontFamily: 'SemiBold',
  },
  dangerIcon: {
    width: widthPixel(60),
    height: widthPixel(60),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: heightPixel(100),
  },
  notFoundContainer: {
    flex: 1,
    paddingHorizontal: widthPixel(60),
    paddingTop: heightPixel(20),
  },
  notFoundCard: {
    borderWidth: 0.5,
    borderTopWidth: 0,
    overflow: 'hidden',
  },
  notFoundAccent: {
    height: heightPixel(3),
    width: '100%',
  },
  notFoundContent: {
    alignItems: 'center',
    paddingVertical: heightPixel(48),
    paddingHorizontal: widthPixel(16),
  },
  notFoundLabel: {
    fontSize: fontPixel(10),
    fontFamily: 'SemiBold',
    letterSpacing: 2,
    marginBottom: heightPixel(8),
  },
  notFoundTitle: {
    fontSize: fontPixel(24),
    fontFamily: 'Bold',
    marginBottom: heightPixel(8),
    textAlign: 'center',
  },
  notFoundText: {
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
    textAlign: 'center',
    lineHeight: fontPixel(20),
  },
});

export default Details;
