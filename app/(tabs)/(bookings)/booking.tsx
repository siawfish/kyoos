import BookingScreen from "@/components/bookings/BookingScreen";
import { actions } from "@/redux/booking/slice";
import { selectBookingId, selectIsSuccess } from "@/redux/booking/selector";
import { actions as searchActions } from "@/redux/search/slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import Success from "@/components/bookings/Success";

export default function Booking() {
    const isSuccess = useAppSelector(selectIsSuccess);
    const bookingId = useAppSelector(selectBookingId);
    const dispatch = useAppDispatch();

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
                <Success 
                    onButtonPress={handleSuccessClose} 
                    title="Booking Updated" 
                    text="Your booking has been updated. We will notify you when the booking is accepted." 
                    buttonLabel="View Booking" 
                />
            )}
        </>
    )
}