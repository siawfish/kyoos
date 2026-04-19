import BookingPreviewCard from '@/components/home/BookingPreviewCard';
import NearbyWorkersStrip from '@/components/home/NearbyWorkersStrip';
import SearchInputTrigger from '@/components/home/SearchInputTrigger';
import PortfolioSkeleton from '@/components/portfolio/Loaders/PortfolioSkeleton';
import PortfolioItem from '@/components/portfolio/Portfolio';
import ArtisanCard from '@/components/search/ArtisanCard';
import UserLocation from '@/components/search/UserLocation';
import ArtisanOptions from '@/components/ui/ArtisanOptions';
import EmptyList from '@/components/ui/EmptyList';
import { TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP } from '@/constants/navigation/tabRootScrollPadding';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import ThemedMapView from '@/components/ui/ThemedMapView';
import UserMapLocationMarker from '@/components/ui/UserMapLocationMarker';
import WorkerMapMarker from '@/components/ui/WorkerMapMarker';
import { ACCRA_REGION } from '@/constants/helpers';
import {
    HOME_MAP_INITIAL_LATITUDE_DELTA,
    HOME_MAP_INITIAL_LONGITUDE_DELTA,
    MAP_REGION_FETCH_DEBOUNCE_MS,
    mapFetchCellKey,
} from '@/constants/mapSearch';
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
import type { Booking } from '@/redux/booking/types';
import { selectIsInitializing, selectNearestWorkers, selectSelectedArtisan } from '@/redux/search/selector';
import { actions } from '@/redux/search/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from "@react-navigation/native";
import { BlurTint, BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { isBefore } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    NativeScrollEvent,
    NativeSyntheticEvent,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import type MapView from 'react-native-maps';
import { Marker, type Region } from 'react-native-maps';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import HeaderNotificationButton from '@/components/ui/AccentScreenHeader/HeaderNotificationButton';

const SEARCH_BAR_TOP_FEED = heightPixel(120);
/** Same targets as `searchBarContainer` top when booking preview is closed vs open */
const SEARCH_BAR_TOP_BOOKING_OPEN =
    heightPixel(50) + heightPixel(2) + heightPixel(180) + heightPixel(1);
const FEED_TOP_DELTA_WHEN_BOOKING_OPEN = SEARCH_BAR_TOP_BOOKING_OPEN - SEARCH_BAR_TOP_FEED;

const FEED_PANEL_TOP = SEARCH_BAR_TOP_FEED + heightPixel(72) + heightPixel(6);

/** Feed scroll: hide header location when scrolling down; show on scroll up or when scroll ends */
const FEED_SCROLL_TOP_THRESHOLD = 12;
const FEED_SCROLL_DELTA_THRESHOLD = 8;
const LOCATION_BAR_HIDE_DEBOUNCE_MS = 100;
const LOCATION_BAR_SHOW_DURATION_MS = 220;
const LOCATION_BAR_HIDE_DURATION_MS = 240;
/** Layout height of the header BlurView row (location + toggles); also used to collapse gap + shift search/feed */
const HEADER_BLUR_ROW_LAYOUT_HEIGHT = heightPixel(56);

/** Booking toggle label pulse: shared animated opacity min + timing (scale interpolates from the same driver) */
const TOGGLE_LABEL_PULSE_MIN = 0.55;
const TOGGLE_LABEL_PULSE_MS = 1400;

/** Matches `useBookingStatus` — combine service date with start clock time */
function getBookingStartDate(booking: Pick<Booking, 'date' | 'startTime'>): Date | null {
    if (!booking.date || !booking.startTime) return null;
    const ms = new Date(booking.date).setTime(new Date(booking.startTime).getTime());
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
}

export default function HomeScreen() {
    const selectedArtisan = useAppSelector(selectSelectedArtisan);
    const [showBookingCard, setShowBookingCard] = useState(false);
    const [isMapFullView, setIsMapFullView] = useState(false);
    const mapRef = useRef<MapView>(null);
    /** Grid cells already loaded via map-region fetch (dedupe). Seeded on init/refresh; cleared on tab focus refresh. */
    const fetchedMapCellsRef = useRef<Set<string>>(new Set());
    const mapRegionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prevMapFullViewRef = useRef(false);
    const isMapFullViewRef = useRef(isMapFullView);
    const homeActiveBooking = useAppSelector(selectHomeActiveBooking);
    const nearestWorkers = useAppSelector(selectNearestWorkers);
    const location = useAppSelector(selectUserLocation);
    const dispatch = useAppDispatch();
    const isInitializing = useAppSelector(selectIsInitializing);
    const homePopularPortfolios = useAppSelector(selectHomePopularPortfolios);
    const homePopularPagination = useAppSelector(selectHomePopularPagination);
    const isLoadingHomePopular = useAppSelector(selectIsLoadingHomePopular);
    const isAppendingHomePopular = useAppSelector(selectIsAppendingHomePopular);
    /** Native RefreshControl spinner only while user pulled to refresh — not during initial skeleton load */
    const [isPullRefreshing, setIsPullRefreshing] = useState(false);
    // Animation values
    const bookingCardHeight = useRef(new Animated.Value(0)).current;
    const bookingCardOpacity = useRef(new Animated.Value(0)).current;
    const toggleRotation = useRef(new Animated.Value(0)).current;
    /** Subtle breathe on booking toggle label when a booking exists */
    const toggleLabelAttention = useRef(new Animated.Value(1)).current;
    /** 0 = location visible, 1 = hidden */
    const locationBarAnim = useRef(new Animated.Value(0)).current;
    const prevScrollYRef = useRef(0);
    const isLocationHiddenRef = useRef(false);
    const hideLocationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [locationBarHiddenForPointer, setLocationBarHiddenForPointer] = useState(false);
    /** Keeps scroll handler in sync — collapse booking preview on scroll down without stale state */
    const showBookingCardRef = useRef(false);

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

    const collapseBookingPreview = useCallback(() => {
        if (!showBookingCardRef.current) {
            return;
        }
        showBookingCardRef.current = false;
        setShowBookingCard(false);
        bookingCardHeight.stopAnimation();
        bookingCardOpacity.stopAnimation();
        toggleRotation.stopAnimation();
        Animated.parallel([
            Animated.spring(bookingCardHeight, {
                toValue: 0,
                useNativeDriver: false,
                tension: 80,
                friction: 12,
            }),
            Animated.timing(bookingCardOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.spring(toggleRotation, {
                toValue: 0,
                useNativeDriver: true,
                tension: 80,
                friction: 12,
            }),
        ]).start();
    }, [bookingCardHeight, bookingCardOpacity, toggleRotation]);

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
                collapseBookingPreview();
            } else if (delta < -FEED_SCROLL_DELTA_THRESHOLD) {
                revealLocationBar();
            }
        },
        [
            isMapFullView,
            queueHideLocationBar,
            revealLocationBar,
            clearHideLocationDebounce,
            collapseBookingPreview,
        ],
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
        const lat = location?.lat ?? ACCRA_REGION.latitude;
        const lng = location?.lng ?? ACCRA_REGION.longitude;
        fetchedMapCellsRef.current = new Set([mapFetchCellKey(lat, lng)]);
        dispatch(actions.onInitialize({ lat, lng }));
        dispatch(portfolioActions.fetchHomePopular({ page: 1 }));
        dispatch(bookingsActions.fetchHomeActiveBooking());
    }, [dispatch, location?.lat, location?.lng]));

    const onRefreshFeed = useCallback(() => {
        setIsPullRefreshing(true);
        const lat = location?.lat ?? ACCRA_REGION.latitude;
        const lng = location?.lng ?? ACCRA_REGION.longitude;
        fetchedMapCellsRef.current = new Set([mapFetchCellKey(lat, lng)]);
        dispatch(actions.onInitialize({ lat, lng }));
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
            showBookingCardRef.current = false;
            bookingCardHeight.setValue(0);
            bookingCardOpacity.setValue(0);
            toggleRotation.setValue(0);
        }
    }, [homeActiveBooking, bookingCardHeight, bookingCardOpacity, toggleRotation]);

    useEffect(() => {
        showBookingCardRef.current = showBookingCard;
    }, [showBookingCard]);

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
        setIsMapFullView((v) => {
            const next = !v;
            isMapFullViewRef.current = next;
            return next;
        });
    }, []);

    useEffect(() => {
        isMapFullViewRef.current = isMapFullView;
    }, [isMapFullView]);

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

    const homeMapInitialRegion = useMemo(
        () => ({
            latitude: location?.lat ?? ACCRA_REGION.latitude,
            longitude: location?.lng ?? ACCRA_REGION.longitude,
            latitudeDelta: HOME_MAP_INITIAL_LATITUDE_DELTA,
            longitudeDelta: HOME_MAP_INITIAL_LONGITUDE_DELTA,
        }),
        [location?.lat, location?.lng],
    );

    const centerMapOnUser = useCallback(() => {
        if (!mapRef.current) return;
        const lat = location?.lat ?? ACCRA_REGION.latitude;
        const lng = location?.lng ?? ACCRA_REGION.longitude;
        mapRef.current.animateToRegion(
            {
                latitude: lat,
                longitude: lng,
                latitudeDelta: HOME_MAP_INITIAL_LATITUDE_DELTA,
                longitudeDelta: HOME_MAP_INITIAL_LONGITUDE_DELTA,
            },
            350,
        );
    }, [location?.lat, location?.lng]);

    const scheduleMapRegionFetch = useCallback(
        (region: Region) => {
            if (mapRegionDebounceRef.current) {
                clearTimeout(mapRegionDebounceRef.current);
            }
            mapRegionDebounceRef.current = setTimeout(() => {
                mapRegionDebounceRef.current = null;
                if (!isMapFullViewRef.current) return;
                const key = mapFetchCellKey(region.latitude, region.longitude);
                if (fetchedMapCellsRef.current.has(key)) return;
                fetchedMapCellsRef.current.add(key);
                dispatch(
                    actions.fetchMapRegionWorkers({
                        lat: region.latitude,
                        lng: region.longitude,
                    }),
                );
            }, MAP_REGION_FETCH_DEBOUNCE_MS);
        },
        [dispatch],
    );

    const onMapRegionChangeComplete = useCallback(
        (region: Region) => {
            if (!isMapFullViewRef.current) return;
            scheduleMapRegionFetch(region);
        },
        [scheduleMapRegionFetch],
    );

    useEffect(() => {
        return () => {
            if (mapRegionDebounceRef.current) {
                clearTimeout(mapRegionDebounceRef.current);
            }
        };
    }, []);

    /** Entering full map: center on user (do not zoom to fit all worker markers). */
    useEffect(() => {
        if (isMapFullView && !prevMapFullViewRef.current) {
            const t = setTimeout(() => centerMapOnUser(), 200);
            prevMapFullViewRef.current = true;
            return () => clearTimeout(t);
        }
        if (!isMapFullView) {
            prevMapFullViewRef.current = false;
        }
    }, [isMapFullView, centerMapOnUser]);

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

    const homeBookingToggleLabel = useMemo(() => {
        const start = homeActiveBooking ? getBookingStartDate(homeActiveBooking) : null;
        if (!start) return 'BOOKING';
        return isBefore(new Date(), start) ? 'UPCOMING' : 'ONGOING';
    }, [homeActiveBooking]);

    useEffect(() => {
        if (!homeActiveBooking) {
            toggleLabelAttention.setValue(1);
            return;
        }
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(toggleLabelAttention, {
                    toValue: TOGGLE_LABEL_PULSE_MIN,
                    duration: TOGGLE_LABEL_PULSE_MS,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(toggleLabelAttention, {
                    toValue: 1,
                    duration: TOGGLE_LABEL_PULSE_MS,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ]),
        );
        loop.start();
        return () => {
            loop.stop();
            toggleLabelAttention.setValue(1);
        };
    }, [homeActiveBooking, toggleLabelAttention]);

    // Toggle booking card visibility with animation
    const toggleBookingCard = () => {
        const nextOpen = !showBookingCard;
        const toValue = nextOpen ? 1 : 0;
        showBookingCardRef.current = nextOpen;
        setShowBookingCard(nextOpen);

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

    const feedKeyExtractor = useCallback((item: HomeFeedRow) => item.id, []);

    const renderFeedItem = useCallback(
        ({ item }: ListRenderItemInfo<HomeFeedRow>) => {
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
        },
        [],
    );

    const feedHeader = useMemo(
        () => (
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
        ),
        [nearestWorkers, location?.lat, location?.lng, isInitializing, secondaryColor],
    );

    const feedEmpty = useMemo(
        () =>
            homePopularPortfolios.length === 0 && !isLoadingHomePopular ? (
                <EmptyList
                    message="No portfolio posts yet"
                    containerStyle={styles.feedEmptyList}
                />
            ) : null,
        [homePopularPortfolios.length, isLoadingHomePopular],
    );

    const feedFooter = useMemo(
        () =>
            isAppendingHomePopular ? (
                <View style={styles.portfolioRow}>
                    <PortfolioSkeleton />
                </View>
            ) : null,
        [isAppendingHomePopular],
    );

    const feedRefreshControl = useMemo(
        () => (
            <RefreshControl
                refreshing={isPullRefreshing}
                onRefresh={onRefreshFeed}
                tintColor={tintColor}
            />
        ),
        [isPullRefreshing, onRefreshFeed, tintColor],
    );

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

    return (
        <ThemedSafeAreaView lightColor={colors.light.background} darkColor={colors.dark.background} style={styles.container}>
            {/* Map Background */}
            <ThemedMapView
                ref={mapRef}
                style={styles.map}
                initialRegion={homeMapInitialRegion}
                showsUserLocation={false}
                showsMyLocationButton={false}
                showsCompass={false}
                toolbarEnabled={false}
                onRegionChangeComplete={onMapRegionChangeComplete}
                onMapReady={() => {
                    if (isMapFullView) {
                        centerMapOnUser();
                    }
                }}
            >
                <UserMapLocationMarker
                    latitude={location?.lat ?? ACCRA_REGION.latitude}
                    longitude={location?.lng ?? ACCRA_REGION.longitude}
                />
                {nearestWorkers.map((artisan) => (
                    <Marker
                        key={artisan.id}
                        coordinate={{
                            latitude: artisan.coordinates[1],
                            longitude: artisan.coordinates[0],
                        }}
                        anchor={{ x: 0.5, y: 1 }}
                        onPress={() => handleMarkerPress(artisan.id)}
                    >
                        <WorkerMapMarker
                            worker={artisan}
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
                    style={[StyleSheet.absoluteFill, styles.mapFeedOverlay]}
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
                                        accessibilityLabel={
                                            homeBookingToggleLabel === 'UPCOMING'
                                                ? 'Upcoming booking'
                                                : homeBookingToggleLabel === 'ONGOING'
                                                  ? 'Ongoing booking'
                                                  : 'Booking'
                                        }
                                    >
                                        <View style={[styles.toggleContent]}>
                                            <Animated.Text
                                                style={[
                                                    styles.toggleText,
                                                    {
                                                        color: secondaryColor,
                                                        opacity: toggleLabelAttention,
                                                        transform: [
                                                            {
                                                                scale: toggleLabelAttention.interpolate({
                                                                    inputRange: [
                                                                        TOGGLE_LABEL_PULSE_MIN,
                                                                        1,
                                                                    ],
                                                                    outputRange: [0.9, 1],
                                                                }),
                                                            },
                                                        ],
                                                    },
                                                ]}
                                            >
                                                {homeBookingToggleLabel}
                                            </Animated.Text>
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
                                        </View>
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
                            <HeaderNotificationButton containerStyle={styles.notificationButton} iconSize={18} iconColor={tintColor} />
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
                          outputRange: [SEARCH_BAR_TOP_FEED, SEARCH_BAR_TOP_BOOKING_OPEN],
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
                            top: Animated.add(
                                locationBarAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [
                                        FEED_PANEL_TOP,
                                        FEED_PANEL_TOP - HEADER_BLUR_ROW_LAYOUT_HEIGHT,
                                    ],
                                }),
                                bookingCardHeight.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, FEED_TOP_DELTA_WHEN_BOOKING_OPEN],
                                }),
                            ),
                        },
                    ]}
                    pointerEvents="box-none"
                >
                    <View
                        style={[styles.feedPanel, { backgroundColor, borderColor }]}
                    >
                        <FlashList
                            data={popularFeedData}
                            keyExtractor={feedKeyExtractor}
                            renderItem={renderFeedItem}
                            ListHeaderComponent={feedHeader}
                            ListEmptyComponent={feedEmpty}
                            ListFooterComponent={feedFooter}
                            contentContainerStyle={styles.feedListContent}
                            refreshControl={feedRefreshControl}
                            onEndReached={onEndReachedPopular}
                            onEndReachedThreshold={0.35}
                            showsVerticalScrollIndicator={false}
                            scrollEventThrottle={16}
                            onScroll={onFeedScroll}
                            drawDistance={200}
                        />
                    </View>
                </Animated.View>
            ) : null}

            {/* Full map: recenter on your location */}
            {isMapFullView ? (
                <View style={styles.mapRecenterWrap} pointerEvents="box-none">
                    <BlurView intensity={40} tint={blurTint as 'light' | 'dark'} style={[styles.mapRecenterBlur, { backgroundColor, borderColor }]}>
                        <TouchableOpacity
                            style={styles.mapRecenterButton}
                            onPress={centerMapOnUser}
                            activeOpacity={0.75}
                            accessibilityRole="button"
                            accessibilityLabel="Recenter map on your location"
                        >
                            <Feather name="crosshair" size={22} color={textColor} />
                        </TouchableOpacity>
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
      ...StyleSheet.absoluteFill,
      zIndex: 0,
    },
    mapFeedOverlay: {
      ...StyleSheet.absoluteFill,
      zIndex: 1,
      elevation: 1,
    },
    floatingHeader: {
      position: 'absolute',
      top: heightPixel(60),
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
      gap: widthPixel(8),
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
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationButton: {
      width: undefined,
      height: undefined,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: "transparent"
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: widthPixel(16),
    },
    bookingToggle: {},
    toggleContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: widthPixel(6),
      paddingHorizontal: widthPixel(12),
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
    mapRecenterWrap: {
      position: 'absolute',
      bottom: heightPixel(180),
      right: widthPixel(16),
      zIndex: 2,
      elevation: 2,
    },
    mapRecenterBlur: {
      overflow: 'hidden',
      borderWidth: 0.5,
    },
    mapRecenterButton: {
      width: widthPixel(48),
      height: widthPixel(48),
      alignItems: 'center',
      justifyContent: 'center',
    },
    feedSheet: {
      position: 'absolute',
      left: widthPixel(16),
      right: widthPixel(16),
      bottom: 0,
      zIndex: 2,
      elevation: 2,
    },
    feedPanel: {
      flex: 1,
      borderWidth: 0.5,
      overflow: 'hidden',
    },
    feedListContent: {
      paddingHorizontal: widthPixel(10),
      paddingTop: heightPixel(12),
      paddingBottom: heightPixel(80) + TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP,
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
