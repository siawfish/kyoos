import { colors } from "@/constants/theme/colors";
import { Booking } from "@/redux/booking/types";
import { BookingStatuses } from "@/redux/app/types";
import { isPast } from "date-fns";
import { useAppTheme } from "./use-app-theme";
import { isWithinTheTimeRange } from "@/constants/helpers";

const getStatusColor = (status: BookingStatuses, isDark: boolean) => {
    switch (status) {
        case BookingStatuses.ONGOING:
            return isDark ? colors.dark.white : colors.light.black;
        case BookingStatuses.COMPLETED:
            return colors.light.green;
        case BookingStatuses.CANCELLED:
        case BookingStatuses.DECLINED:
            return colors.light.danger;
        case BookingStatuses.PENDING:
        case BookingStatuses.ACCEPTED:
        default:
            return isDark ? colors.dark.secondary : colors.light.secondary;
    }
}

const getStatusStyle = (status: BookingStatuses, isDark: boolean) => {
    switch (status) {
        case BookingStatuses.ONGOING:
            return {
                color: isDark ? colors.dark.white : colors.light.black,
                borderColor: isDark ? colors.dark.white : colors.light.black,
            };
        case BookingStatuses.COMPLETED:
            return {
                color: colors.light.green,
                borderColor: colors.light.green,
            };
        case BookingStatuses.CANCELLED:
        case BookingStatuses.DECLINED:
            return {
                color: colors.light.danger,
                borderColor: colors.light.danger,
            };
        case BookingStatuses.PENDING:
        case BookingStatuses.ACCEPTED:
        default:
            return {
                color: isDark ? colors.dark.secondary : colors.light.secondary,
                borderColor: isDark ? colors.dark.secondary : colors.light.secondary,
            };
    }
};


export const useBookingStatus = (booking: Booking | undefined) => {
    const colorScheme = useAppTheme();
    if (!booking) return {
        statusColor: colors.light.secondary,
        isPassed: false,
        withinTheTimeRange: false,
    }
    const isDark = colorScheme === 'dark';
    const statusColor = getStatusColor(booking.status, isDark);
    const statusStyle = getStatusStyle(booking.status, isDark);
    const bookingTime = new Date(booking.date!).setTime(new Date(booking.startTime!).getTime());
    const bookingEndTime = new Date(booking.date!).setTime(new Date(booking.estimatedEndTime!).getTime());
    const isPassed = isPast(bookingTime);
    const withinTheTimeRange = isWithinTheTimeRange(new Date(bookingTime).toISOString(), new Date(bookingEndTime).toISOString());
    const canChat = !isPassed && booking.status !== BookingStatuses.COMPLETED && booking.status !== BookingStatuses.CANCELLED && booking.status !== BookingStatuses.DECLINED;

    return {
        statusColor,
        statusStyle,
        isPassed,
        withinTheTimeRange,
        canChat,
    }
}