import BookingStatusBadge from '@/components/ui/Status';
import { Booking } from '@/redux/booking/types';
import React from 'react';

interface StatusProps {
    booking: Booking;
}

const Status = ({
    booking,
}: StatusProps) => {
    return <BookingStatusBadge booking={booking} size="large" />;
};

export default Status;
