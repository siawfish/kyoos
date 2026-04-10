import BookingPreviewCard from '@/components/home/BookingPreviewCard';
import NearbyWorkersStrip from '@/components/home/NearbyWorkersStrip';
import SearchInputTrigger from '@/components/home/SearchInputTrigger';
import PortfolioSkeleton from '@/components/portfolio/Loaders/PortfolioSkeleton';
import PortfolioItem from '@/components/portfolio/Portfolio';
import ArtisanCard from '@/components/search/ArtisanCard';
import UserLocation from '@/components/search/UserLocation';
import ArtisanOptions from '@/components/ui/ArtisanOptions';
import EmptyList from '@/components/ui/EmptyList';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import ThemedMapView from '@/components/ui/ThemedMapView';
import WorkerMapMarker from '@/components/ui/WorkerMapMarker';
import { ACCRA_REGION } from '@/constants/helpers';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  selectHomePopularPagination,
  selectHomePopularPortfolios,
  selectIsAppendingHomePopular,
  selectIsLoadingHomePopular,
} from '@/redux/portfolio/selector';
import { actions as portfolioActions } from '@/redux/portfolio/slice';
import type { Portfolio } from '@/redux/portfolio/types';
import { selectUserLocation } from '@/redux/app/selector';
import { selectHomeActiveBooking } from '@/redux/bookings/selector';
import { actions as bookingsActions } from '@/redux/bookings/slice';
import { selectIsInitializing, selectNearestWorkers, selectSelectedArtisan, selectTotalNearbyWorkers } from '@/redux/search/selector';
import { actions } from '@/redux/search/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from "@react-navigation/native";
import { BlurTint, BlurView } from 'expo-blur';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';

const FEED_PANEL_TOP = heightPixel(120) + heightPixel(72) + heightPixel(6);

/** Feed scroll: hide header location when scrolling down; show on scroll up or when scroll ends */
const FEED_SCROLL_TOP_THRESHOLD = 12;
const FEED_SCROLL_DELTA_THRESHOLD = 8;
const LOCATION_BAR_HIDE_DEBOUNCE_MS = 100;
const LOCATION_BAR_SHOW_DURATION_MS = 220;
const LOCATION_BAR_HIDE_DURATION_MS = 240;
/** Layout height of the header BlurView row (location + toggles); also used to collapse gap + shift search/feed */
const HEADER_BLUR_ROW_LAYOUT_HEIGHT = heightPixel(56);

