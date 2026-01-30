import Status from '@/components/ui/Status';
import { Booking } from '@/redux/booking/types';
import IsPassedBookingBadge from '@/components/ui/IsPassedBookingBadge';
import React from 'react';
import { useBookingStatus } from '@/hooks/useBookingStatus';

interface StatusProps {
    booking: Booking;
}

const BookingStatus = ({
    booking,
}: StatusProps) => {
    const { isPassed } = useBookingStatus(booking);
    if(isPassed) {
        return <IsPassedBookingBadge size="small" />
    }
    return <Status booking={booking} />;
};

export default BookingStatus;
