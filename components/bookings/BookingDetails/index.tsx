import Thumbnails from '@/components/ui/Thumbnails'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { Booking } from '@/redux/bookings/types'
import { Media } from '@/redux/app/types'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { format } from 'date-fns'
import React from 'react'
import { Image, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native'
import ContactCard from './ContactCard'
import Status from './Status'

interface BookingDetailsProps {
    booking: Booking;
}

const BookingDetails = ({
    booking
}:BookingDetailsProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const textColor = isDark ? colors.dark.text : colors.light.text;
    const labelColor = isDark ? colors.dark.secondary : colors.light.secondary;
    const accentColor = isDark ? colors.dark.white : colors.light.black;
    const cardBg = isDark ? colors.dark.background : colors.light.background;
    const borderColor = isDark ? colors.dark.white : colors.light.black;

    return (
        <ScrollView 
            contentContainerStyle={styles.mainContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Header Section */}
            <View style={styles.headerSection}>
                <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                <Text style={[styles.pageLabel, { color: labelColor }]}>
                    BOOKING DETAILS
                </Text>
                <Text style={[styles.headerTitle, { color: textColor }]}>
                    {booking.service.description}
                </Text>
                <View style={styles.clientRow}>
                    <Text style={[styles.withText, { color: labelColor }]}>with</Text>
                      <Image 
                          source={require('@/assets/images/individual.png')} 
                          style={styles.avatar}
                      />
                    <Text style={[styles.clientName, { color: textColor }]}>
                            {booking.client.name}
                    </Text>
                </View>
            </View>

            {/* Status & Fee Row */}
            <View style={styles.statusRow}>
                <Status status={booking.status} />
                <View>
                    <Text style={[styles.feeLabel, { color: labelColor }]}>ESTIMATED</Text>
                    <Text style={[styles.feeValue, { color: textColor }]}>
                        GHS {booking.service.summary.estimatedPrice || '0.00'}
                    </Text>
                  </View>
                </View>

            {/* Info Card */}
            <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor }]}>
                <View style={[styles.infoAccent, { backgroundColor: accentColor }]} />
                <View style={styles.infoContent}>
                    <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                            <Ionicons name="calendar" size={fontPixel(16)} color={labelColor} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: labelColor }]}>DATE & TIME</Text>
                            <Text style={[styles.infoValue, { color: textColor }]}>
                                {format(new Date(booking.service.appointmentDateTime.date.value), 'EEEE, MMM d')} • {booking.service.appointmentDateTime.time.value}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.infoDivider, { backgroundColor: labelColor }]} />

                    <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                            <Ionicons name="time-outline" size={fontPixel(16)} color={labelColor} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: labelColor }]}>DURATION</Text>
                            <Text style={[styles.infoValue, { color: textColor }]}>
                                {booking.service.summary.estimatedDuration}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.infoDivider, { backgroundColor: labelColor }]} />

                    <View style={styles.infoRow}>
                        <View style={styles.infoIconContainer}>
                            <MaterialCommunityIcons name="tools" size={fontPixel(16)} color={labelColor} />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoLabel, { color: labelColor }]}>REQUIRED TOOLS</Text>
                            <Text style={[styles.infoValue, { color: textColor }]}>
                                {booking.service.summary.requiredTools.join(', ') || 'None specified'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Description & Media */}
            {(booking.description || booking.service.media?.length > 0) && (
                <View style={styles.descriptionSection}>
                    <Text style={[styles.sectionLabel, { color: labelColor }]}>DESCRIPTION</Text>
                    <Text style={[styles.descriptionText, { color: textColor }]}>
                        {booking.description || booking.service.description}
                    </Text>
                    {booking.service.media?.length > 0 && (
                        <Thumbnails data={booking.service.media as Media[]} />
                    )}
                </View>
            )}

            <ContactCard booking={booking} />
        </ScrollView>
    )
}

export default BookingDetails

const styles = StyleSheet.create({
    mainContainer: {
        paddingHorizontal: widthPixel(20),
        gap: heightPixel(24),
        paddingBottom: heightPixel(100),
    },
    headerSection: {
        paddingTop: heightPixel(8),
    },
    accentBar: {
        width: widthPixel(40),
        height: heightPixel(4),
        marginBottom: heightPixel(16),
    },
    pageLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 2,
        marginBottom: heightPixel(8),
    },
    headerTitle: {
        fontSize: fontPixel(28),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
        marginBottom: heightPixel(12),
    },
    clientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
    },
    withText: {
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
    },
    avatar: {
        width: widthPixel(24),
        height: widthPixel(24),
        borderRadius: 0,
    },
    clientName: {
        fontSize: fontPixel(14),
        fontFamily: 'SemiBold',
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    feeLabel: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
        textAlign: 'right',
        marginBottom: heightPixel(2),
    },
    feeValue: {
        fontSize: fontPixel(18),
        fontFamily: 'Bold',
        textAlign: 'right',
    },
    infoCard: {
        borderWidth: 0.5,
        borderTopWidth: 0,
        overflow: 'hidden',
    },
    infoAccent: {
        height: heightPixel(3),
        width: '100%',
    },
    infoContent: {
        padding: widthPixel(16),
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: widthPixel(12),
    },
    infoIconContainer: {
        width: widthPixel(24),
        alignItems: 'center',
        paddingTop: heightPixel(2),
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
        marginBottom: heightPixel(2),
    },
    infoValue: {
        fontSize: fontPixel(14),
        fontFamily: 'Medium',
    },
    infoDivider: {
        height: 1,
        marginVertical: heightPixel(12),
        opacity: 0.15,
    },
    descriptionSection: {
        gap: heightPixel(8),
    },
    sectionLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 2,
    },
    descriptionText: {
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
        lineHeight: fontPixel(20),
    },
});