export default function HomeScreen() {
    const selectedArtisan = useAppSelector(selectSelectedArtisan);
    const [showBookingCard, setShowBookingCard] = useState(false);
    const [isMapFullView, setIsMapFullView] = useState(false);
    const mapRef = useRef<MapView>(null);
    const homeActiveBooking = useAppSelector(selectHomeActiveBooking);
    const nearestWorkers = useAppSelector(selectNearestWorkers);
    const location = useAppSelector(selectUserLocation);
    const dispatch = useAppDispatch();
    const isInitializing = useAppSelector(selectIsInitializing);
    const totalNearbyWorkers = useAppSelector(selectTotalNearbyWorkers);
    const homePopularPortfolios = useAppSelector(selectHomePopularPortfolios);
    const homePopularPagination = useAppSelector(selectHomePopularPagination);
    const isLoadingHomePopular = useAppSelector(selectIsLoadingHomePopular);
    const isAppendingHomePopular = useAppSelector(selectIsAppendingHomePopular);
    const insets = useSafeAreaInsets();
    /** Native RefreshControl spinner only while user pulled to refresh — not during initial skeleton load */
    const [isPullRefreshing, setIsPullRefreshing] = useState(false);
    // Animation values
    const bookingCardHeight = useRef(new Animated.Value(0)).current;
    const bookingCardOpacity = useRef(new Animated.Value(0)).current;
    const toggleRotation = useRef(new Animated.Value(0)).current;
    /** 0 = location visible, 1 = hidden */
    const locationBarAnim = useRef(new Animated.Value(0)).current;
    const prevScrollYRef = useRef(0);
    const isLocationHiddenRef = useRef(false);
    const hideLocationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [locationBarHiddenForPointer, setLocationBarHiddenForPointer] = useState(false);

    const clearHideLocationDebounce = useCallback(() => {
        if (hideLocationDebounceRef.current) {
            clearTimeout(hideLocationDebounceRef.current);
            hideLocationDebounceRef.current = null;
        }
    }, []);

    const revealLocationBar = useCallback(() => {
        clearHideLocationDebounce();
        if (!isLocationHiddenRef.current) {
            return;
        }
        isLocationHiddenRef.current = false;
        setLocationBarHiddenForPointer(false);
        locationBarAnim.stopAnimation();
        Animated.timing(locationBarAnim, {
            toValue: 0,
            duration: LOCATION_BAR_SHOW_DURATION_MS,
            useNativeDriver: false,
        }).start();
    }, [clearHideLocationDebounce, locationBarAnim]);

    const commitHideLocationBar = useCallback(() => {
        if (isLocationHiddenRef.current) {
            return;
        }
        isLocationHiddenRef.current = true;
        setLocationBarHiddenForPointer(true);
        locationBarAnim.stopAnimation();
        Animated.timing(locationBarAnim, {
            toValue: 1,
            duration: LOCATION_BAR_HIDE_DURATION_MS,
            useNativeDriver: false,
        }).start();
    }, [locationBarAnim]);

    /** Schedule hide once (leading debounce): repeated scroll-down deltas do not reset the timer, avoiding flicker and “hide only after scroll stops”. */
    const queueHideLocationBar = useCallback(() => {
        if (hideLocationDebounceRef.current !== null) {
            return;
        }
        hideLocationDebounceRef.current = setTimeout(() => {
            hideLocationDebounceRef.current = null;
            commitHideLocationBar();
        }, LOCATION_BAR_HIDE_DEBOUNCE_MS);
    }, [commitHideLocationBar]);

    const onFeedScroll = useCallback(
        (e: NativeSyntheticEvent<NativeScrollEvent>) => {
            if (isMapFullView) {
                return;
            }
            const y = e.nativeEvent.contentOffset.y;

            if (y < FEED_SCROLL_TOP_THRESHOLD) {
                clearHideLocationDebounce();
                prevScrollYRef.current = y;
                revealLocationBar();
                return;
            }

            const prev = prevScrollYRef.current;
            const delta = y - prev;
            prevScrollYRef.current = y;

            if (delta > FEED_SCROLL_DELTA_THRESHOLD) {
                queueHideLocationBar();
            } else if (delta < -FEED_SCROLL_DELTA_THRESHOLD) {
                revealLocationBar();
            }
        },
        [isMapFullView, queueHideLocationBar, revealLocationBar, clearHideLocationDebounce],
    );

    useEffect(() => {
        if (isMapFullView) {
            clearHideLocationDebounce();
            prevScrollYRef.current = 0;
            if (isLocationHiddenRef.current) {
                isLocationHiddenRef.current = false;
                setLocationBarHiddenForPointer(false);
            }
            locationBarAnim.stopAnimation();
            locationBarAnim.setValue(0);
        }
    }, [isMapFullView, clearHideLocationDebounce, locationBarAnim]);

    useEffect(() => () => {
        clearHideLocationDebounce();
    }, [clearHideLocationDebounce]);

    useFocusEffect(useCallback(() => {
        dispatch(actions.onInitialize({
            lat: location?.lat || ACCRA_REGION.latitude,
            lng: location?.lng || ACCRA_REGION.longitude,
        }));
        dispatch(portfolioActions.fetchHomePopular({ page: 1 }));
        dispatch(bookingsActions.fetchHomeActiveBooking());
    }, [dispatch, location?.lat, location?.lng]));

    const onRefreshFeed = useCallback(() => {
        setIsPullRefreshing(true);
        dispatch(actions.onInitialize({
            lat: location?.lat || ACCRA_REGION.latitude,
            lng: location?.lng || ACCRA_REGION.longitude,
        }));
        dispatch(portfolioActions.fetchHomePopular({ page: 1 }));
        dispatch(bookingsActions.fetchHomeActiveBooking());
    }, [dispatch, location?.lat, location?.lng]);

    useEffect(() => {
        if (!isInitializing && !isLoadingHomePopular) {
            setIsPullRefreshing(false);
        }
    }, [isInitializing, isLoadingHomePopular]);

    useEffect(() => {
        if (!homeActiveBooking) {
            setShowBookingCard(false);
            bookingCardHeight.setValue(0);
            bookingCardOpacity.setValue(0);
            toggleRotation.setValue(0);
        }
    }, [homeActiveBooking, bookingCardHeight, bookingCardOpacity, toggleRotation]);

    const onEndReachedPopular = useCallback(() => {
        if (
            !homePopularPagination.hasNext ||
            isAppendingHomePopular ||
            isLoadingHomePopular
        ) {
            return;
        }
        dispatch(
            portfolioActions.fetchHomePopular({ page: homePopularPagination.page + 1 }),
        );
    }, [
        dispatch,
        homePopularPagination.hasNext,
        homePopularPagination.page,
        isAppendingHomePopular,
        isLoadingHomePopular,
    ]);

    const toggleMapView = useCallback(() => {
        setIsMapFullView((v) => !v);
    }, []);

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

    // Get selected artisan object
    const selectedArtisanObject = useMemo(() => {
        return nearestWorkers.find(worker => worker.id === selectedArtisan);
    }, [selectedArtisan, nearestWorkers]);

    type HomeFeedRow =
        | Portfolio
        | { id: string; isSkeleton: true };

    const popularFeedData: HomeFeedRow[] = useMemo(() => {
        if (
            isLoadingHomePopular &&
            homePopularPagination.page <= 1 &&
            homePopularPortfolios.length === 0
        ) {
            return [0, 1, 2].map((i) => ({
                id: `home-popular-skeleton-${i}`,
                isSkeleton: true as const,
            }));
        }
        return homePopularPortfolios;
    }, [
        isLoadingHomePopular,
        homePopularPagination.page,
        homePopularPortfolios,
    ]);

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
        if (mapRef.current && nearestWorkers.length > 0) {
            const coordinates = nearestWorkers.map(worker => ({
                latitude: worker.coordinates[1],
                longitude: worker.coordinates[0],
            }));

            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 200, right: 50, bottom: 200, left: 50 },
                animated: true,
            });
        }
    }, [nearestWorkers]);

    useEffect(() => {
        if (!isMapFullView) return;
        const timer = setTimeout(() => {
            fitAllMarkers();
        }, 400);
        return () => clearTimeout(timer);
    }, [isMapFullView, fitAllMarkers]);

    // Fit markers when workers are loaded after initialization (full map only)
    useEffect(() => {
        if (!isMapFullView) return;
        if (!isInitializing && nearestWorkers.length > 0 && mapRef.current) {
            const timer = setTimeout(() => {
                fitAllMarkers();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isMapFullView, isInitializing, nearestWorkers, fitAllMarkers]);

    // Refit markers when ArtisanOptions closes
    useEffect(() => {
        if (!isMapFullView) return;
        if (!selectedArtisan) {
            const timer = setTimeout(() => {
                fitAllMarkers();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [selectedArtisan, fitAllMarkers, isMapFullView]);

    const handleMarkerPress = (artisanId: string) => {
        dispatch(actions.setSelectedArtisan(artisanId));
        
        // Find the artisan and animate to their location
        const artisan = nearestWorkers.find(a => a.id === artisanId);
        if (artisan && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: artisan.coordinates[1],
                longitude: artisan.coordinates[0],
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 500);
        }
    };

    // const handleRegionChange = (region: Region) => {
    //     dispatch(actions.onInitialize({
    //         lat: region.latitude,
    //         lng: region.longitude,
    //     }));
    // };

    return (
        <ThemedSafeAreaView style={styles.container}>
            {/* Map Background */}
            <ThemedMapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: location?.lat || ACCRA_REGION.latitude,
                    longitude: location?.lng || ACCRA_REGION.longitude,
                    latitudeDelta: ACCRA_REGION.latitudeDelta,
                    longitudeDelta: ACCRA_REGION.longitudeDelta,
                }}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass={false}
                toolbarEnabled={false}
                onMapReady={() => {
                    if (isMapFullView) {
                        fitAllMarkers();
                    }
                }}
            >
                {nearestWorkers.map((artisan) => (
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
                            pinColor={tintColor}
                            estimatedDuration={60}
                            onPress={handleMarkerPress}
                            displayCost={false}
                        />
                    </Marker>
                ))}
            </ThemedMapView>

            {/* Dim map in feed mode — same idea as results screen when cards are shown */}
            {!isMapFullView ? (
                <BlurView
                    intensity={40}
                    tint={blurTint as BlurTint}
                    style={[StyleSheet.absoluteFillObject, styles.mapFeedOverlay]}
                />
            ) : null}

            {/* Floating Header with Location and Booking */}
            <View style={styles.floatingHeader}>
                <Animated.View
                    style={{
                        opacity: locationBarAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0],
                        }),
                        maxHeight: locationBarAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [HEADER_BLUR_ROW_LAYOUT_HEIGHT, 0],
                        }),
                        overflow: 'hidden',
                    }}
                    pointerEvents={locationBarHiddenForPointer ? 'none' : 'auto'}
                >
                    <BlurView intensity={40} tint={blurTint as 'light' | 'dark'} style={[styles.headerContainer, { backgroundColor, borderColor }]}>
                        <View style={styles.headerContent}>
                            <View style={styles.locationRow}>
                                <View style={styles.locationTrigger}>
                                    <UserLocation />
                                </View>
                            </View>

                            <View style={styles.headerRight}>
                                {homeActiveBooking ? (
                                    <TouchableOpacity 
                                        style={styles.bookingToggle}
                                        onPress={toggleBookingCard}
                                        activeOpacity={0.7}
                                    >
                                        <BlurView intensity={40} tint={blurTint as 'light' | 'dark'} style={[styles.toggleContent, { backgroundColor }]}>
                                            <ThemedText style={[styles.toggleText, { color: secondaryColor }]}>
                                                BOOKING
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
                                ) : null}
                            </View>
                            <TouchableOpacity
                                style={styles.feedMapToggle}
                                onPress={toggleMapView}
                                activeOpacity={0.7}
                                accessibilityRole="button"
                                accessibilityLabel={isMapFullView ? 'Show home feed' : 'Show full map'}
                            >
                                <Feather
                                    name={isMapFullView ? 'grid' : 'map'}
                                    size={18}
                                    color={tintColor}
                                />
                            </TouchableOpacity>
                        </View>
                    </BlurView>
                </Animated.View>

                {homeActiveBooking ? (
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
                        <BookingPreviewCard booking={homeActiveBooking} />
                    </Animated.View>
                ) : null}
            </View>

            {/* Floating Search Bar */}
            <Animated.View style={[
                styles.searchBarContainer,
                {
                  top: Animated.add(
                      bookingCardHeight.interpolate({
                          inputRange: [0, 1],
                          outputRange: [
                              heightPixel(120),
                              heightPixel(50) + heightPixel(2) + heightPixel(180) + heightPixel(1),
                          ],
                      }),
                      locationBarAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -HEADER_BLUR_ROW_LAYOUT_HEIGHT],
                      }),
                  ),
                },
            ]}>
                <SearchInputTrigger onPress={() => router.push('/(tabs)/(search)/ai-search')} />
            </Animated.View>

            {/* Feed overlay: nearby strip + popular portfolios */}
            {!isMapFullView ? (
                <Animated.View
                    style={[
                        styles.feedSheet,
                        {
                            top: locationBarAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [
                                    FEED_PANEL_TOP,
                                    FEED_PANEL_TOP - HEADER_BLUR_ROW_LAYOUT_HEIGHT,
                                ],
                            }),
                        },
                    ]}
                    pointerEvents="box-none"
                >
                    <BlurView
                        intensity={50}
                        tint={blurTint as 'light' | 'dark'}
                        style={[styles.feedBlur, { backgroundColor, borderColor }]}
                    >
                        <FlatList
                            style={styles.feedList}
                            data={popularFeedData}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => {
                                if ('isSkeleton' in item && item.isSkeleton) {
                                    return (
                                        <View style={styles.portfolioRow}>
                                            <PortfolioSkeleton />
                                        </View>
                                    );
                                }
                                return (
                                    <View style={styles.portfolioRow}>
                                        <PortfolioItem portfolio={item as Portfolio} />
                                    </View>
                                );
                            }}
                            ListHeaderComponent={
                                <View style={styles.feedHeader}>
                                    <NearbyWorkersStrip
                                        workers={nearestWorkers}
                                        userLat={location?.lat ?? ACCRA_REGION.latitude}
                                        userLng={location?.lng ?? ACCRA_REGION.longitude}
                                        isLoadingNearby={isInitializing}
                                    />
                                    <ThemedText style={[styles.feedSectionTitle, { color: secondaryColor }]}>
                                        POPULAR
                                    </ThemedText>
                                </View>
                            }
                            ListEmptyComponent={
                                homePopularPortfolios.length === 0 &&
                                !isLoadingHomePopular ? (
                                    <EmptyList
                                        message="No portfolio posts yet"
                                        containerStyle={styles.feedEmptyList}
                                    />
                                ) : null
                            }
                            ListFooterComponent={
                                isAppendingHomePopular ? (
                                    <View style={styles.portfolioRow}>
                                        <PortfolioSkeleton />
                                    </View>
                                ) : null
                            }
                            contentContainerStyle={[
                                styles.feedListContent,
                                { paddingBottom: heightPixel(24) + insets.bottom },
                            ]}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isPullRefreshing}
                                    onRefresh={onRefreshFeed}
                                    tintColor={tintColor}
                                />
                            }
                            onEndReached={onEndReachedPopular}
                            onEndReachedThreshold={0.35}
                            showsVerticalScrollIndicator={false}
                            scrollEventThrottle={32}
                            onScroll={onFeedScroll}
                        />
                    </BlurView>
                </Animated.View>
            ) : null}

            {/* Floating Stats/Info */}
            {isMapFullView ? (
                <View style={styles.statsContainer}>
                    <BlurView intensity={40} tint={blurTint as 'light' | 'dark'} style={[styles.statCard, { backgroundColor, borderColor }]}>
                        <ThemedText style={[styles.statValue, { color: textColor }]}>
                            {totalNearbyWorkers}
                        </ThemedText>
                        <ThemedText style={[styles.statLabel, { color: secondaryColor }]}>
                            NEARBY
                        </ThemedText>
                    </BlurView>
                </View>
            ) : null}

            {/* Artisan Options Bottom Sheet */}
            <ArtisanOptions
                isVisible={!!selectedArtisan}
                onClose={() => dispatch(actions.setSelectedArtisan(null))}
                artisan={selectedArtisanObject}
            >
                {selectedArtisanObject && (
                    <ArtisanCard
                        artisan={selectedArtisanObject}
                        estimatedDuration={0}
                        onPress={(id) => {
                            router.push({
                                pathname: '/(tabs)/(search)/(artisan)/artisan',
                                params: {
                                    artisanId: id,
                                },
                            })
                            dispatch(actions.setSelectedArtisan(null));
                        }}
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
      zIndex: 0,
    },
    mapFeedOverlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1,
      elevation: 1,
    },
    floatingHeader: {
      position: 'absolute',
      top: heightPixel(50),
      left: widthPixel(16),
      right: widthPixel(16),
      zIndex: 2,
      elevation: 2,
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
      paddingVertical: heightPixel(16),
    },
    locationRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: widthPixel(10),
      minWidth: 0,
      marginRight: widthPixel(8),
    },
    locationTrigger: {
      flex: 1,
      minWidth: 0,
    },
    feedMapToggle: {
    //   padding: widthPixel(8),
      justifyContent: 'center',
      alignItems: 'center',
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
      zIndex: 2,
      elevation: 2,
    },
    statsContainer: {
      position: 'absolute',
      bottom: heightPixel(180),
      right: widthPixel(16),
      zIndex: 2,
      elevation: 2,
    },
    statCard: {
      paddingHorizontal: widthPixel(16),
      paddingVertical: heightPixel(12),
      alignItems: 'center',
      overflow: 'hidden',
      borderWidth: 0.5,
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
    feedSheet: {
      position: 'absolute',
      left: widthPixel(16),
      right: widthPixel(16),
      bottom: 0,
      zIndex: 2,
      elevation: 2,
    },
    feedList: {
      flex: 1,
    },
    feedBlur: {
      flex: 1,
      borderWidth: 0.5,
      overflow: 'hidden',
      paddingBottom: heightPixel(80),
    },
    feedListContent: {
      paddingHorizontal: widthPixel(10),
      paddingTop: heightPixel(12),
    },
    feedHeader: {
      marginBottom: heightPixel(8),
    },
    feedSectionTitle: {
      fontSize: fontPixel(10),
      fontFamily: 'SemiBold',
      letterSpacing: 1.2,
      marginTop: heightPixel(4),
      marginBottom: heightPixel(8),
      marginLeft: widthPixel(4),
    },
    portfolioRow: {
      marginBottom: heightPixel(12),
    },
    feedEmptyList: {
      flexGrow: 0,
      paddingVertical: heightPixel(24),
    },
});
