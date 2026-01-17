import BackButton from "@/components/ui/BackButton";
import Button from "@/components/ui/Button";
import MediaPreviews from "@/components/ui/MediaPreviews";
import SuccessOverlay from "@/components/ui/SuccessOverlay";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { convertFromMillisecondsToHours, formatDate } from "@/constants/helpers";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { selectUser } from "@/redux/app/selector";
import {
    selectArtisan,
    selectBookingId,
    selectDescription,
    selectIsLoading,
    selectIsSuccess,
    selectMedia,
    selectServiceDate,
    selectServiceLocation,
    selectServiceLocationType,
    selectServiceTime,
    selectSummary
} from "@/redux/booking/selector";
import { actions } from "@/redux/booking/slice";
import { ServiceLocationType } from "@/redux/booking/types";
import { actions as searchActions } from "@/redux/search/slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { RelativePathString, useLocalSearchParams, useRouter } from "expo-router";
import numeral from "numeral";
import { useMemo } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ReviewBooking() {
    const router = useRouter();
    const { callbackRoute } = useLocalSearchParams<{ callbackRoute?: RelativePathString }>();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const summary = useAppSelector(selectSummary);
    const appointmentTime = useAppSelector(selectServiceTime);
    const appointmentDate = useAppSelector(selectServiceDate);
    const serviceLocationType = useAppSelector(selectServiceLocationType);
    const description = useAppSelector(selectDescription);
    const media = useAppSelector(selectMedia);
    const isLoading = useAppSelector(selectIsLoading);
    const isSuccess = useAppSelector(selectIsSuccess);
    const artisan = useAppSelector(selectArtisan);
    const serviceLocation = useAppSelector(selectServiceLocation);
    const workerSkills = artisan?.skills;
    const requiredSkills = summary?.requiredSkills;
    const service = useMemo(()=>{
        return workerSkills?.find(skill => skill.id === requiredSkills[0]?.id);
    },[workerSkills, requiredSkills]);
    const rate = service?.rate;
    const estimatedPrice = useMemo(()=>{
        return rate ? rate * convertFromMillisecondsToHours(summary?.estimatedDuration) : 0;
    },[rate, summary?.estimatedDuration]);
    const bookingId = useAppSelector(selectBookingId);

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

    const borderColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint
    }, 'background');

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    const backgroundColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.white
    }, 'white');

    const miscBg = useThemeColor({
        light: colors.light.misc,
        dark: colors.dark.misc
    }, 'background');

    const handleConfirmBooking = () => {
        dispatch(actions.onConfirmBooking());
    };

    const handleSuccessClose = () => {
        if(!bookingId) return;
        if(callbackRoute) {
            router.dismissTo(callbackRoute);
        } else {
            router.dismissAll();
            router.push(`/(tabs)/(bookings)/${bookingId}`);
        }
        dispatch(actions.resetState());
        dispatch(searchActions.resetState());
    };

    const formattedDateTime = (() => {
        if (appointmentDate?.value && appointmentTime?.value) {
            const date = new Date(appointmentDate.value);
            return {
                date: formatDate(date),
                time: appointmentTime.value
            };
        }
        return null;
    })();

    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <Feather key={i} name="star" size={fontPixel(12)} color={textColor} style={{ marginRight: 2 }} />
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <Feather key={i} name="star" size={fontPixel(12)} color={labelColor} style={{ marginRight: 2 }} />
                );
            } else {
                stars.push(
                    <Feather key={i} name="star" size={fontPixel(12)} color={borderColor} style={{ marginRight: 2 }} />
                );
            }
        }
        return stars;
    };

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
                    <Text style={[styles.pageTitle, { color: labelColor }]}>REVIEW BOOKING</Text>
                </View>

                {/* Worker Details Section */}
                {artisan && (
                    <View style={styles.section}>
                        <View style={[styles.workerCard, { borderColor }]}>
                            <View style={styles.workerContent}>
                                <View style={styles.workerHeader}>
                                    <Image 
                                        source={{ uri: artisan.avatar }} 
                                        style={[styles.workerAvatar, { backgroundColor: miscBg }]}
                                    />
                                    <View style={styles.workerInfo}>
                                        <ThemedText 
                                            style={styles.workerName}
                                            darkColor={colors.dark.text}
                                            lightColor={colors.light.text}
                                        >
                                            {artisan.name}
                                        </ThemedText>
                                        <View style={styles.ratingContainer}>
                                            {renderStars(artisan.rating || 0)}
                                            <Text style={[styles.ratingText, { color: labelColor }]}>
                                                {artisan.rating?.toFixed(1) || '0.0'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {service && (
                                    <View style={[styles.skillTag, { backgroundColor: miscBg }]}>
                                        {service.icon && (
                                            <View style={[styles.skillIconContainer, { backgroundColor: backgroundColor }]}>
                                                <Image 
                                                    source={{ uri: service.icon }} 
                                                    style={styles.skillIcon}
                                                    resizeMode="contain"
                                                />
                                            </View>
                                        )}
                                        <Text style={[styles.skillText, { color: textColor }]}>
                                            {service.name}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            
                            <View style={[styles.divider, { backgroundColor: borderColor }]} />
                            
                            <View style={styles.workerDetails}>
                                {artisan.location?.address && (
                                    <View style={styles.detailRow}>
                                        <Feather name="map-pin" size={fontPixel(14)} color={labelColor} />
                                        <Text style={[styles.detailText, { color: textColor }]} numberOfLines={1}>
                                            {artisan.location.address}
                                        </Text>
                                    </View>
                                )}
                                {/* {artisan.phoneNumber && (
                                    <View style={styles.detailRow}>
                                        <Feather name="phone" size={fontPixel(14)} color={labelColor} />
                                        <Text style={[styles.detailText, { color: textColor }]}>
                                            {artisan.phoneNumber}
                                        </Text>
                                    </View>
                                )} */}
                            </View>
                        </View>
                    </View>
                )}

                {/* Booking Details */}
                <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: labelColor }]}>BOOKING DETAILS</Text>
                    
                    <View style={[styles.detailsCard, { borderColor }]}>
                        {/* Date & Time */}
                        {formattedDateTime && (
                            <View style={styles.detailItem}>
                                <View style={styles.detailIcon}>
                                    <Feather name="calendar" size={fontPixel(16)} color={accentColor} />
                                </View>
                                <View style={styles.detailContent}>
                                    <Text style={[styles.detailLabel, { color: labelColor }]}>DATE & TIME</Text>
                                    <Text style={[styles.detailValue, { color: textColor }]}>
                                        {formattedDateTime.date} • {formattedDateTime.time}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View style={[styles.itemDivider, { backgroundColor: borderColor }]} />

                        {/* Service Location */}
                        <View style={styles.detailItem}>
                            <View style={styles.detailIcon}>
                                <Feather name="map-pin" size={fontPixel(16)} color={accentColor} />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={[styles.detailLabel, { color: labelColor }]}>SERVICE LOCATION</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>
                                    {serviceLocationType === ServiceLocationType.SHOP 
                                        ? "At Worker's Shop" 
                                        : serviceLocation?.address || "At Your Location"}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.itemDivider, { backgroundColor: borderColor }]} />

                        {/* Duration */}
                        <View style={styles.detailItem}>
                            <View style={styles.detailIcon}>
                                <Feather name="clock" size={fontPixel(16)} color={accentColor} />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={[styles.detailLabel, { color: labelColor }]}>ESTIMATED DURATION</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>
                                    {summary?.estimatedDuration ? convertFromMillisecondsToHours(summary?.estimatedDuration) + ' hours' : 'Not specified'}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.itemDivider, { backgroundColor: borderColor }]} />

                        {/* Price */}
                        <View style={styles.detailItem}>
                            <View style={styles.detailIcon}>
                                <Feather name="credit-card" size={fontPixel(16)} color={accentColor} />
                            </View>
                            <View style={styles.detailContent}>
                                <Text style={[styles.detailLabel, { color: labelColor }]}>ESTIMATED PRICE</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>
                                    {estimatedPrice ? `${user?.settings?.currency} ${numeral(estimatedPrice).format('0,0.00')}` : 'To be discussed'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Description Section */}
                {description && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: labelColor }]}>DESCRIPTION</Text>
                        <View style={[styles.contentCard, { borderColor }]}>
                            <ThemedText 
                                style={styles.descriptionText}
                                darkColor={colors.dark.text}
                                lightColor={colors.light.text}
                            >
                                {description}
                            </ThemedText>
                        </View>
                    </View>
                )}

                {/* Media Section */}
                {media && media.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: labelColor }]}>ATTACHMENTS</Text>
                        <View style={[styles.contentCard, { borderColor }]}>
                            <MediaPreviews 
                                media={media}
                                backgroundColor={backgroundColor}
                                tintColor={tintColor}
                                containerStyle={styles.mediaContainer}
                            />
                        </View>
                    </View>
                )}

                {/* Required Skills */}
                {summary?.requiredSkills && summary.requiredSkills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: labelColor }]}>REQUIRED SKILLS</Text>
                        <View style={[styles.contentCard, { borderColor }]}>
                            <View style={styles.skillsList}>
                                {summary.requiredSkills.map((skill, index) => (
                                    <View key={index} style={[styles.skillTag, { backgroundColor: miscBg }]}>
                                        {skill.icon && (
                                            <View style={[styles.skillIconContainer, { backgroundColor: backgroundColor }]}>
                                                <Image 
                                                    source={{ uri: skill.icon }} 
                                                    style={styles.skillIcon}
                                                    resizeMode="contain"
                                                />
                                            </View>
                                        )}
                                        <Text style={[styles.skillText, { color: textColor }]}>
                                            {skill.name}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}

                {/* Note */}
                <View style={styles.section}>
                    <View style={[styles.noteCard, { backgroundColor: miscBg }]}>
                        <Feather name="info" size={fontPixel(14)} color={labelColor} />
                        <Text style={[styles.noteText, { color: labelColor }]}>
                            Final price and duration may vary based on actual work required
                        </Text>
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
        paddingBottom: heightPixel(8),
    },
    header: {
        marginBottom: heightPixel(24),
    },
    accentBar: {
        width: widthPixel(40),
        height: heightPixel(3),
        marginBottom: heightPixel(16),
    },
    Title: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 2,
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
    pageTitle: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
        marginBottom: heightPixel(12),
    },
    sectionLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
        marginBottom: heightPixel(12),
    },
    
    // Worker Card Styles
    workerCard: {
        borderWidth: 0.5,
        padding: widthPixel(16),
    },
    workerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    workerAvatar: {
        width: widthPixel(56),
        height: widthPixel(56),
    },
    workerInfo: {
        marginLeft: widthPixel(16),
    },
    workerName: {
        fontSize: fontPixel(18),
        fontFamily: 'SemiBold',
        marginBottom: heightPixel(4),
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: fontPixel(12),
        fontFamily: 'Medium',
        marginLeft: widthPixel(6),
    },
    workerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    divider: {
        height: 0.5,
        marginVertical: heightPixel(16),
    },
    workerDetails: {
        gap: heightPixel(10),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(10),
    },
    detailText: {
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
        flex: 1,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: widthPixel(8),
    },
    skillTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(6),
        paddingHorizontal: widthPixel(12),
        paddingVertical: heightPixel(6),
    },
    skillIconContainer: {
        width: widthPixel(16),
        height: widthPixel(16),
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    skillIcon: {
        width: widthPixel(16),
        height: widthPixel(16),
    },
    skillText: {
        fontSize: fontPixel(12),
        fontFamily: 'Medium',
    },
    skillsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: widthPixel(8),
    },

    // Details Card Styles
    detailsCard: {
        borderWidth: 0.5,
    },
    detailItem: {
        flexDirection: 'row',
        padding: widthPixel(16),
    },
    detailIcon: {
        width: widthPixel(32),
        alignItems: 'center',
        paddingTop: heightPixel(2),
    },
    detailContent: {
        flex: 1,
    },
    detailLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1,
        marginBottom: heightPixel(4),
    },
    detailValue: {
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
        lineHeight: fontPixel(20),
    },
    itemDivider: {
        height: 0.5,
        marginHorizontal: widthPixel(16),
    },

    // Content Card Styles
    contentCard: {
        borderWidth: 0.5,
        padding: widthPixel(16),
    },
    descriptionText: {
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
        lineHeight: fontPixel(22),
    },
    mediaContainer: {
        paddingHorizontal: 0,
    },

    // Note Card Styles
    noteCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: widthPixel(14),
        gap: widthPixel(10),
    },
    noteText: {
        fontSize: fontPixel(12),
        fontFamily: 'Regular',
        flex: 1,
        lineHeight: fontPixel(18),
    },

    // Footer Styles
    footer: {
        paddingVertical: heightPixel(16),
    },
});
