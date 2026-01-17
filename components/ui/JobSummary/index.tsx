import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { convertFromMillisecondsToHours } from "@/constants/helpers";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { selectUser } from "@/redux/app/selector";
import { selectBookingId } from "@/redux/booking/selector";
import { Summary, Worker } from "@/redux/search/types";
import { useAppSelector } from "@/store/hooks";
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import numeral from "numeral";
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

interface JobSummaryProps {
    artisan: Worker;
    summary: Summary;
    containerStyle?: ViewStyle;
}

export default function JobSummary({ artisan, summary, containerStyle }: JobSummaryProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const chevronRotation = useRef(new Animated.Value(0)).current;
    const user = useAppSelector(selectUser);
    const workerSkills = artisan?.skills;
    const bookingId = useAppSelector(selectBookingId);
    const rate = useMemo(()=>{
        const skill = workerSkills?.find(skill => skill.id === summary?.requiredSkills[0]?.id)
        return skill?.rate;
    },[workerSkills, summary?.requiredSkills])
    const estimatedPrice = useMemo(()=>{
        return rate ? rate * convertFromMillisecondsToHours(summary?.estimatedDuration) : 0;
    },[rate, summary?.estimatedDuration])
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const accentColor = isDark ? colors.dark.white : colors.light.black;

    const backgroundColor = useThemeColor({
        light: colors.light.background + '95',
        dark: colors.dark.background + '95',
    }, 'background');

    const blurTint = useThemeColor({
        light: 'light',
        dark: 'dark',
    }, 'background');

    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');

    const secondaryColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary,
    }, 'secondary');

    const borderColor = useThemeColor({
        light: colors.light.grey,
        dark: colors.dark.grey,
    }, 'grey');

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    const miscColor = useThemeColor({
        light: colors.light.misc,
        dark: colors.dark.misc,
    }, 'misc');

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        Animated.parallel([
            Animated.timing(animatedHeight, {
                toValue: isExpanded ? 1 : 0,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.timing(chevronRotation, {
                toValue: isExpanded ? 1 : 0,
                duration: 300,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            })
        ]).start();
    }, [isExpanded, animatedHeight, chevronRotation]);

    const evaluatedEstimatedPrice = useMemo(()=>{
        if (bookingId) {
            return numeral(Number(summary?.estimatedPrice)).format('0,0.00');
        }
        if (typeof estimatedPrice === 'number') {
            return numeral(estimatedPrice).format('0,0.00');
        }
        if (typeof estimatedPrice === 'string') {
            return numeral(Number(estimatedPrice)).format('0,0.00');
        }
        return '';
    },[estimatedPrice, summary?.estimatedPrice, bookingId])

    return (
        <BlurView 
            intensity={80} 
            tint={blurTint as 'light' | 'dark'} 
            style={[styles.summaryContainer, { backgroundColor, borderColor }, containerStyle]}
        >
            <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
            <View style={styles.contentWrapper}>
                <TouchableOpacity 
                    style={styles.summaryHeader} 
                    onPress={toggleExpanded}
                    activeOpacity={0.7}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.headerLeft}>
                            <ThemedText style={[styles.headerLabel, { color: secondaryColor }]}>
                                JOB SUMMARY
                            </ThemedText>
                            <ThemedText style={[styles.summaryTitle, { color: textColor }]}>
                                Service Details
                            </ThemedText>
                        </View>
                        <Animated.View style={{
                            transform: [{
                                rotate: chevronRotation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0deg', '180deg']
                                })
                            }]
                        }}>
                            <Feather 
                                name="chevron-down" 
                                size={20} 
                                color={tintColor} 
                            />
                        </Animated.View>
                    </View>
                </TouchableOpacity>

            <Animated.View style={{
                maxHeight: animatedHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 300]
                }),
                overflow: 'hidden'
            }}>
                <View style={styles.summaryContent}>
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryLabelContainer}>
                            <Feather name="clock" size={16} color={secondaryColor} />
                            <ThemedText 
                                style={[styles.summaryLabel, { color: secondaryColor }]}
                            >
                                ESTIMATED DURATION
                            </ThemedText>
                        </View>
                        <ThemedText 
                            style={[styles.summaryValue, { color: textColor }, !summary?.estimatedDuration && styles.emptyValue]} 
                        >
                            {`${convertFromMillisecondsToHours(summary?.estimatedDuration)} hours` || 'Not specified'}
                        </ThemedText>
                    </View>
                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryLabelContainer}>
                            <Feather name="tool" size={16} color={secondaryColor} />
                            <ThemedText 
                                style={[styles.summaryLabel, { color: secondaryColor }]}
                            >
                                REQUIRED SKILLS
                            </ThemedText>
                        </View>
                        <View style={styles.skillsList}>
                            {summary?.requiredSkills?.length > 0 ? (
                                summary?.requiredSkills?.map((skill, index) => (
                                    <View key={index} style={[styles.skillTag, { borderColor, backgroundColor: miscColor }]}>
                                        <ThemedText style={[styles.skillText, { color: textColor }]}>{skill.name}</ThemedText>
                                    </View>
                                ))
                            ) : (
                                <ThemedText 
                                    style={[styles.summaryValue, styles.emptyValue, { color: secondaryColor }]}
                                >
                                    No specific skills required
                                </ThemedText>
                            )}
                        </View>
                    </View>
                    <View style={[styles.divider, { backgroundColor: borderColor }]} />

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryLabelContainer}>
                            <Feather name="package" size={16} color={secondaryColor} />
                            <ThemedText 
                                style={[styles.summaryLabel, { color: secondaryColor }]}
                            >
                                TOOLS REQUIRED
                            </ThemedText>
                        </View>
                        <ThemedText 
                            style={[styles.summaryValue, styles.toolsValue, { color: textColor }, !summary?.estimatedDuration && styles.emptyValue]} 
                        >
                            {summary?.requiredTools?.join(', ')}
                        </ThemedText>
                    </View>
                </View>
            </Animated.View>

            <View style={[styles.divider, { backgroundColor: borderColor }]} />
            
            <View style={[styles.summaryRow, styles.priceRow]}>
                <View style={styles.summaryLabelContainer}>
                    <ThemedText 
                        style={[styles.summaryLabel, styles.priceLabel, { color: tintColor }]}
                    >
                        ESTIMATED PRICE
                    </ThemedText>
                </View>
                <ThemedText 
                    style={[styles.priceValue, { color: summary?.estimatedPrice ? tintColor : secondaryColor }, !summary?.estimatedPrice && styles.emptyValue]}
                >
                    {artisan?.id ? `${user?.settings?.currency} ${evaluatedEstimatedPrice}` : evaluatedEstimatedPrice ? `${user?.settings?.currency} ${evaluatedEstimatedPrice}` : 'To be discussed'}
                </ThemedText>
            </View>
            </View>
        </BlurView>
    );
}

