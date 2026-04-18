import user from "@/assets/images/individual.png";
import IconButton from '@/components/ui/IconButton';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Booking } from '@/redux/booking/types';
import { actions as messagingActions } from '@/redux/messaging/slice';
import { selectFetchingConversation } from '@/redux/messaging/selector';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import OverlayLoader from '@/components/ui/OverlayLoader';
import { Ionicons } from '@expo/vector-icons';
import React, { Fragment } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useBookingStatus } from "@/hooks/useBookingStatus";

interface ContactCardProps {
    booking: Booking;
}

const ContactCard = ({ booking }: ContactCardProps) => {
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const dispatch = useAppDispatch();
    const isLoadingMessaging = useAppSelector(selectFetchingConversation);
    const { canChat } = useBookingStatus(booking);
    const cardBg = isDark ? colors.dark.background : colors.light.background;
    const borderColor = isDark ? colors.dark.white : colors.light.black;
    const textColor = isDark ? colors.dark.text : colors.light.text;
    const labelColor = isDark ? colors.dark.secondary : colors.light.secondary;

    const handleChatWorker = () => {
        if (!booking) return;
        dispatch(messagingActions.fetchOrCreateConversationByBooking(booking.id));
    };

    return (
        <Fragment>
        <View style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
            <View style={[styles.topAccent, { backgroundColor: borderColor }]} />
            <View style={styles.content}>
                <Text style={[styles.sectionLabel, { color: labelColor }]}>WORKER</Text>
            <View style={styles.row}>
                <View style={styles.user}>
                    <Image
                            source={booking?.worker?.avatar ? { uri: booking?.worker?.avatar } : user}
                        style={styles.img}
                    />
                        <View style={styles.userInfo}>
                            <Text style={[styles.name, { color: textColor }]}>{booking?.worker?.name}</Text>
                            {booking?.location?.address && (
                                <Text style={[styles.address, { color: labelColor }]} numberOfLines={1}>
                                    {booking?.location?.address}
                                </Text>
                            )}
                        </View>
                    </View>
                    {
                        canChat && (
                            <IconButton onPress={handleChatWorker} style={[styles.btn, { borderColor }]}>
                                <Ionicons
                                    name="chatbubble-outline"
                                    size={widthPixel(18)}
                                    color={textColor}
                                />
                            </IconButton>
                        )
                    }
                </View>
            </View>
        </View>
        {isLoadingMessaging && <OverlayLoader />}
        </Fragment>
    )
}

export default ContactCard

const styles = StyleSheet.create({
    container: {
        borderWidth: 0.5,
        borderTopWidth: 0,
        overflow: 'hidden',
    },
    topAccent: {
        height: heightPixel(3),
        width: '100%',
    },
    content: {
        padding: widthPixel(16),
    },
    sectionLabel: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
        marginBottom: heightPixel(12),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    user: {
        flexDirection: 'row',
        gap: widthPixel(12),
        alignItems: 'center',
        flex: 1,
    },
    userInfo: {
        flex: 1,
    },
    name: {
        fontSize: fontPixel(16),
        fontFamily: 'SemiBold',
        marginBottom: heightPixel(2),
    },
    address: {
        fontSize: fontPixel(12),
        fontFamily: 'Regular',
    },
    img: { 
        width: widthPixel(48), 
        height: widthPixel(48),
    },
    btn: {
        borderWidth: 1,
        padding: widthPixel(10),
    },
})
