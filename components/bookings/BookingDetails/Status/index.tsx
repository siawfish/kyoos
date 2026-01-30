import { AuxStatus } from '@/redux/bookings/types';
import { Booking } from '@/redux/booking/types';
import React from 'react';
import { useBookingStatus } from '@/hooks/useBookingStatus';
import Status from '@/components/ui/Status';
import AuxStatuses from '@/components/ui/AuxStatuses';

interface StatusProps {
    booking: Booking;
}

const BookingStatus = ({
    booking
}:StatusProps) => {
    const { isPassed, isDue } = useBookingStatus(booking!);
    if(isPassed) {
        return <AuxStatuses size="small" type={AuxStatus.PASSED} />
    }
    if(isDue) {
        return <AuxStatuses size="small" type={AuxStatus.DUE} />
    }
    return (
        <Status booking={booking} />
    )
};

export default BookingStatus;