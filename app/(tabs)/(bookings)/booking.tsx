import BookingScreen from "@/components/bookings/BookingScreen";
import SuccessOverlay from "@/components/ui/SuccessOverlay";
import { useAppTheme } from "@/hooks/use-app-theme";
import { actions } from "@/redux/booking/slice";
import { selectBookingId, selectIsSuccess } from "@/redux/booking/selector";
import { actions as searchActions } from "@/redux/search/slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { StyleSheet } from "react-native";

export default function Booking() {
    const isSuccess = useAppSelector(selectIsSuccess);
    const bookingId = useAppSelector(selectBookingId);
    const dispatch = useAppDispatch();
    const colorScheme = useAppTheme();
    const isDark = colorScheme === 'dark';

    const handleSuccessClose = () => {
        if(!bookingId) return;
        router.replace(`/(tabs)/(bookings)/${bookingId}`);
        dispatch(actions.resetState());
        dispatch(searchActions.resetState());
    };
    return (
        <>
            <BookingScreen />

            {isSuccess && (
                <>
                    <BlurView
                        intensity={60}
                        tint={isDark ? 'dark' : 'light'}
                        style={StyleSheet.absoluteFill}
                    />
                    <SuccessOverlay
                        title="Booking Updated"
                        text="Your booking has been updated. We will notify you when the booking is accepted."
                        buttonLabel="View Booking"
                        onButtonPress={handleSuccessClose}
                    />
                </>
            )}
        </>
    )
}