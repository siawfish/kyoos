import Button from '@/components/ui/Button';
import { fontPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { selectBooking, selectIsUpdatingBooking } from '@/redux/bookings/selector';
import { useAppSelector } from '@/store/hooks';
import { BookingStatuses } from '@/redux/app/types';
import { useThemeColor } from '@/hooks/use-theme-color';


interface ActionsProps {
  readonly onCancel?: () => void;
  readonly onComplete?: () => void;
  readonly onReport?: () => void;
  readonly onDelete?: () => void;
}

const Actions = ({
    onCancel,
    onComplete,
    onReport,
    onDelete,
}:ActionsProps) => {
  const booking = useAppSelector(selectBooking);
  const isUpdatingBooking = useAppSelector(selectIsUpdatingBooking);
  const iconColor = useThemeColor({
    light: colors.light.white,
    dark: colors.dark.black
  }, 'black');

  const action = () => {
    if (booking?.status === BookingStatuses.CANCELLED || booking?.status === BookingStatuses.DECLINED) {
      return []
    }

    if (booking?.status === BookingStatuses.ONGOING) {
      return [
        {
          label: '',
          icon: <Ionicons name="close" size={fontPixel(16)} color={colors.light.white} />,
          style: styles.smallBtn,
          labelStyle: styles.cancelLabel,
          onPress: onCancel,
        },
        {
          label: 'COMPLETE BOOKING',
          icon: <Ionicons name="checkmark" size={fontPixel(16)} color={iconColor} />,
          style: styles.bookingBtn,
          labelStyle: styles.bookingLabel,
          onPress: onComplete,
        }
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

    return [
      {
        label: 'CANCEL BOOKING',
        icon: <Ionicons name="close" size={fontPixel(16)} color={colors.light.white} />,
        style: styles.cancelBtn,
        labelStyle: styles.cancelLabel,
        onPress: onCancel,
      }
    ];
  };
  if(action().length === 0) return null;
  return (
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
    smallBtn: {
      width: widthPixel(80),
      backgroundColor: colors.light.danger,
      borderRadius: 0,
      marginHorizontal: 0,
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
      // color: colors.light.white,
      fontSize: fontPixel(12),
      fontFamily: 'SemiBold',
      letterSpacing: 1.5,
    },
})
