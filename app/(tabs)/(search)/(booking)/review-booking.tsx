import { StyleSheet, View, ScrollView } from "react-native";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import { colors } from "@/constants/theme/colors";
import { heightPixel, widthPixel, fontPixel } from "@/constants/normalize";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Feather } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectServiceLocationType, selectSummary, selectServiceTime, selectServiceDate, selectDescription, selectMedia, selectIsLoading, selectIsSuccess } from "../../../../redux/booking/selector";
import { actions } from "../../../../redux/booking/slice";
import { actions as searchActions } from "../../../../redux/search/slice";
import { format } from 'date-fns';
import { ServiceLocationType } from "@/redux/booking/types";
import MediaPreviews from "@/components/ui/MediaPreviews";
import SuccessOverlay from "@/components/ui/SuccessOverlay";
import { BlurView } from "expo-blur";

export default function ReviewBooking() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const summary = useAppSelector(selectSummary);
    const appointmentTime = useAppSelector(selectServiceTime);
    const appointmentDate = useAppSelector(selectServiceDate);
    const serviceLocationType = useAppSelector(selectServiceLocationType);
    const description = useAppSelector(selectDescription);
    const media = useAppSelector(selectMedia);
    const isLoading = useAppSelector(selectIsLoading);
    const isSuccess = useAppSelector(selectIsSuccess);

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    const borderColor = useThemeColor({
        light: colors.light.grey,
        dark: colors.dark.grey,
    }, 'grey');

    const backgroundColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black
    }, 'white');

    const handleConfirmBooking = () => {
        dispatch(actions.onConfirmBooking());
        // Simulate API call
        setTimeout(() => {
            dispatch(actions.onConfirmBookingSuccess());
        }, 2000);
    };

    const handleSuccessClose = () => {
        router.replace('/(tabs)/(bookings)');
        dispatch(actions.resetState());
        dispatch(searchActions.resetState());
    };

    const formattedDateTime = (() => {
        if (appointmentDate?.value && appointmentTime?.value) {
            const date = new Date(appointmentDate.value);
            return {
                date: format(date, 'EEEE, MMMM d, yyyy'),
                time: appointmentTime.value
            };
        }
        return null;
    })();

    return (
        <ThemedSafeAreaView style={styles.container}>
            <View style={styles.header}>
                <BackButton
                    iconName="arrow-left"
                    onPress={() => router.back()}
                />
                <ThemedText type="title" style={styles.headerTitle}>Review Booking</ThemedText>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Description Section */}
                {description && (
                    <View style={[styles.section, { borderColor }]}>
                        <View style={styles.sectionHeader}>
                            <Feather name="file-text" size={20} color={tintColor} />
                            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                                Description
                            </ThemedText>
                        </View>
                        <ThemedText style={styles.sectionContent}>
                            {description}
                        </ThemedText>
                    </View>
                )}

                {/* Media Section */}
                {media && media.length > 0 && (
                    <View style={[styles.section, { borderColor }]}>
                        <View style={styles.sectionHeader}>
                            <Feather name="image" size={20} color={tintColor} />
                            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                                Media
                            </ThemedText>
                        </View>
                        <MediaPreviews 
                            media={media}
                            backgroundColor={backgroundColor}
                            tintColor={tintColor}
                            containerStyle={styles.mediaContainer}
                        />
                    </View>
                )}

                {/* Time Estimation */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Feather name="clock" size={20} color={tintColor} />
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                            Time Estimation
                        </ThemedText>
                    </View>
                    <View style={styles.estimationContainer}>
                        <ThemedText style={styles.sectionContent}>
                            Estimated Duration: {summary?.estimatedDuration || 'Not specified'}
                        </ThemedText>
                        <ThemedText style={[styles.sectionContent, styles.estimationNote]}>
                            Note: Duration may vary based on complexity and unforeseen issues
                        </ThemedText>
                    </View>
                </View>

                {/* Date & Time */}
                {formattedDateTime && (
                    <View style={[styles.section, { borderColor }]}>
                        <View style={styles.sectionHeader}>
                            <Feather name="calendar" size={20} color={tintColor} />
                            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                                Date & Time
                            </ThemedText>
                        </View>
                        <ThemedText style={styles.sectionContent}>
                            {formattedDateTime.date}
                        </ThemedText>
                        <ThemedText style={styles.sectionContent}>
                            {formattedDateTime.time}
                        </ThemedText>
                    </View>
                )}

                {/* Service Location */}
                <View style={[styles.section, { borderColor }]}>
                    <View style={styles.sectionHeader}>
                        <Feather name="map-pin" size={20} color={tintColor} />
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                            Service Location
                        </ThemedText>
                    </View>
                    <ThemedText style={styles.sectionContent}>
                        {serviceLocationType === ServiceLocationType.SHOP ? 'At Artisan\'s Shop' : 'At Your Location'}
                    </ThemedText>
                </View>

                {/* Required Skills */}
                {summary?.requiredSkills && summary.requiredSkills.length > 0 && (
                    <View style={[styles.section, { borderColor }]}>
                        <View style={styles.sectionHeader}>
                            <Feather name="tool" size={20} color={tintColor} />
                            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                                Required Skills
                            </ThemedText>
                        </View>
                        {summary.requiredSkills.map((skill, index) => (
                            <ThemedText key={index} style={styles.sectionContent}>
                                • {skill}
                            </ThemedText>
                        ))}
                    </View>
                )}

                {/* Price Estimation */}
                <View style={[styles.section, { borderColor }]}>
                    <View style={styles.sectionHeader}>
                        <Feather name="dollar-sign" size={20} color={tintColor} />
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                            Price Estimation
                        </ThemedText>
                    </View>
                    <ThemedText style={styles.sectionContent}>
                        Estimated Cost: {summary?.estimatedPrice || 'To be discussed'}
                    </ThemedText>
                    <ThemedText style={[styles.sectionContent, styles.estimationNote]}>
                        Note: Final price may vary based on actual work required
                    </ThemedText>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button 
                    label="Confirm Booking"
                    onPress={handleConfirmBooking}
                    isLoading={isLoading}
                />
            </View>

            {isSuccess && (
                <>
                    <BlurView
                        intensity={20}
                        tint="dark"
                        style={StyleSheet.absoluteFill}
                    />
                    <SuccessOverlay
                        title="Booking Requested"
                        text="Your booking has been requested. We will notify you when the booking is accepted."
                        buttonLabel="View Booking"
                        onButtonPress={handleSuccessClose}
                    />
                </>
            )}
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(16),
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(16),
    },
    headerTitle: {
        fontSize: fontPixel(24),
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: widthPixel(16),
    },
    section: {
        marginBottom: heightPixel(24),
        paddingBottom: heightPixel(16),
        borderBottomWidth: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
        marginBottom: heightPixel(12),
    },
    sectionTitle: {
        fontSize: fontPixel(16),
    },
    sectionContent: {
        fontSize: fontPixel(16),
        marginBottom: heightPixel(4),
    },
    estimationContainer: {
        marginBottom: heightPixel(8),
    },
    estimationNote: {
        fontSize: fontPixel(14),
        fontStyle: 'italic',
        marginTop: heightPixel(8),
    },
    footer: {
        paddingVertical: heightPixel(16),
    },
    mediaContainer: {
        paddingHorizontal: 0,
    },
});