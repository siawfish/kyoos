import { Booking } from '@/redux/booking/types';
import React from 'react';
import Status from '@/components/ui/Status';

interface StatusProps {
    booking: Booking;
}

const BookingStatus = ({
    booking
}:StatusProps) => {
    return (
        <Status booking={booking} />
    )
};

export default BookingStatus;