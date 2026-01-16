import React, { useEffect, useMemo } from "react";
import { StyleSheet, Image, ActivityIndicator, Text, View } from "react-native";
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

const Details = () => {
  const dispatch = useDispatch();
  const { id } = useLocalSearchParams<{ id: string }>();
  const allBookings = useSelector(selectBookings);
  const booking = useSelector(selectBooking);
  const isLoading = useSelector(selectIsLoading);
  const theme = useAppTheme();
  const isDark = theme === 'dark';

  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showReschedule, setShowReschedule] = React.useState(false);

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

  const textColor = useThemeColor({
    light: colors.light.text,
    dark: colors.dark.text
  }, 'text');
  const labelColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary
  }, 'text');
  const accentColor = isDark ? colors.dark.white : colors.light.black;
  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');
  const borderColor = isDark ? colors.dark.white : colors.light.black;

  // Loading state
  if (isLoading && !booking) {
    return (
      <ThemedSafeAreaView style={styles.container}>
        <Header onReschedule={() => {}} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      </ThemedSafeAreaView>
    );
  }

  // Booking not found state
  if (!booking) {
    return (
      <ThemedSafeAreaView style={styles.container}>
        <Header onReschedule={() => {}} />
        <View style={styles.notFoundContainer}>
          <View style={[styles.notFoundCard, { borderColor: accentColor, backgroundColor }]}>
            <View style={[styles.notFoundAccent, { backgroundColor: accentColor }]} />
            <View style={styles.notFoundContent}>
              <Text style={[styles.notFoundLabel, { color: labelColor }]}>NOT FOUND</Text>
              <Text style={[styles.notFoundTitle, { color: textColor }]}>
                Booking not found
              </Text>
              <Text style={[styles.notFoundText, { color: labelColor }]}>
                The booking you&apos;re looking for doesn&apos;t exist or has been removed.
              </Text>
            </View>
          </View>
        </View>
      </ThemedSafeAreaView>
    );
  }

  const confirmReschedule = () => {
      setShowReschedule(false);
      dispatch(actions.rescheduleBooking(booking.id));
      router.push({
          pathname: '/(tabs)/(bookings)/booking',
          params: {
            callbackRoute: `/(tabs)/(bookings)/${booking.id}`,
          },
      });
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <Header onReschedule={() => setShowReschedule(true)} />
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
        <Actions onCancel={() => setShowConfirm(true)} />
      </View>
      {showConfirm && (
        <ConfirmActionSheet 
          isOpen={showConfirm} 
          isOpenChange={() => setShowConfirm(!showConfirm)} 
          onConfirm={() => setShowConfirm(false)} 
          title="Cancel Booking?" 
          icon={<Image source={require('@/assets/images/danger.png')} style={styles.dangerIcon} />}
          description={`Are you sure you want to cancel this booking? This action can not be reversed. ${booking?.worker?.name} will also be notified.`}
          confirmText="Yes, Cancel Booking"
          cancelText="Cancel"
        />
      )}
      {showReschedule && (
        <ConfirmActionSheet 
          isOpen={showReschedule} 
          isOpenChange={() => setShowReschedule(!showReschedule)} 
          onConfirm={confirmReschedule} 
          title="Reschedule Booking?" 
          icon={<Image source={require('@/assets/images/calendar.png')} style={styles.dangerIcon} />}
          description={`Are you sure you want to reschedule this booking? This action cannot be reversed. ${booking?.worker?.name} will also be notified.`}
          confirmText="Yes, Reschedule Booking"
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
    paddingHorizontal: widthPixel(16),
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
