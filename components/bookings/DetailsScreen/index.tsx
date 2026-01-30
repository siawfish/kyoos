import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Image, ActivityIndicator, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import BookingDetails from "@/components/bookings/BookingDetails";
import Header from "@/components/bookings/BookingDetails/Header";
import Actions from "@/components/bookings/BookingDetails/Actions";
import { ConfirmActionSheet } from "@/components/ui/ConfirmActionSheet";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { selectBooking, selectBookings, selectIsLoading } from "@/redux/bookings/selector";
import { actions } from "@/redux/bookings/slice";
import { Booking } from "@/redux/booking/types";
import { BookingStatuses } from "@/redux/app/types";
import EmptyList from "@/components/ui/EmptyList";

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
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showRebookConfirm, setShowRebookConfirm] = useState(false);
  const [showReportConfirm, setShowReportConfirm] = useState(false);

  // Find the booking by ID
  const stateBooking = useMemo(() => {
    return allBookings.find((b: Booking) => b.id === id);
  }, [allBookings, id]);

  // Fetch bookings if not already loaded
  useEffect(() => {
    if (!stateBooking) {
      dispatch(actions.fetchBooking(id));
      return;
    }
    dispatch(actions.fetchBookingSuccess(stateBooking));
  }, [dispatch, stateBooking, id]);
  
  const accentColor = isDark ? colors.dark.white : colors.light.black;
  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');
  const borderColor = isDark ? colors.dark.white : colors.light.black;

  const handleBack = () => {
    router.back();
  };

  // Loading state
  if (isLoading && !booking) {
    return (
      <ThemedSafeAreaView style={styles.container}>
        <Header onBack={handleBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      </ThemedSafeAreaView>
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

  const handleDelete = () => {
      setShowDeleteConfirm(true);
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

  const handleComplete = () => {
    setShowCompleteConfirm(true);
  };

  const handleConfirmComplete = () => {
    if(!booking) return;
    setShowCompleteConfirm(false);
    dispatch(actions.completeBooking(booking.id));
  };

  const handleRebook = () => {
    setShowRebookConfirm(true);
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

  const handleConfirmReport = () => {
    if(!booking) return;
    setShowReportConfirm(false);
    dispatch(actions.reportBooking(booking.id));
  };

  const determineRescheduleAction = () => {
    if(booking?.status === BookingStatuses.PENDING) {
      return {
        onPress: handleReschedule,
        label: 'RESCHEDULE',
      };
    }
    if(booking?.status === BookingStatuses.ACCEPTED) {
      return {
        onPress: handleReschedule,
        label: 'RESCHEDULE',
      };
    }
    if(booking?.status === BookingStatuses.COMPLETED) {
      return {
        onPress: handleRebook,
        label: 'REBOOK',
      };
    }
    return undefined;
  };

  // Booking not found state
  if (!booking) {
    return (
      <ThemedSafeAreaView style={styles.container}>
        <Header onReschedule={determineRescheduleAction()} onBack={handleBack} />
        <EmptyList
          containerStyle={styles.notFoundContainer}
          message="The booking you're looking for doesn't exist or has been removed."
        />
      </ThemedSafeAreaView>
    );
  }

  return (
    <ThemedSafeAreaView style={styles.container}>
      <Header 
        onReschedule={determineRescheduleAction()} 
        onBack={handleBack} 
      />
      <View style={styles.contentContainer}>
        <BookingDetails booking={booking} />
      </View>
      <View style={[
        styles.fixedActions, 
        { 
          backgroundColor,
          borderTopColor: borderColor,
        }
      ]}>
        <Actions 
          onCancel={handleCancel} 
          onComplete={handleComplete} 
          onReport={handleReport} 
          onDelete={handleDelete} 
        />
      </View>
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
        {showCompleteConfirm && (
            <ConfirmActionSheet 
                isOpen={showCompleteConfirm} 
                isOpenChange={setShowCompleteConfirm} 
                onConfirm={handleConfirmComplete} 
                title="Complete Booking?" 
                icon={<Image source={require('@/assets/images/success.png')} style={styles.dangerIcon} />}
                description="Can you confirm that the booking has been completed?"
                confirmText="Yes, Complete Booking"
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
            <ConfirmActionSheet 
              isOpen={showReportConfirm} 
              isOpenChange={setShowReportConfirm} 
              onConfirm={handleConfirmReport} 
              title="Report Booking?" 
              icon={<Image source={require('@/assets/images/danger.png')} style={styles.dangerIcon} />}
              description={`Are you sure you want to report this booking with ${booking?.worker?.name}?`}
              confirmText="Yes, Report Booking"
              cancelText="Cancel"
            />
        )}
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  fixedActions: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(20),
    paddingTop: heightPixel(12),
    borderTopWidth: 0.5,
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