const styles = StyleSheet.create({
    summaryContainer: {
        flexDirection: 'row',
        borderWidth: 0.5,
        borderLeftWidth: 0,
        overflow: 'hidden',
        marginHorizontal: widthPixel(16),
        marginBottom: heightPixel(24),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
    },
    accentBar: {
        width: widthPixel(4),
    },
    contentWrapper: {
        flex: 1,
        padding: widthPixel(16),
    },
    summaryHeader: {
        marginBottom: heightPixel(0),
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: heightPixel(16),
    },
    headerLeft: {
        flex: 1,
    },
    headerLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
        marginBottom: heightPixel(4),
    },
    summaryTitle: {
        fontSize: fontPixel(20),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
    },
    divider: {
        height: 0.5,
    },
    summaryContent: {
        gap: heightPixel(16),
        paddingVertical: heightPixel(16),
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    summaryLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
        minWidth: widthPixel(140),
    },
    summaryLabel: {
        fontSize: fontPixel(11),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
    },
    summaryValue: {
        flex: 1,
        textAlign: 'right',
        fontSize: fontPixel(14),
        fontFamily: 'Medium',
    },
    skillsList: {
        flex: 1,
        alignItems: 'flex-end',
        gap: heightPixel(8),
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
    },
    skillTag: {
        paddingHorizontal: widthPixel(10),
        paddingVertical: heightPixel(6),
        borderWidth: 0.5,
    },
    skillText: {
        fontSize: fontPixel(11),
        fontFamily: 'Medium',
    },
    priceRow: {
        marginTop: heightPixel(8),
    },
    priceLabel: {
        fontSize: fontPixel(16),
    },
    priceValue: {
        fontSize: fontPixel(16),
    },
    emptyValue: {
        fontStyle: 'italic',
        opacity: 0.7,
    },
    toolsValue: {
        textTransform: 'capitalize',
    },
}); 