import user from "@/assets/images/individual.png";
import IconButton from '@/components/ui/IconButton';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Booking } from '@/redux/bookings/types';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface ContactCardProps {
    booking: Booking;
}

const ContactCard = ({ booking }: ContactCardProps) => {
    const theme = useAppTheme();
    const isDark = theme === 'dark';

    const cardBg = isDark ? colors.dark.background : colors.light.background;
    const borderColor = isDark ? colors.dark.white : colors.light.black;
    const textColor = isDark ? colors.dark.text : colors.light.text;
    const labelColor = isDark ? colors.dark.secondary : colors.light.secondary;

    return (
        <View style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
            <View style={[styles.topAccent, { backgroundColor: borderColor }]} />
            <View style={styles.content}>
                <Text style={[styles.sectionLabel, { color: labelColor }]}>CLIENT</Text>
            <View style={styles.row}>
                <View style={styles.user}>
                    <Image
                            source={booking.client.avatar ? { uri: booking.client.avatar } : user}
                        style={styles.img}
                    />
                        <View style={styles.userInfo}>
                            <Text style={[styles.name, { color: textColor }]}>{booking.client.name}</Text>
                            {booking.client.location?.address && (
                                <Text style={[styles.address, { color: labelColor }]} numberOfLines={1}>
                                    {booking.client.location.address}
                                </Text>
                            )}
                        </View>
                    </View>
                    <Link href="/(tabs)/(messaging)/1" asChild>
                        <IconButton style={[styles.btn, { borderColor }]}>
                            <Ionicons
                                name="chatbubble-outline"
                                size={widthPixel(18)}
                                color={textColor}
                            />
                        </IconButton>
                    </Link>
                </View>
            </View>
        </View>
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
