import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import { ConfirmActionSheet } from "@/components/ui/ConfirmActionSheet";
import DateTimeSelector from "@/components/ui/DateTimeSelector";
import JobSummary from "@/components/ui/JobSummary";
import MediaPreviews from "@/components/ui/MediaPreviews";
import ServiceLocation from "@/components/ui/ServiceLocation";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { selectArtisan, selectDescription, selectMedia, selectServiceDate, selectServiceLocationType, selectServiceTime, selectSummary } from "@/redux/booking/selector";
import { actions } from "@/redux/booking/slice";
import { selectAllWorkers } from "@/redux/search/selector";
import { actions as searchActions } from "@/redux/search/slice";
import { Summary } from "@/redux/search/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Image, KeyboardAvoidingView, NativeScrollEvent, NativeSyntheticEvent, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

export default function BookingScreen() {
    const router = useRouter();
    const { artisanId } = useLocalSearchParams<{ artisanId: string }>();
    const scrollViewRef = useRef<ScrollView>(null);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const dispatch = useAppDispatch();
    const artisan = useAppSelector(selectArtisan);
    const summary = useAppSelector(selectSummary);
    const appointmentTime = useAppSelector(selectServiceTime);
    const appointmentDate = useAppSelector(selectServiceDate);
    const serviceLocationType = useAppSelector(selectServiceLocationType);
    const description = useAppSelector(selectDescription);
    const media = useAppSelector(selectMedia);
    const allWorkers = useAppSelector(selectAllWorkers);

    useEffect(() => {
        if (artisanId) {
            const artisan = allWorkers.find((worker) => worker.id === artisanId);
            if (artisan) {
                dispatch(actions.setArtisan(artisan));
            }
        }
    }, [artisanId, dispatch, allWorkers]);


    // Convert Redux date and time to Date object for the selector
    const selectedDate = useMemo(() => {
        if (appointmentDate?.value && appointmentTime?.value) {
            const [year, month, day] = appointmentDate.value.split('-').map(Number);
            const [hours, minutes] = appointmentTime.value.match(/\d+/g)?.map(Number) || [];
            const isPM = appointmentTime.value.toLowerCase().includes('pm');
            
            const date = new Date(year, month - 1, day);
            date.setHours(isPM && hours !== 12 ? hours + 12 : hours);
            date.setMinutes(minutes || 0);
            return date;
        }
        return undefined;
    }, [appointmentDate?.value, appointmentTime?.value]);

    const isRequestEnabled = useMemo(() => {
        return hasScrolledToBottom && selectedDate !== undefined;
    }, [hasScrolledToBottom, selectedDate]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 20;
        const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= 
            contentSize.height - paddingToBottom;

        if (isCloseToBottom && !hasScrolledToBottom) {
            setHasScrolledToBottom(true);
        }
    };

    useFocusEffect(() => {
        dispatch(actions.initializeBooking())
    });

    const handleDateChange = (date: Date) => {
        dispatch(actions.setAppointmentDateTime(date.toISOString()));
    };

    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');

    const labelColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary,
    }, 'text');

    const accentColor = useThemeColor({
        light: colors.light.black,
        dark: colors.dark.white
    }, 'background');

    const borderColor = accentColor;

    const cardBg = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background');

    const backgroundColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black
    }, 'white');

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    const handleRequestBooking = () => {
        if (isRequestEnabled) {
            router.push('/(tabs)/(search)/(booking)/review-booking');
        }
    };

    const handleBackPress = () => {
        setShowCancelConfirm(true);
    };

    const handleConfirmCancel = () => {
        dispatch(searchActions.resetState());
        router.back();
    };

    return (
        <ThemedSafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <BackButton
                    iconName="arrow-left"
                    onPress={handleBackPress}
                />
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoid}
            >
                <ScrollView 
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                        <Text style={[styles.label, { color: labelColor }]}>BOOK SERVICE</Text>
                        <View style={styles.headerSubtitle}>
                            <ThemedText 
                                type="defaultSemiBold" 
                                style={styles.subtitleText}
                                darkColor={colors.dark.secondary}
                                lightColor={colors.light.secondary}
                            >
                                with
                            </ThemedText>
                            <Image 
                                source={require('@/assets/images/individual.png')} 
                                style={styles.avatar}
                            />
                            <ThemedText 
                                type="defaultSemiBold"
                                style={styles.artisanName}
                                darkColor={colors.dark.text}
                                lightColor={colors.light.text}
                            >
                                {artisan?.name}
                            </ThemedText>
                        </View>
                    </View>

                    {/* Description */}
                    {description && (
                        <View style={styles.section}>
                            <View style={styles.sectionLabelContainer}>
                                <Text style={[styles.sectionLabel, { color: labelColor }]}>DESCRIPTION</Text>
                            </View>
                            <View style={[styles.descriptionCard, { backgroundColor: cardBg, borderColor }]}>
                                <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
                                <View style={styles.descriptionContent}>
                                    <ThemedText 
                                        style={styles.description}
                                        darkColor={colors.dark.text}
                                        lightColor={colors.light.text}
                                    >
                                        {description}
                                    </ThemedText>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Media */}
                    {media && media.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionLabelContainer}>
                                <Text style={[styles.sectionLabel, { color: labelColor }]}>MEDIA</Text>
                            </View>
                            <View style={[styles.mediaCard, { backgroundColor: cardBg, borderColor }]}>
                                <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
                                <View style={styles.mediaContent}>
                                    <MediaPreviews 
                                        media={media}
                                        backgroundColor={backgroundColor}
                                        tintColor={tintColor}
                                        containerStyle={{ paddingHorizontal: 0 }}
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Job Summary */}
                    <JobSummary summary={summary as unknown as Summary} />

                    {/* Date and Time Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionLabelContainer}>
                            <Text style={[styles.sectionLabel, { color: labelColor }]}>DATE & TIME</Text>
                        </View>
                        <DateTimeSelector 
                            date={selectedDate}
                            onDateChange={handleDateChange}
                            // label="Date & Time"
                            labelStyle={{ ...styles.label, color: textColor }}
                            containerStyle={styles.dateTimeContainer}
                            style={{ backgroundColor }}
                        />
                        {(appointmentDate?.error || appointmentTime?.error) && (
                            <ThemedText 
                                style={styles.errorText}
                                lightColor={colors.light.error}
                                darkColor={colors.dark.error}
                            >
                                {appointmentDate?.error || appointmentTime?.error}
                            </ThemedText>
                        )}
                    </View>

                    {/* Service Location */}
                    <View style={styles.section}>
                        <View style={styles.sectionLabelContainer}>
                            <Text style={[styles.sectionLabel, { color: labelColor }]}>SERVICE LOCATION</Text>
                        </View>
                        <ServiceLocation 
                            scrollViewRef={scrollViewRef as RefObject<ScrollView>} 
                            serviceLocationType={serviceLocationType} 
                            setServiceLocationType={(serviceLocationType) => dispatch(actions.setServiceLocationType(serviceLocationType))}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <Button 
                    label="REQUEST BOOKING"
                    disabled={!isRequestEnabled}
                    onPress={handleRequestBooking}
                />
                {!isRequestEnabled && (
                    <ThemedText 
                        style={styles.warningText}
                        lightColor={colors.light.error}
                        darkColor={colors.dark.error}
                    >
                        {!selectedDate ? "Please select a date and time" : "Please review all details"}
                    </ThemedText>
                )}
            </View>
            <ConfirmActionSheet
                isOpen={showCancelConfirm}
                isOpenChange={setShowCancelConfirm}
                title="Cancel Booking?"
                description="Are you sure you want to cancel this booking? All your progress will be lost."
                onConfirm={handleConfirmCancel}
                confirmText="Yes, Cancel"
                cancelText="Continue Booking"
            />
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        paddingHorizontal: widthPixel(16),
        paddingBottom: heightPixel(16),
    },
    header: {
        paddingHorizontal: widthPixel(16),
        marginBottom: heightPixel(24),
    },
    accentBar: {
        width: widthPixel(40),
        height: heightPixel(4),
        marginBottom: heightPixel(20),
    },
    label: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
        marginBottom: heightPixel(12),
    },
    headerSubtitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
    },
    subtitleText: {
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
    },
    avatar: {
        width: widthPixel(24),
        height: widthPixel(24),
        borderRadius: 0,
    },
    artisanName: {
        fontSize: fontPixel(16),
        fontFamily: 'Medium',
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: heightPixel(100),
    },
    section: {
        marginBottom: heightPixel(24),
        paddingHorizontal: widthPixel(16),
    },
    sectionLabelContainer: {
        marginBottom: heightPixel(12),
    },
    sectionLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
    },
    descriptionCard: {
        borderWidth: 0.5,
        borderTopWidth: 0,
        overflow: 'hidden',
    },
    topAccent: {
        height: heightPixel(3),
        width: '100%',
    },
    descriptionContent: {
        padding: widthPixel(16),
    },
    description: {
        fontSize: fontPixel(15),
        fontFamily: 'Regular',
        lineHeight: fontPixel(22),
    },
    mediaCard: {
        borderWidth: 0.5,
        borderTopWidth: 0,
        overflow: 'hidden',
    },
    mediaContent: {
        padding: widthPixel(16),
    },
    footer: {
        paddingVertical: heightPixel(16),
    },
    dateTimeContainer: {
        marginHorizontal: -widthPixel(16),
    },
    errorText: {
        fontSize: fontPixel(12),
        marginTop: heightPixel(4),
        marginLeft: widthPixel(16),
        fontFamily: 'Regular'
    },
    warningText: {
        fontSize: fontPixel(12),
        textAlign: 'center',
        marginTop: heightPixel(8),
        fontFamily: 'Regular'
    },
});
