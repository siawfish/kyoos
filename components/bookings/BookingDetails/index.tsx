import { convertFromMillisecondsToHours, formatDate, formatTime } from '@/constants/helpers'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useAppTheme } from '@/hooks/use-app-theme'
import { Booking } from '@/redux/booking/types'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import numeral from 'numeral'
import React from 'react'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import ContactCard from './ContactCard'
import Status from './Status'

interface BookingDetailsProps {
    booking: Booking;
}

const BookingDetails = ({
    booking
}:BookingDetailsProps) => {
    const theme = useAppTheme();
    const isDark = theme === 'dark';

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
                    {booking?.description}
                </Text>
                <View style={styles.clientRow}>
                    <Text style={[styles.withText, { color: labelColor }]}>with</Text>
                      <Image 
                        source={{ uri: booking?.worker?.avatar }} 
                        style={[styles.avatar, { backgroundColor: labelColor }]}
                      />
                    <Text style={[styles.clientName, { color: textColor }]}>
                        {booking?.worker?.name}
                    </Text>
                </View>
            </View>

            {/* Status & Fee Row */}
            <View style={styles.statusRow}>
                <Status status={booking?.status} />
                <View>
                    <Text style={[styles.feeLabel, { color: labelColor }]}>ESTIMATED</Text>
                    <Text style={[styles.feeValue, { color: textColor }]}>
                        GHS {numeral(booking?.estimatedPrice).format('0,0.00') || '0.00'}
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
                                {`${formatDate(new Date(booking?.date))} • ${formatTime(booking?.startTime)}`}
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
                                {convertFromMillisecondsToHours(booking?.estimatedDuration)} hours
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
                                {booking.requiredTools.join(', ') || 'None specified'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Description & Media */}
            {(booking.description || booking.media?.length > 0) && (
                <View style={styles.descriptionSection}>
                    <Text style={[styles.sectionLabel, { color: labelColor }]}>DESCRIPTION</Text>
                    <Text style={[styles.descriptionText, { color: textColor }]}>
                        {booking.description}
                    </Text>
                    {booking.media?.length > 0 && (
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            style={styles.mediaContainer}
                        >
                            {booking.media.map((item, index) => (
                                <View key={index} style={styles.mediaItem}>
                                    <Image
                                        source={{ uri: item.url }}
                                        style={styles.mediaImage}
                                        resizeMode="cover"
                                    />
                                </View>
                            ))}
                        </ScrollView>
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
        paddingHorizontal: widthPixel(16),
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
    mediaContainer: {
        flexDirection: 'row',
        marginVertical: heightPixel(8),
    },
    mediaItem: {
        width: widthPixel(80),
        height: widthPixel(80),
        marginRight: widthPixel(8),
        overflow: 'hidden',
    },
    mediaImage: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.light.lightTint,
    },
});
