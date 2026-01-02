import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { widthPixel, heightPixel, fontPixel } from '@/constants/normalize';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { selectUserLocation } from '@/redux/app/selector';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/store/hooks';

export default function UserLocation() {
    const router = useRouter();
    const location = useAppSelector(selectUserLocation);

    return (
        <View style={styles.header}>
            <View style={styles.locationContainer}>
                <Ionicons name="location" size={24} color="white" />
                <TouchableOpacity onPress={() => router.push('/(tabs)/(search)/location')}>
                    <ThemedText style={styles.locationLabel}>Your Location</ThemedText>
                    <View style={styles.locationRow}>
                        <ThemedText style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">{location?.address}</ThemedText>
                        <Ionicons name="chevron-down" size={20} color="white" />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.headerRight}>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="notifications-outline" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.profileButton}>
                    <Image 
                        source={require('@/assets/images/individual.png')}
                        style={styles.profileImage}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(12),
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
        flex: 0.55,
    },
    locationLabel: {
        fontSize: fontPixel(12),
        color: '#fff',
        opacity: 0.8,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(4),
    },
    locationText: {
        fontSize: fontPixel(16),
        fontWeight: '600',
        color: '#fff',
    },
    headerRight: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: widthPixel(4),
    },
    iconButton: {
        padding: widthPixel(4),
    },
    profileButton: {
        width: widthPixel(40),
        height: widthPixel(40),
        borderRadius: widthPixel(20),
        overflow: 'hidden',
    },
    profileImage: {
        width: widthPixel(40),
        height: widthPixel(40),
    },
});