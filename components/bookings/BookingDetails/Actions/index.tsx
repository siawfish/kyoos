import Button from '@/components/ui/Button';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { selectBooking, selectIsUpdatingBooking } from '@/redux/bookings/selector';
import { useAppSelector } from '@/store/hooks';
import { BookingStatuses } from '@/redux/app/types';
import { useBookingStatus } from '@/hooks/useBookingStatus';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppTheme } from '@/hooks/use-app-theme';
interface ActionsProps {
  readonly onCancel?: () => void;
  readonly onReport?: () => void;
  readonly onDelete?: () => void;
  readonly onReschedule?: () => void;
}

const Actions = ({
    onCancel,
    onReport,
    onReschedule,
}:ActionsProps) => {
  const booking = useAppSelector(selectBooking);
  const isUpdatingBooking = useAppSelector(selectIsUpdatingBooking);
  const { isPassed } = useBookingStatus(booking!);
  const iconColor = useThemeColor({
    light: colors.light.white,
    dark: colors.dark.black
  }, 'black');
  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');
  const theme = useAppTheme();
  const isDark = theme === 'dark';
  const borderColor = isDark ? colors.dark.white : colors.light.black;


  const action = () => {
    if (booking?.status === BookingStatuses.CANCELLED || booking?.status === BookingStatuses.DECLINED) {
      return []
    }

    if (booking?.status === BookingStatuses.ONGOING) {
      return [
        {
          label: 'CANCEL BOOKING',
          icon: <Ionicons name="close" size={fontPixel(16)} color={colors.light.white} />,
          style: styles.cancelBtn,
          labelStyle: styles.cancelLabel,
          onPress: onCancel,
        },
      ]
    }

    if (booking?.status === BookingStatuses.COMPLETED) {
      return [
        {
          label: 'REPORT BOOKING',
          icon: <Ionicons name="flag" size={fontPixel(16)} color={colors.light.white} />,
          style: styles.cancelBtn,
          labelStyle: styles.cancelLabel,
          onPress: onReport,
        }
      ]
    }

    if (booking?.status === BookingStatuses.ACCEPTED) {
      if (isPassed) {
        return [
          {
            label: 'RESCHEDULE BOOKING',
            icon: <Ionicons name="calendar" size={fontPixel(16)} color={iconColor} />,
            style: styles.bookingBtn,
            labelStyle: styles.bookingLabel,
            onPress: onReschedule,
          }
        ]
      }
      return [
        {
          label: 'CANCEL BOOKING',
          icon: <Ionicons name="close" size={fontPixel(16)} color={colors.light.white} />,
          style: styles.cancelBtn,
          labelStyle: styles.cancelLabel,
          onPress: onCancel,
        }
      ]
    }

    if (booking?.status === BookingStatuses.PENDING && isPassed) {
      return [
        {
          label: 'RESCHEDULE BOOKING',
          icon: <Ionicons name="calendar" size={fontPixel(16)} color={iconColor} />,
          style: styles.bookingBtn,
          labelStyle: styles.bookingLabel,
          onPress: onReschedule,
        }
      ]
    }

    return [];
  };
  if(action().length === 0) return null;
  return (
    <View style={[
      styles.fixedActions, 
      { 
        backgroundColor,
        borderTopColor: borderColor,
      }
    ]}>
      <View style={styles.action}>
        {
          action().map((item) => (
            <Button 
              key={item.label}
              onPress={item.onPress}
              label={item.label}
              icon={item.icon}  
              style={item.style}
              labelStyle={item.labelStyle}
              isLoading={item.label ? isUpdatingBooking : false}
              disabled={isUpdatingBooking}
            />
          ))
        }
      </View>
    </View>
  )
}

export default Actions

const styles = StyleSheet.create({
    action: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: widthPixel(10),
    },
    cancelBtn: {
      marginHorizontal: 0,
      backgroundColor: colors.light.danger,
      borderRadius: 0,
      paddingHorizontal: widthPixel(16),
      flex: 1,
    },
    cancelLabel: {
      color: colors.light.white,
      fontSize: fontPixel(12),
      fontFamily: 'SemiBold',
      letterSpacing: 1.5,
    },
    bookingBtn: {
      marginHorizontal: 0,
      flex: 1,
      borderRadius: 0,
    },
    bookingLabel: {
      fontSize: fontPixel(12),
      fontFamily: 'SemiBold',
      letterSpacing: 1.5,
    },
    fixedActions: {
      paddingHorizontal: widthPixel(16),
      paddingBottom: heightPixel(20),
      paddingTop: heightPixel(12),
      borderTopWidth: 0.5,
    },
})
