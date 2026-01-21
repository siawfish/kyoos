import AISearchModal from "@/components/home/AISearchModal";
import ArtisanCard from "@/components/search/ArtisanCard";
import ArtisanOptions from "@/components/ui/ArtisanOptions";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import { ConfirmActionSheet } from "@/components/ui/ConfirmActionSheet";
import JobSummary from "@/components/ui/JobSummary";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import ThemedMapView from '@/components/ui/ThemedMapView';
import WorkerMapMarker from "@/components/ui/WorkerMapMarker";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Media } from "@/redux/app/types";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Feather } from '@expo/vector-icons';
import { BlurTint, BlurView } from 'expo-blur';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import type MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { selectClosestWorkers, selectMedia, selectRecommendedWorkers, selectRequiredSkills, selectSearch, selectSummary } from "../../../redux/search/selector";
import { actions } from "../../../redux/search/slice";
import { Skill, Worker } from "../../../redux/search/types";

const INITIAL_REGION = {
  latitude: 5.5560,
  longitude: -0.1969,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const SearchPromptPreview = ({ search, media }: { search: string, media: Media[] }) => {
    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    const blurTint = useThemeColor({
        light: 'light',
        dark: 'dark',
    }, 'background');

    const backgroundColor = useThemeColor({
        light: colors.light.background + '95',
        dark: colors.dark.background + '95',
    }, 'background');

    const borderColor = useThemeColor({
        light: colors.light.grey,
        dark: colors.dark.grey,
    }, 'grey');

    const searchBackgroundColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black
    }, 'white');

    return (
        <BlurView intensity={80} tint={blurTint as BlurTint} style={[styles.promptContainer, { backgroundColor, borderColor }]}>
            <View style={styles.promptHeader}>
                <View style={styles.promptHeaderContent}>
                    <Feather name="search" size={16} color={tintColor} />
                    <ThemedText type="subtitle" style={styles.searchTitle}>Search</ThemedText>
                </View>
            </View>

            <View style={[styles.promptDescriptionContainer, { backgroundColor: searchBackgroundColor }]}>
                <ThemedText numberOfLines={3} style={styles.promptDescription}>{search}</ThemedText>
            </View>

            {media && media.length > 0 && (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.mediaContainer}
                >
                    {media.map((item, index) => (
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
        </BlurView>
    );
};

const ArtisanList = ({ title, artisans, requiredSkills, estimatedDuration, onPress }: { title: string, artisans: Worker[], requiredSkills: Skill[], estimatedDuration: number, onPress: (id: string) => void }) => {
    const emptyBackgroundColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black,
    }, 'white');

    const blurTint = useThemeColor({
        light: 'light',
        dark: 'dark',
    }, 'background');

    const backgroundColor = useThemeColor({
        light: colors.light.misc + '95',
        dark: colors.dark.background + '95',
    }, 'background');

    const borderColor = useThemeColor({
        light: colors.light.grey,
        dark: colors.dark.grey,
    }, 'grey');

    return (
        <BlurView intensity={80} tint={blurTint as BlurTint} style={[styles.section, { backgroundColor, borderColor }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
            {artisans?.length > 0 ? (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.horizontalScrollView}
                    contentContainerStyle={styles.horizontalScrollContent}
                >
                    {artisans.map((artisan, index) => (
                        <View key={artisan.id} style={[styles.artisanCardWrapper, { marginRight: index === artisans.length - 1 ? 0 : widthPixel(16) }]}>
                            <ArtisanCard 
                                artisan={artisan} 
                                estimatedDuration={estimatedDuration}
                                onPress={onPress}
                            />
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <View style={[styles.emptyListContainer, { backgroundColor: emptyBackgroundColor + '80' }]}>
                    <ThemedText style={styles.emptyListText}>No artisans available in this category</ThemedText>
                </View>
            )}
        </BlurView>
    );
};

export default function Results() {
    const router = useRouter();
    const summary = useAppSelector(selectSummary);
    const search = useAppSelector(selectSearch);
    const media = useAppSelector(selectMedia);
    const recommendedWorkers = useAppSelector(selectRecommendedWorkers);
    const closestWorkers = useAppSelector(selectClosestWorkers);
    const requiredSkills = useAppSelector(selectRequiredSkills);
    const [showCards, setShowCards] = useState(true);
    const dispatch = useAppDispatch();
    const [selectedArtisan, setSelectedArtisan] = useState<string | null>(null);
    const [searchModalVisible, setSearchModalVisible] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    // Animation values
    const cardsOpacity = useRef(new Animated.Value(1)).current;
    const cardsTranslateY = useRef(new Animated.Value(0)).current;
    const iconRotation = useRef(new Animated.Value(0)).current;
    const buttonScale = useRef(new Animated.Value(1)).current;

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    const blurTint = useThemeColor({
        light: 'light',
        dark: 'dark',
    }, 'background');

    const backgroundColor = useThemeColor({
        light: colors.light.background + '95',
        dark: colors.dark.background + '95',
    }, 'background');

    const secondaryColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary,
    }, 'secondary');

    const borderColor = useThemeColor({
        light: colors.light.grey,
        dark: colors.dark.grey,
    }, 'grey');

    const handleCancelSearch = () => {
        router.push('/(tabs)/(search)');
        dispatch(actions.resetState());
    }

    // Animation functions
    const animateToggle = (show: boolean) => {
        const duration = 300;
        const easing = { useNativeDriver: true };

        if (show) {
            // Show cards animation
            Animated.parallel([
                Animated.timing(cardsOpacity, {
                    toValue: 1,
                    duration,
                    ...easing,
                }),
                Animated.timing(cardsTranslateY, {
                    toValue: 0,
                    duration,
                    ...easing,
                }),
                Animated.timing(iconRotation, {
                    toValue: 0,
                    duration,
                    ...easing,
                }),
            ]).start();
        } else {
            // Hide cards animation
            Animated.parallel([
                Animated.timing(cardsOpacity, {
                    toValue: 0,
                    duration,
                    ...easing,
                }),
                Animated.timing(cardsTranslateY, {
                    toValue: 50,
                    duration,
                    ...easing,
                }),
                Animated.timing(iconRotation, {
                    toValue: 1,
                    duration,
                    ...easing,
                }),
            ]).start();
        }
    };

    const handleToggleCards = () => {
        const newShowCards = !showCards;
        setShowCards(newShowCards);
        animateToggle(newShowCards);
        
        // Add button press animation
        Animated.sequence([
            Animated.timing(buttonScale, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(buttonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const mapRef = useRef<MapView>(null);

    // Create unified list of workers with recommended workers taking precedence
    const getUnifiedWorkers = useCallback(() => {
        const recommendedIds = new Set(recommendedWorkers.map(worker => worker.id));
        const unifiedWorkers = [...recommendedWorkers];
        
        // Add closest workers that are not already in recommended
        closestWorkers.forEach(worker => {
            if (!recommendedIds.has(worker.id)) {
                unifiedWorkers.push(worker);
            }
        });
        
        return unifiedWorkers;
    }, [recommendedWorkers, closestWorkers]);

    const unifiedWorkers = useMemo(() => {
        return getUnifiedWorkers();
    }, [getUnifiedWorkers]);

    // Function to fit all markers on the map
    const fitAllMarkers = useCallback(() => {
        if (mapRef.current && unifiedWorkers.length > 0) {
            const validCoordinates = unifiedWorkers
            .map(worker => {
                let lat = INITIAL_REGION.latitude;
                let lng = INITIAL_REGION.longitude;
                
                if (worker.coordinates && Array.isArray(worker.coordinates) && worker.coordinates.length >= 2) {
                    lng = worker.coordinates[0];
                    lat = worker.coordinates[1];
                } else if (worker.location && typeof worker.location === 'object') {
                    lat = worker.location.lat || INITIAL_REGION.latitude;
                    lng = worker.location.lng || INITIAL_REGION.longitude;
                }
                
                return { latitude: lat, longitude: lng };
            })
            .filter(coord => 
                coord.latitude !== INITIAL_REGION.latitude || 
                coord.longitude !== INITIAL_REGION.longitude
            );
            if (validCoordinates.length > 0) {
                mapRef.current.fitToCoordinates(validCoordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                });
            }
        }
    }, [unifiedWorkers]);

    // Fit markers when map is ready and workers are loaded
    useEffect(() => {
        if (unifiedWorkers.length > 0) {
            // Small delay to ensure map is fully rendered
            const timer = setTimeout(() => {
                fitAllMarkers();
            }, 500);
            
            return () => clearTimeout(timer);
        }
    }, [unifiedWorkers, fitAllMarkers]);

    // Calculate map region based on worker coordinates
    const mapRegion = useMemo(() => {
        if (unifiedWorkers.length === 0) {
            return INITIAL_REGION;
        }

        const validCoordinates = unifiedWorkers
            .map(worker => {
                let lat = INITIAL_REGION.latitude;
                let lng = INITIAL_REGION.longitude;
                
                if (worker.coordinates && Array.isArray(worker.coordinates) && worker.coordinates.length >= 2) {
                    lng = worker.coordinates[0];
                    lat = worker.coordinates[1];
                } else if (worker.location && typeof worker.location === 'object') {
                    lat = worker.location.lat || INITIAL_REGION.latitude;
                    lng = worker.location.lng || INITIAL_REGION.longitude;
                }
                
                return { lat, lng };
            })
            .filter(coord => 
                coord.lat !== INITIAL_REGION.latitude || 
                coord.lng !== INITIAL_REGION.longitude
            );

        if (validCoordinates.length === 0) {
            return INITIAL_REGION;
        }

        const latitudes = validCoordinates.map(coord => coord.lat);
        const longitudes = validCoordinates.map(coord => coord.lng);

        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        const latDelta = Math.max(maxLat - minLat, 0.01) * 1.2; // Add 20% padding
        const lngDelta = Math.max(maxLng - minLng, 0.01) * 1.2; // Add 20% padding

        return {
            latitude: centerLat,
            longitude: centerLng,
            latitudeDelta: latDelta,
            longitudeDelta: lngDelta,
        };
    }, [unifiedWorkers]);

    const selectedArtisanObject = useMemo(() => {
        return unifiedWorkers.find(worker => worker.id === selectedArtisan) as Worker;
    }, [selectedArtisan, unifiedWorkers]);

    return (
        <ThemedSafeAreaView style={styles.container}>
            {/* Map Background */}
            <ThemedMapView
                ref={mapRef}
                style={styles.map}
                initialRegion={mapRegion}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={false}
                toolbarEnabled={false}
                onMapReady={fitAllMarkers}
            >
                {
                    !showCards && (
                        <>
                            {/* Add markers for unified workers list */}
                            {unifiedWorkers.map((artisan, index) => {
                                const isRecommended = recommendedWorkers.some(worker => worker.id === artisan.id);
                                const pinColor = isRecommended ? tintColor : secondaryColor;
                                
                                // Validate coordinates and use fallback if invalid
                                let latitude = INITIAL_REGION.latitude;
                                let longitude = INITIAL_REGION.longitude;
                                
                                if (artisan.coordinates && Array.isArray(artisan.coordinates) && artisan.coordinates.length >= 2) {
                                    // coordinates is [longitude, latitude] array
                                    longitude = artisan.coordinates[0];
                                    latitude = artisan.coordinates[1];
                                } else if (artisan.location && typeof artisan.location === 'object') {
                                    // location has lat/lng properties
                                    latitude = artisan.location.lat || INITIAL_REGION.latitude;
                                    longitude = artisan.location.lng || INITIAL_REGION.longitude;
                                }
                                

                                
                                return (
                                    <Marker
                                        key={`worker-${artisan.id}`}
                                        coordinate={{
                                            latitude,
                                            longitude,
                                        }}
                                        onPress={() => {
                                            // Set selected artisan to trigger ArtisanOptions
                                            setSelectedArtisan(artisan.id);
                                            // Animate to marker region when pressed
                                            if (mapRef.current) {
                                                mapRef.current.animateToRegion({
                                                    latitude,
                                                    longitude,
                                                    latitudeDelta: 0.01, // Zoom in closer
                                                    longitudeDelta: 0.01,
                                                }, 1000); // 1 second animation
                                            }
                                        }}
                                    >
                                        <WorkerMapMarker 
                                            worker={artisan} 
                                            estimatedDuration={summary.estimatedDuration}
                                            pinColor={pinColor}
                                            onPress={setSelectedArtisan}
                                        />
                                    </Marker>
                                );
                            })}
                        </>
                    )
                }
            </ThemedMapView>

            {/* Blur overlay when cards are shown */}
            {showCards && (
                <BlurView 
                    intensity={40} 
                    tint={blurTint as BlurTint} 
                    style={[StyleSheet.absoluteFill, styles.mapBlurOverlay]}
                />
            )}

            {/* Empty State Overlay for Map View */}
            {(requiredSkills.length === 0 || unifiedWorkers.length === 0) && !showCards && (
                <View style={[styles.mapEmptyStateContainer]}>
                    <BlurView intensity={80} tint={blurTint as BlurTint} style={[styles.mapEmptyState, { backgroundColor, borderColor }]}>
                        <Image source={require('@/assets/images/empty.png')} style={styles.emptyIcon} />
                        <ThemedText style={styles.emptyListText}>
                            We currently don&apos;t have service personels for this issue. Please try again later. Skilled professionals are being added every hour.
                        </ThemedText>
                    </BlurView>
                </View>
            )}

            {/* Floating Header - Always visible */}
            <View style={styles.floatingHeader}>
                <View style={styles.headerButtonsContainer}>
                    <BackButton onPress={() => setShowCancelConfirm(true)} />
                    <View style={styles.headerRightButtons}>
                        {/* Reset Map Button - Only show when in map view */}
                        {!showCards && (
                            <BlurView intensity={80} tint={blurTint as BlurTint} style={[styles.resetButton, { backgroundColor, borderColor }]}>
                                <TouchableOpacity 
                                    onPress={fitAllMarkers}
                                    style={[styles.resetButtonInner]}
                                >
                                    <Feather 
                                        name="maximize-2" 
                                        size={20} 
                                        color={tintColor} 
                                    />
                                </TouchableOpacity>
                            </BlurView>
                        )}
                        <Animated.View style={{
                            transform: [{ scale: buttonScale }]
                        }}>
                            <BlurView intensity={80} tint={blurTint as BlurTint} style={[styles.toggleButton, { backgroundColor, borderColor }]}>
                                <TouchableOpacity 
                                    onPress={handleToggleCards}
                                    style={[styles.toggleButtonInner, { borderColor }]}
                                >
                                    <Animated.View style={{
                                        transform: [{
                                            rotate: iconRotation.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0deg', '180deg']
                                            })
                                        }]
                                    }}>
                                        <Feather 
                                            name={showCards ? "map" : "menu"} 
                                            size={20} 
                                            color={tintColor} 
                                        />
                                    </Animated.View>
                                </TouchableOpacity>
                            </BlurView>
                        </Animated.View>
                    </View>
                </View>
            </View>
            <View style={styles.searchPromptContainer}>
                <SearchPromptPreview search={search} media={media} />
            </View>
            {/* Floating Content - Animated */}
            <Animated.View 
                style={[
                    styles.floatingScrollContainer,
                    {
                        opacity: cardsOpacity,
                        transform: [{ translateY: cardsTranslateY }],
                    }
                ]}
                pointerEvents={showCards ? 'auto' : 'none'}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContainerBottom} 
                    showsVerticalScrollIndicator={false}
                > 
                    <JobSummary 
                        artisan={selectedArtisanObject}
                        summary={summary} 
                        containerStyle={{ marginHorizontal: 0, marginTop: 0, marginBottom: 16 }}
                    />
                    {(requiredSkills.length === 0 || unifiedWorkers.length === 0) ? (
                        <BlurView intensity={80} tint={blurTint as BlurTint} style={[styles.section, { backgroundColor, borderColor }]}>
                            <View style={[styles.emptyListContainer, { backgroundColor: backgroundColor + '80' }]}>
                                {/* display empty icon */}
                                <Image source={require('@/assets/images/empty.png')} style={styles.emptyIcon} />
                                <ThemedText style={styles.emptyListText}>
                                    We currently don&apos;t have service personels for this issue. Please try again later. Skilled professionals are being added every hour.
                                </ThemedText>
                            </View>
                        </BlurView>
                    ) : (
                        <>
                            <ArtisanList 
                                title="Recommended Workers" 
                                artisans={recommendedWorkers} 
                                requiredSkills={requiredSkills}
                                estimatedDuration={summary.estimatedDuration}
                                onPress={setSelectedArtisan}
                            />
                            <ArtisanList 
                                title="Closest Workers" 
                                artisans={closestWorkers} 
                                requiredSkills={requiredSkills} 
                                estimatedDuration={summary.estimatedDuration} 
                                onPress={setSelectedArtisan}
                            />
                        </>
                    )}
                </ScrollView>
            </Animated.View>

            {/* Floating Back Button */}
            <View style={styles.backButtonContainer}>
                <Button
                    label="Modify Search"
                    icon={<Feather name="edit" size={20} color={colors.light.white} />}
                    onPress={() => setSearchModalVisible(true)}
                    style={styles.backButton}
                    darkBackgroundColor={colors.light.tint}
                    lightBackgroundColor={colors.light.black}
                    labelStyle={{ color: colors.dark.white }}
                />
            </View>
            <ArtisanOptions
                isVisible={!!selectedArtisan}
                onClose={() => {
                    setSelectedArtisan(null);
                    fitAllMarkers();
                }}
                artisan={unifiedWorkers.find(worker => worker.id === selectedArtisan) as Worker}
            >
                {
                    selectedArtisanObject && (
                        <ArtisanCard
                            artisan={selectedArtisanObject}
                            estimatedDuration={summary.estimatedDuration}
                        />
                    )
                }
            </ArtisanOptions>
            <AISearchModal 
                visible={searchModalVisible}
                onClose={() => setSearchModalVisible(false)}
            />
            <ConfirmActionSheet
                isOpen={showCancelConfirm}
                isOpenChange={setShowCancelConfirm}
                title="Cancel Search"
                description="Are you sure you want to cancel the search?"
                onConfirm={handleCancelSearch}
                confirmText="Confirm"
                cancelText="Cancel"
            />
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
    mapBlurOverlay: {
        zIndex: 0,
    },
    floatingScrollContainer: {
        flex: 1,
        paddingHorizontal: widthPixel(16),
        zIndex: 1,
    },
    searchPromptContainer: {
        marginTop: heightPixel(66),
        paddingHorizontal: widthPixel(16),
    },
    backButtonContainer: {
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(12),
        position: 'absolute',
        bottom: heightPixel(16),
        left: widthPixel(16),
        right: widthPixel(16),
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    backButton: {
        paddingHorizontal: widthPixel(16),
        maxHeight: heightPixel(40),
    },
    scrollContainerBottom: {
        paddingBottom: heightPixel(120), // Extra padding to account for floating button
        paddingTop: heightPixel(16),
    },
    section: {
        marginBottom: heightPixel(16),
        padding: widthPixel(16),
        overflow: 'hidden',
        borderWidth: 0.5,
    },
    sectionTitle: {
        fontSize: fontPixel(16),
        marginBottom: heightPixel(8),
    },
    horizontalScrollView: {
        flexGrow: 0,
        flexShrink: 1,
    },
    horizontalScrollContent: {
        paddingRight: widthPixel(16),
        paddingVertical: heightPixel(8),
    },
    artisanCardWrapper: {
        // Individual card wrapper for spacing
    },
    promptContainer: {
        marginVertical: heightPixel(8),
        overflow: 'hidden',
        borderWidth: 1,
    },
    promptHeader: {
        paddingHorizontal: widthPixel(8),
        paddingTop: heightPixel(8),
        marginBottom: heightPixel(8),
    },
    promptHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
    },
    promptTitle: {
        fontSize: fontPixel(20),
    },
    searchTitle: {
        fontSize: fontPixel(16),
    },
    promptDescription: {
        fontSize: fontPixel(16),
    },
    promptDescriptionContainer: {
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(8),
    },
    mediaContainer: {
        flexDirection: 'row',
        marginVertical: heightPixel(8),
        paddingHorizontal: widthPixel(16),
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
    jobSummaryContainer: {
        marginVertical: heightPixel(8),
        padding: widthPixel(16),
        overflow: 'hidden',
    },
    emptyContainer: {
        padding: widthPixel(24),
        marginVertical: heightPixel(16),
        alignItems: 'center',
        gap: heightPixel(12),
    },
    emptyTitle: {
        fontSize: fontPixel(18),
        textAlign: 'center',
    },
    emptyDescription: {
        fontSize: fontPixel(14),
        textAlign: 'center',
        opacity: 0.7,
    },
    emptyValue: {
        fontStyle: 'italic',
        opacity: 0.7,
    },
    emptyListContainer: {
        padding: widthPixel(16),
        marginTop: heightPixel(8),
    },
    emptyListText: {
        fontSize: fontPixel(14),
        textAlign: 'center',
        opacity: 0.7,
        fontStyle: 'italic',
    },
    headerButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerRightButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
    },
    toggleButton: {
        overflow: 'hidden',
        width: widthPixel(48),
        height: widthPixel(48),
        borderWidth: 0.5,
    },
    toggleButtonInner: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0.5,
    },
    resetButton: {
        overflow: 'hidden',
        width: widthPixel(48),
        height: widthPixel(48),
        borderWidth: 0.5,
    },
    resetButtonInner: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingHeader: {
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
        paddingHorizontal: widthPixel(16),
        paddingTop: heightPixel(16),
        zIndex: 2,
        pointerEvents: 'box-none',
    },
    spacer: {
        height: heightPixel(200), // Space for the floating header
    },
    emptyIcon: {
        width: widthPixel(64),
        height: widthPixel(64),
        marginBottom: heightPixel(16),
        alignSelf: 'center',
    },
    mapEmptyStateContainer: {
        position: 'absolute',
        top: 120,
        left: 0,
        right: 0,
        bottom: 120,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: widthPixel(16),
        zIndex: 3,
    },
    mapEmptyState: {
        padding: widthPixel(24),
        alignItems: 'center',
        borderWidth: 1,
    },
});