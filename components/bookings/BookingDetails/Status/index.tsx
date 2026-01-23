import BookingStatusBadge from '@/components/ui/BookingStatusBadge';
import { BookingStatuses } from '@/redux/app/types';
import React from 'react';

interface StatusProps {
    status?: BookingStatuses;
}

const Status = ({
    status = BookingStatuses.PENDING
}: StatusProps) => {
    return <BookingStatusBadge status={status} size="large" />;
};

export default Status;
