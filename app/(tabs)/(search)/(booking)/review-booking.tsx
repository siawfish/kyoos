import { StyleSheet, View, ScrollView, Text } from "react-native";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import { colors } from "@/constants/theme/colors";
import { heightPixel, widthPixel, fontPixel } from "@/constants/normalize";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAppTheme } from "@/hooks/use-app-theme";
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

    const theme = useAppTheme();
    const isDark = theme === 'dark';

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

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

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
            <View style={styles.headerContainer}>
                <BackButton
                    iconName="arrow-left"
                    onPress={() => router.back()}
                />
            </View>

            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                    <Text style={[styles.label, { color: labelColor }]}>REVIEW BOOKING</Text>
                </View>

                {/* Description Section */}
                {description && (
                    <View style={styles.section}>
                        <View style={styles.sectionLabelContainer}>
                            <Text style={[styles.sectionLabel, { color: labelColor }]}>DESCRIPTION</Text>
                        </View>
                        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                            <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
                            <View style={styles.cardContent}>
                                <ThemedText 
                                    style={[styles.sectionContent, { color: textColor }]}
                                    darkColor={colors.dark.text}
                                    lightColor={colors.light.text}
                                >
                                    {description}
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                )}

                {/* Media Section */}
                {media && media.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionLabelContainer}>
                            <Text style={[styles.sectionLabel, { color: labelColor }]}>MEDIA</Text>
                        </View>
                        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                            <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
                            <View style={styles.cardContent}>
                                <MediaPreviews 
                                    media={media}
                                    backgroundColor={backgroundColor}
                                    tintColor={tintColor}
                                    containerStyle={styles.mediaContainer}
                                />
                            </View>
                        </View>
                    </View>
                )}

                {/* Time Estimation */}
                <View style={styles.section}>
                    <View style={styles.sectionLabelContainer}>
                        <Text style={[styles.sectionLabel, { color: labelColor }]}>TIME ESTIMATION</Text>
                    </View>
                    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                        <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
                        <View style={styles.cardContent}>
                            <ThemedText 
                                style={[styles.sectionContent, { color: textColor }]}
                                darkColor={colors.dark.text}
                                lightColor={colors.light.text}
                            >
                                Estimated Duration: {summary?.estimatedDuration || 'Not specified'}
                            </ThemedText>
                            <ThemedText 
                                style={[styles.estimationNote, { color: labelColor }]}
                                darkColor={colors.dark.secondary}
                                lightColor={colors.light.secondary}
                            >
                                Note: Duration may vary based on complexity and unforeseen issues
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Date & Time */}
                {formattedDateTime && (
                    <View style={styles.section}>
                        <View style={styles.sectionLabelContainer}>
                            <Text style={[styles.sectionLabel, { color: labelColor }]}>DATE & TIME</Text>
                        </View>
                        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                            <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
                            <View style={styles.cardContent}>
                                <ThemedText 
                                    style={[styles.sectionContent, { color: textColor }]}
                                    darkColor={colors.dark.text}
                                    lightColor={colors.light.text}
                                >
                                    {formattedDateTime.date}
                                </ThemedText>
                                <ThemedText 
                                    style={[styles.sectionContent, { color: textColor }]}
                                    darkColor={colors.dark.text}
                                    lightColor={colors.light.text}
                                >
                                    {formattedDateTime.time}
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                )}

                {/* Service Location */}
                <View style={styles.section}>
                    <View style={styles.sectionLabelContainer}>
                        <Text style={[styles.sectionLabel, { color: labelColor }]}>SERVICE LOCATION</Text>
                    </View>
                    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                        <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
                        <View style={styles.cardContent}>
                            <ThemedText 
                                style={[styles.sectionContent, { color: textColor }]}
                                darkColor={colors.dark.text}
                                lightColor={colors.light.text}
                            >
                                {serviceLocationType === ServiceLocationType.SHOP ? 'At Artisan\'s Shop' : 'At Your Location'}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                {/* Required Skills */}
                {summary?.requiredSkills && summary.requiredSkills.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionLabelContainer}>
                            <Text style={[styles.sectionLabel, { color: labelColor }]}>REQUIRED SKILLS</Text>
                        </View>
                        <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                            <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
                            <View style={styles.cardContent}>
                                {summary.requiredSkills.map((skill, index) => (
                                    <ThemedText 
                                        key={index} 
                                        style={[styles.sectionContent, { color: textColor }]}
                                        darkColor={colors.dark.text}
                                        lightColor={colors.light.text}
                                    >
                                        • {skill}
                                    </ThemedText>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* Price Estimation */}
                <View style={styles.section}>
                    <View style={styles.sectionLabelContainer}>
                        <Text style={[styles.sectionLabel, { color: labelColor }]}>PRICE ESTIMATION</Text>
                    </View>
                    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                        <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
                        <View style={styles.cardContent}>
                            <ThemedText 
                                style={[styles.sectionContent, { color: textColor }]}
                                darkColor={colors.dark.text}
                                lightColor={colors.light.text}
                            >
                                Estimated Cost: {summary?.estimatedPrice || 'To be discussed'}
                            </ThemedText>
                            <ThemedText 
                                style={[styles.estimationNote, { color: labelColor }]}
                                darkColor={colors.dark.secondary}
                                lightColor={colors.light.secondary}
                            >
                                Note: Final price may vary based on actual work required
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button 
                    label="CONFIRM BOOKING"
                    onPress={handleConfirmBooking}
                    isLoading={isLoading}
                />
            </View>

            {isSuccess && (
                <>
                    <BlurView
                        intensity={60}
                        tint={isDark ? 'dark' : 'light'}
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
    headerContainer: {
        paddingHorizontal: widthPixel(16),
        paddingBottom: heightPixel(16),
    },
    header: {
        // paddingHorizontal: widthPixel(16),
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
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: widthPixel(16),
        paddingBottom: heightPixel(100),
    },
    section: {
        marginBottom: heightPixel(24),
    },
    sectionLabelContainer: {
        marginBottom: heightPixel(12),
    },
    sectionLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
    },
    card: {
        borderWidth: 0.5,
        borderTopWidth: 0,
        overflow: 'hidden',
    },
    topAccent: {
        height: heightPixel(3),
        width: '100%',
    },
    cardContent: {
        padding: widthPixel(16),
        gap: heightPixel(8),
    },
    sectionContent: {
        fontSize: fontPixel(15),
        fontFamily: 'Regular',
        lineHeight: fontPixel(22),
    },
    estimationNote: {
        fontSize: fontPixel(13),
        fontFamily: 'Regular',
        fontStyle: 'italic',
        marginTop: heightPixel(4),
    },
    footer: {
        paddingVertical: heightPixel(16),
    },
    mediaContainer: {
        paddingHorizontal: 0,
    },
});
