import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { Marker } from 'react-native-maps';
import type MapView from 'react-native-maps';
import ThemedMapView from '@/components/ui/ThemedMapView';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { useAppSelector } from '@/store/hooks';
import { selectBookings } from '@/redux/bookings/selector';
import { BookingStatuses } from '@/redux/app/types';
import { DUMMY_NEARBY_ARTISANS, DUMMY_SKILLS, ACCRA_REGION } from '@/constants/dummyData';
import BookingPreviewCard from '@/components/home/BookingPreviewCard';
import SearchInputTrigger from '@/components/home/SearchInputTrigger';
import AISearchModal from '@/components/home/AISearchModal';
import WorkerMapMarker from '@/components/ui/WorkerMapMarker';
import ArtisanOptions from '@/components/ui/ArtisanOptions';
import ArtisanCard from '@/components/search/ArtisanCard';
import UserLocation from '@/components/search/UserLocation';

export default function HomeScreen() {
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [selectedArtisan, setSelectedArtisan] = useState<string | null>(null);
    const [showBookingCard, setShowBookingCard] = useState(false);
    const mapRef = useRef<MapView>(null);
    const bookings = useAppSelector(selectBookings);
    
    // Animation values
    const bookingCardHeight = useRef(new Animated.Value(0)).current;
    const bookingCardOpacity = useRef(new Animated.Value(0)).current;
    const toggleRotation = useRef(new Animated.Value(0)).current;

    const backgroundColor = useThemeColor({
        light: colors.light.background + 'F0',
        dark: colors.dark.background + 'F0',
    }, 'background');

    const blurTint = useThemeColor({
        light: 'light',
        dark: 'dark',
    }, 'background');

    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');

    const borderColor = useThemeColor({
        light: colors.light.grey,
        dark: colors.dark.grey,
    }, 'grey');

    const secondaryColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary,
    }, 'secondary');

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    // Get ongoing or upcoming booking
    const activeBooking = useMemo(() => {
        const ongoing = bookings.find(b => b.status === BookingStatuses.ONGOING);
        if (ongoing) return ongoing;
        
        const upcoming = bookings.find(b => 
            b.status === BookingStatuses.ACCEPTED || 
            b.status === BookingStatuses.PENDING
        );
        return upcoming || null;
    }, [bookings]);

    // Get selected artisan object
    const selectedArtisanObject = useMemo(() => {
        return DUMMY_NEARBY_ARTISANS.find(worker => worker.id === selectedArtisan);
    }, [selectedArtisan]);

    // Toggle booking card visibility with animation
    const toggleBookingCard = () => {
        const toValue = showBookingCard ? 0 : 1;
        setShowBookingCard(!showBookingCard);
        
        Animated.parallel([
            Animated.spring(bookingCardHeight, {
                toValue,
                useNativeDriver: false,
                tension: 80,
                friction: 12,
            }),
            Animated.timing(bookingCardOpacity, {
                toValue,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.spring(toggleRotation, {
                toValue,
                useNativeDriver: true,
                tension: 80,
                friction: 12,
            }),
        ]).start();
    };

    // Fit all markers on map
    const fitAllMarkers = useCallback(() => {
        if (mapRef.current && DUMMY_NEARBY_ARTISANS.length > 0) {
            const coordinates = DUMMY_NEARBY_ARTISANS.map(worker => ({
                latitude: worker.coordinates[1],
                longitude: worker.coordinates[0],
            }));

            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
                animated: true,
            });
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fitAllMarkers();
        }, 500);
        return () => clearTimeout(timer);
    }, [fitAllMarkers]);

    // Refit markers when ArtisanOptions closes
    useEffect(() => {
        if (!selectedArtisan) {
            // Small delay to ensure bottom sheet animation completes
            const timer = setTimeout(() => {
                fitAllMarkers();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [selectedArtisan, fitAllMarkers]);

    const handleMarkerPress = (artisanId: string) => {
        setSelectedArtisan(artisanId);
        
        // Find the artisan and animate to their location
        const artisan = DUMMY_NEARBY_ARTISANS.find(a => a.id === artisanId);
        if (artisan && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: artisan.coordinates[1],
                longitude: artisan.coordinates[0],
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500);
        }
    };

    return (
        <ThemedSafeAreaView style={styles.container}>
            {/* Map Background */}
            <ThemedMapView
                ref={mapRef}
                style={styles.map}
                initialRegion={ACCRA_REGION}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass={false}
                toolbarEnabled={false}
                onMapReady={fitAllMarkers}
            >
                {DUMMY_NEARBY_ARTISANS.map((artisan) => (
                    <Marker
                        key={artisan.id}
                        coordinate={{
                            latitude: artisan.coordinates[1],
                            longitude: artisan.coordinates[0],
                        }}
                        onPress={() => handleMarkerPress(artisan.id)}
                    >
                        <WorkerMapMarker
                            worker={artisan}
                            skills={DUMMY_SKILLS}
                            pinColor={tintColor}
                            estimatedDuration={60}
                            onPress={handleMarkerPress}
                        />
                    </Marker>
                ))}
            </ThemedMapView>

            {/* Floating Header with Location and Booking */}
            <View style={styles.floatingHeader}>
                <BlurView intensity={40} tint={blurTint as 'light' | 'dark'} style={[styles.headerContainer, { backgroundColor, borderColor }]}>
                    <View style={styles.headerContent}>
                        <UserLocation />
                        
                        <View style={styles.headerRight}>
                            {/* Booking Toggle Button */}
                            <TouchableOpacity 
                                style={styles.bookingToggle}
                                onPress={toggleBookingCard}
                                activeOpacity={0.7}
                            >
                                <BlurView intensity={40} tint={blurTint as 'light' | 'dark'} style={[styles.toggleContent, { backgroundColor }]}>
                                    <ThemedText style={[styles.toggleText, { color: secondaryColor }]}>
                                        {activeBooking ? 'BOOKING' : 'NO BOOKINGS'}
                                    </ThemedText>
                                    <Animated.View style={{
                                        transform: [{
                                            rotate: toggleRotation.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0deg', '180deg'],
                                            }),
                                        }],
                                    }}>
                                        <Feather name="chevron-down" size={16} color={tintColor} />
                                    </Animated.View>
                                </BlurView>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.resetButton}
                                onPress={fitAllMarkers}
                            >
                                <Feather name="maximize-2" size={18} color={tintColor} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
                
                {/* Animated Booking Card */}
                <Animated.View style={[
                    styles.bookingCardContainer,
                    {
                        height: bookingCardHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, heightPixel(180)],
                        }),
                        opacity: bookingCardOpacity,
                        marginTop: bookingCardHeight.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, heightPixel(2)],
                        }),
                    },
                ]}>
                    <BookingPreviewCard booking={activeBooking} />
                </Animated.View>
            </View>

            {/* Floating Search Bar */}
            <Animated.View style={[
                styles.searchBarContainer,
                {
                  top: bookingCardHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [heightPixel(120), heightPixel(50) + heightPixel(2) + heightPixel(180) + heightPixel(1)],
                  }),
                },
            ]}>
                <SearchInputTrigger onPress={() => setSearchModalVisible(true)} />
            </Animated.View>

            {/* Floating Stats/Info */}
            <View style={styles.statsContainer}>
                <BlurView intensity={40} tint={blurTint as 'light' | 'dark'} style={[styles.statCard, { backgroundColor }]}>
                    <ThemedText style={[styles.statValue, { color: textColor }]}>
                        {DUMMY_NEARBY_ARTISANS.length}
                    </ThemedText>
                    <ThemedText style={[styles.statLabel, { color: secondaryColor }]}>
                        NEARBY
                    </ThemedText>
                </BlurView>
            </View>

            {/* AI Search Modal */}
            <AISearchModal 
              visible={searchModalVisible}
              onClose={() => setSearchModalVisible(false)}
            />

            {/* Artisan Options Bottom Sheet */}
            <ArtisanOptions
                isVisible={!!selectedArtisan}
                onClose={() => setSelectedArtisan(null)}
                artisan={selectedArtisanObject}
            >
                {selectedArtisanObject && (
                    <ArtisanCard
                        artisan={selectedArtisanObject}
                        requiredSkills={DUMMY_SKILLS}
                        estimatedDuration={60}
                    />
                )}
            </ArtisanOptions>
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    floatingHeader: {
      position: 'absolute',
      top: heightPixel(50),
      left: widthPixel(16),
      right: widthPixel(16),
    },
    headerContainer: {
        overflow: 'hidden',
        borderWidth: 0.5,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: widthPixel(16),
      paddingVertical: heightPixel(12),
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: widthPixel(8),
    },
    resetButton: {
      padding: widthPixel(8),
    },
    bookingToggle: {
      // No additional styles needed, handled by toggleContent
    },
    toggleContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: widthPixel(6),
      paddingHorizontal: widthPixel(12),
      paddingVertical: heightPixel(8),
      overflow: 'hidden',
    },
    toggleText: {
      fontSize: fontPixel(10),
      fontFamily: 'SemiBold',
      letterSpacing: 1,
    },
    bookingCardContainer: {
      overflow: 'hidden',
    },
    searchBarContainer: {
      position: 'absolute',
      left: widthPixel(16),
      right: widthPixel(16),
    },
    statsContainer: {
      position: 'absolute',
      bottom: heightPixel(180),
      right: widthPixel(16),
    },
    statCard: {
      paddingHorizontal: widthPixel(16),
      paddingVertical: heightPixel(12),
      alignItems: 'center',
      overflow: 'hidden',
    },
    statValue: {
      fontSize: fontPixel(24),
      fontFamily: 'Bold',
    },
    statLabel: {
      fontSize: fontPixel(9),
      fontFamily: 'SemiBold',
      letterSpacing: 1,
    },
});
