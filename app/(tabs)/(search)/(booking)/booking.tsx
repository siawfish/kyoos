import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, Image, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import { colors } from "@/constants/theme/colors";
import { heightPixel, widthPixel, fontPixel } from "@/constants/normalize";
import { useRouter } from "expo-router";
import { useRef, useLayoutEffect, useMemo, useState } from "react";
import { useThemeColor } from "@/hooks/use-theme-color";
import DateTimeSelector from "@/components/ui/DateTimeSelector";
import ServiceLocation from "@/components/ui/ServiceLocation";
import { Feather } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectArtisan, selectServiceLocationType, selectSummary, selectServiceTime, selectServiceDate, selectDescription, selectMedia } from "@/redux/booking/selector";
import { actions } from "@/redux/booking/slice";
import JobSummary from "@/components/ui/JobSummary";
import MediaPreviews from "@/components/ui/MediaPreviews";

export default function BookingScreen() {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const dispatch = useAppDispatch();
    const artisan = useAppSelector(selectArtisan);
    const summary = useAppSelector(selectSummary);
    const appointmentTime = useAppSelector(selectServiceTime);
    const appointmentDate = useAppSelector(selectServiceDate);
    const serviceLocationType = useAppSelector(selectServiceLocationType);
    const description = useAppSelector(selectDescription);
    const media = useAppSelector(selectMedia);

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

    useLayoutEffect(() => {
        dispatch(actions.initializeBooking());
    }, []);

    const handleDateChange = (date: Date) => {
        dispatch(actions.setAppointmentDateTime(date.toISOString()));
    };

    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');

    const backgroundColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black
    }, 'white');

    const secondaryColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary,
    }, 'secondary');

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    const handleRequestBooking = () => {
        if (isRequestEnabled) {
            router.push('/(tabs)/(search)/(booking)/review-booking');
        }
    };

    return (
        <ThemedSafeAreaView style={styles.container}>
            <View style={styles.header}>
                <BackButton
                    iconName="arrow-left"
                    onPress={() => router.back()}
                />
                <View style={styles.headerContent}>
                    <ThemedText type="title" style={styles.headerTitle}>Book Service</ThemedText>
                    <View style={styles.headerSubtitle}>
                        <ThemedText 
                            type="defaultSemiBold" 
                            lightColor={colors.light.secondary}
                            darkColor={colors.dark.secondary}
                        >
                            with
                        </ThemedText>
                        <Image 
                            source={require('@/assets/images/individual.png')} 
                            style={styles.avatar}
                        />
                        <ThemedText 
                            type="defaultSemiBold"
                            lightColor={colors.light.tint}
                            darkColor={colors.dark.tint}
                        >
                            {artisan?.name}
                        </ThemedText>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoid}
            >
                <ScrollView 
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                >
                    {/* Description */}
                    {description && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Feather name="file-text" size={16} color={secondaryColor} />
                                <ThemedText 
                                    type="defaultSemiBold" 
                                    style={styles.sectionTitle}
                                    lightColor={colors.light.text}
                                >
                                    Description
                                </ThemedText>
                            </View>
                            <ThemedText 
                                style={styles.description}
                                lightColor={colors.light.text}
                            >
                                {description}
                            </ThemedText>
                        </View>
                    )}
                    

                    {/* Media */}
                    {media && media.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Feather name="image" size={16} color={secondaryColor} />
                                <ThemedText 
                                    type="defaultSemiBold" 
                                    style={styles.sectionTitle}
                                    lightColor={colors.light.text}
                                >
                                    Media
                                </ThemedText>
                            </View>
                            <MediaPreviews 
                                media={media}
                                backgroundColor={backgroundColor}
                                tintColor={tintColor}
                                containerStyle={{ paddingHorizontal: 0 }}
                            />
                        </View>
                    )}

                    {/* Job Summary */}
                    <JobSummary summary={summary} />

                    {/* Date and Time Selection */}
                    <View style={styles.section}>
                        <DateTimeSelector 
                            date={selectedDate}
                            onDateChange={handleDateChange}
                            label="Date & Time"
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
                        <ServiceLocation 
                            scrollViewRef={scrollViewRef} 
                            serviceLocationType={serviceLocationType} 
                            setServiceLocationType={(serviceLocationType) => dispatch(actions.setServiceLocationType(serviceLocationType))}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={styles.footer}>
                <Button 
                    label="Request Booking"
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
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(16),
        gap: widthPixel(16),
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: fontPixel(24),
    },
    headerSubtitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(4),
    },
    avatar: {
        width: widthPixel(20),
        height: widthPixel(20),
        borderRadius: widthPixel(10),
    },
    keyboardAvoid: {
        flex: 1,
        marginTop: heightPixel(16)
    },
    scrollView: {
        flex: 1,
    },
    section: {
        marginBottom: heightPixel(24),
        paddingHorizontal: widthPixel(16),
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
        marginBottom: heightPixel(8),
    },
    sectionTitle: {
        fontSize: fontPixel(16),
    },
    description: {
        fontSize: fontPixel(16),
        lineHeight: heightPixel(24),
    },
    label: {
        fontSize: fontPixel(16),
        fontFamily: 'Bold',
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