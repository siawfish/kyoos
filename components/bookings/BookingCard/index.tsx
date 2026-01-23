import { Options as OptionsComponent } from '@/components/portfolio/Options'
import BookingStatusBadge, { getStatusColor } from '@/components/ui/BookingStatusBadge'
import { ConfirmActionSheet } from '@/components/ui/ConfirmActionSheet'
import { convertFromMillisecondsToHours, formatDate, formatTime } from '@/constants/helpers'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useAppTheme } from '@/hooks/use-app-theme'
import { BookingStatuses, OptionIcons, Options } from '@/redux/app/types'
import { Booking } from '@/redux/booking/types'
import { actions } from '@/redux/bookings/slice'
import { actions as messagingActions } from '@/redux/messaging/slice'
import { selectFetchingConversation } from '@/redux/messaging/selector'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { AgendaEntry } from 'react-native-calendars'
import OverlayLoader from '@/components/ui/OverlayLoader'
import { isPast } from 'date-fns'
import IsPassedBookingBadge from '@/components/ui/IsPassedBookingBadge'

interface BookingAgendaEntry extends AgendaEntry {
    booking?: Booking;
}

interface BookingCardProps {
    readonly reservation: BookingAgendaEntry;
    readonly isFirst?: boolean;
}

const BookingCard = ({
    reservation, 
}: BookingCardProps) => {
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const booking = reservation.booking;
    const dispatch = useAppDispatch();
    const isLoadingMessaging = useAppSelector(selectFetchingConversation);

    const [showReschedule, setShowReschedule] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
    const [showRebookConfirm, setShowRebookConfirm] = useState(false);
    const [showReportConfirm, setShowReportConfirm] = useState(false);
    
    if (!booking) return null;

    const cardBg = isDark ? 'transparent' : colors.light.background;
    const borderColor = isDark ? colors.dark.secondary : colors.light.black;
    const textColor = isDark ? colors.dark.text : colors.light.text;
    const labelColor = isDark ? colors.dark.secondary : colors.light.secondary;
    const statusColor = getStatusColor(booking.status, isDark);
    const isPassed = isPast(new Date(booking.date));
    const handleChatWorker = () => {
        dispatch(messagingActions.fetchOrCreateConversationByBooking(booking.id));
    };

    const confirmReschedule = () => {
        setShowReschedule(false);
        dispatch(actions.rescheduleBooking(booking.id));
        router.push({
            pathname: '/(tabs)/(bookings)/booking',
            params: {
                callbackRoute: `/(tabs)/(bookings)/bookings`,
            },
        });
    };

    const handleReschedule = () => {
        setShowReschedule(true);
    };

    const handleCancel = () => {
        setShowCancelConfirm(true);
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmCancel = () => {
        setShowCancelConfirm(false);
        dispatch(actions.cancelBooking(booking.id));
    };

    const handleConfirmDelete = () => {
        setShowDeleteConfirm(false);
        dispatch(actions.deleteBooking(booking.id));
    };

    const handleComplete = () => {
        setShowCompleteConfirm(true);
    };

    const handleConfirmComplete = () => {
        setShowCompleteConfirm(false);
        dispatch(actions.completeBooking(booking.id));
    };

    const handleRebook = () => {
        setShowRebookConfirm(true);
    };

    const handleConfirmRebook = () => {
        setShowRebookConfirm(false);
        dispatch(actions.rebookBooking(booking.id));
        router.push({
            pathname: '/(tabs)/(bookings)/booking',
            params: {
                callbackRoute: `/(tabs)/(bookings)/bookings`,
            },
        });
    };

    const handleReport = () => {
        setShowReportConfirm(true);
    };

    const handleConfirmReport = () => {
        setShowReportConfirm(false);
        dispatch(actions.reportBooking(booking.id));
    };


    const getBookingOptions = (): Options[] => {
        const isPending = booking.status === BookingStatuses.PENDING;
        const isCancelled = booking.status === BookingStatuses.CANCELLED;
        const isOngoing = booking.status === BookingStatuses.ONGOING;
        const isCompleted = booking.status === BookingStatuses.COMPLETED;
        if (isPending) {
            if(isPassed) {
                return [
                    { label: 'Reschedule', icon: OptionIcons.CALENDAR, onPress: handleReschedule },
                    { label: 'Cancel Booking', icon: OptionIcons.CLOSE, onPress: handleCancel, isDanger: true },
                ];
            }
            return [
                { label: 'Chat Worker', icon: OptionIcons.CHAT, onPress: handleChatWorker },
                { label: 'Reschedule', icon: OptionIcons.CALENDAR, onPress: handleReschedule },
                { label: 'Cancel Booking', icon: OptionIcons.CLOSE, onPress: handleCancel, isDanger: true },
            ];
        }

        if (isCancelled) {
            return [
                // { label: 'Delete', icon: OptionIcons.DELETE, onPress: handleDelete, isDanger: true },
            ];
        }

        if (isOngoing) {
            return [
                { label: 'Chat Worker', icon: OptionIcons.CHAT, onPress: handleChatWorker },
                { label: 'Complete Booking', icon: OptionIcons.COMPLETE, onPress: handleComplete, isSuccess: true },
                { label: 'Cancel Booking', icon: OptionIcons.CLOSE, onPress: handleCancel, isDanger: true },
            ];
        }

        if (isCompleted) {
            return [
                { label: 'Book Again', icon: OptionIcons.CALENDAR, onPress: handleRebook},
                { label: 'Report Booking', icon: OptionIcons.REPORT, onPress: handleReport, isDanger: true },
            ];
        }
        
        return [
            { label: 'Chat Worker', icon: OptionIcons.CHAT, onPress: handleChatWorker },
            { label: 'Reschedule', icon: OptionIcons.CALENDAR, onPress: handleReschedule },
            { label: 'Cancel Booking', icon: OptionIcons.CLOSE, onPress: handleCancel, isDanger: true },
        ];
    };

    const renderSnapPoints = () => {
        const options = getBookingOptions();
        return options.length > 2 ? ['42%'] : options.length > 1 ? ['35%'] : ['30%'];
    }

    return (
        <>
        <TouchableOpacity
            onPress={() => router.push(`/(tabs)/(bookings)/${booking.id}`)}
            style={[styles.card, { backgroundColor: cardBg, borderColor }]}
            activeOpacity={0.7}
        >
            <View style={[styles.leftAccent, { backgroundColor: statusColor }]} />
            <View style={styles.content}>
                <View style={styles.topRow}>
                    {isPassed ? <IsPassedBookingBadge size="small" /> : <BookingStatusBadge status={booking.status} size="small" />}
                    <View style={styles.topRowRight}>
                        <Text style={[styles.time, { color: textColor }]}>
                            {`${formatDate(new Date(booking.date))} • ${formatTime(booking.startTime)}`}
                        </Text>
                        {
                            getBookingOptions().length > 0 && (
                                <TouchableOpacity
                                    onPress={(e) => {
                                        e.stopPropagation();
                                    }}
                                    activeOpacity={1}
                                >
                                    <OptionsComponent 
                                        options={getBookingOptions()} 
                                        title="Booking Actions"
                                        snapPoints={renderSnapPoints()}
                                    />
                                </TouchableOpacity>
                            )
                        }
                    </View>
                </View>
                
                <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                    {booking.description}
                </Text>
                
                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <Text style={[styles.detailLabel, { color: labelColor }]}>
                            WORKER
                        </Text>
                        <Text style={[styles.detailValue, { color: textColor }]} numberOfLines={1}>
                            {booking.worker.name}
                        </Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: labelColor }]} />
                    <View style={styles.detailItem}>
                        <Text style={[styles.detailLabel, { color: labelColor }]}>
                            DURATION
                        </Text>
                        <Text style={[styles.detailValue, { color: textColor }]}>
                            {convertFromMillisecondsToHours(booking.estimatedDuration)} hours
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
        {isLoadingMessaging && (
            <OverlayLoader />
        )}
        {showReschedule && (
            <ConfirmActionSheet 
                isOpen={showReschedule} 
                isOpenChange={setShowReschedule} 
                onConfirm={confirmReschedule} 
                title="Reschedule Booking?" 
                icon={<Image source={require('@/assets/images/event.png')} style={styles.dangerIcon} />}
                description={`Are you sure you want to reschedule this booking with ${booking.worker.name}?`}
                confirmText="Yes, Reschedule Booking"
                cancelText="Cancel"
            />
        )}
        {showCancelConfirm && (
            <ConfirmActionSheet 
                isOpen={showCancelConfirm} 
                isOpenChange={setShowCancelConfirm} 
                onConfirm={handleConfirmCancel} 
                title="Cancel Booking?" 
                icon={<Image source={require('@/assets/images/danger.png')} style={styles.dangerIcon} />}
                description={`Are you sure you want to cancel this booking? This action cannot be reversed. ${booking.worker.name} will also be notified.`}
                confirmText="Yes, Cancel Booking"
                cancelText="Cancel"
            />
        )}
        {showDeleteConfirm && (
            <ConfirmActionSheet 
                isOpen={showDeleteConfirm} 
                isOpenChange={setShowDeleteConfirm} 
                onConfirm={handleConfirmDelete} 
                title="Delete Booking?" 
                icon={<Image source={require('@/assets/images/danger.png')} style={styles.dangerIcon} />}
                description="Are you sure you want to delete this booking? This action cannot be reversed."
                confirmText="Yes, Delete"
                cancelText="Cancel"
            />
        )}
        {showCompleteConfirm && (
            <ConfirmActionSheet 
                isOpen={showCompleteConfirm} 
                isOpenChange={setShowCompleteConfirm} 
                onConfirm={handleConfirmComplete} 
                title="Complete Booking?" 
                icon={<Image source={require('@/assets/images/success.png')} style={styles.dangerIcon} />}
                description="Can you confirm that the booking has been completed?"
                confirmText="Yes, Complete Booking"
                cancelText="Cancel"
            />
        )}
        {showRebookConfirm && (
            <ConfirmActionSheet 
                isOpen={showRebookConfirm} 
                isOpenChange={setShowRebookConfirm} 
                onConfirm={handleConfirmRebook} 
                title="Rebook Booking?" 
                icon={<Image source={require('@/assets/images/event.png')} style={styles.dangerIcon} />}
                description={`Are you sure you want to book another session with ${booking.worker.name}?`}
                confirmText="Yes, Rebook Booking"
                cancelText="Cancel"
            />
        )}
        {showReportConfirm && (
            <ConfirmActionSheet 
                isOpen={showReportConfirm} 
                isOpenChange={setShowReportConfirm} 
                onConfirm={handleConfirmReport} 
                title="Report Booking?" 
                icon={<Image source={require('@/assets/images/danger.png')} style={styles.dangerIcon} />}
                description={`Are you sure you want to report this booking with ${booking.worker.name}?`}
                confirmText="Yes, Report Booking"
                cancelText="Cancel"
            />
        )}
        </>
    )
}

export default BookingCard

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        borderWidth: 0.5,
        borderLeftWidth: 0,
        overflow: 'hidden',
    },
    leftAccent: {
        width: widthPixel(4),
    },
    content: {
        flex: 1,
        padding: widthPixel(16),
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: heightPixel(12),
    },
    time: {
        fontSize: fontPixel(13),
        fontFamily: 'SemiBold',
    },
    title: {
        fontSize: fontPixel(18),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
        marginBottom: heightPixel(16),
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailItem: {
        flex: 1,
    },
    detailLabel: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
        marginBottom: heightPixel(2),
    },
    detailValue: {
        fontSize: fontPixel(13),
        fontFamily: 'Medium',
    },
    divider: {
        width: 1,
        height: heightPixel(28),
        marginHorizontal: widthPixel(12),
        opacity: 0.3,
    },
    topRowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
    },
    dangerIcon: {
        width: widthPixel(60),
        height: widthPixel(60),
    }
})
