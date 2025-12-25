import { StyleSheet, View, ViewStyle, TouchableOpacity, Animated, Easing } from "react-native";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { ThemedView } from "@/components/ui/Themed/ThemedView";
import { colors } from "@/constants/theme/colors";
import { heightPixel, widthPixel, fontPixel } from "@/constants/normalize";
import { Feather } from '@expo/vector-icons';
import { useThemeColor } from "@/hooks/use-theme-color";
import { Summary } from "@/redux/search/types";
import { convertFromMillisecondsToHours } from "@/constants/helpers";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/redux/app/selector";
import { useState, useRef, useEffect } from "react";

interface JobSummaryProps {
    summary: Summary;
    containerStyle?: ViewStyle;
}

export default function JobSummary({ summary, containerStyle }: JobSummaryProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const animatedHeight = useRef(new Animated.Value(0)).current;
    const chevronRotation = useRef(new Animated.Value(0)).current;
    const user = useAppSelector(selectUser);
    const backgroundColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black
    }, 'white');

    const secondaryColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary,
    }, 'secondary');

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

    return (
        <ThemedView 
            style={[
                styles.summaryContainer, 
                { backgroundColor },
                containerStyle
            ]}
        >
            <TouchableOpacity 
                style={styles.summaryHeader} 
                onPress={toggleExpanded}
                activeOpacity={0.7}
            >
                <View style={styles.headerContent}>
                    <ThemedText type="subtitle" style={styles.summaryTitle}>Job Summary</ThemedText>
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
                            color={colors.light.secondary} 
                        />
                    </Animated.View>
                </View>
                <View style={styles.divider} />
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
                            <Feather name="clock" size={16} color={colors.light.secondary} />
                            <ThemedText 
                                type="defaultSemiBold" 
                                lightColor={colors.light.secondary}
                                style={styles.summaryLabel}
                            >
                                Estimated Duration
                            </ThemedText>
                        </View>
                        <ThemedText 
                            style={[styles.summaryValue, !summary?.estimatedDuration && styles.emptyValue]} 
                            lightColor={!summary?.estimatedDuration ? secondaryColor : undefined}
                        >
                            {`${convertFromMillisecondsToHours(summary?.estimatedDuration)} hours` || 'Not specified'}
                        </ThemedText>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryLabelContainer}>
                            <Feather name="tool" size={16} color={colors.light.secondary} />
                            <ThemedText 
                                type="defaultSemiBold" 
                                lightColor={colors.light.secondary}
                                style={styles.summaryLabel}
                            >
                                Required Skills
                            </ThemedText>
                        </View>
                        <View style={styles.skillsList}>
                            {summary?.requiredSkills?.length > 0 ? (
                                summary.requiredSkills.map((skill, index) => (
                                    <View key={index} style={styles.skillTag}>
                                        <ThemedText style={styles.skillText}>{skill.name}</ThemedText>
                                    </View>
                                ))
                            ) : (
                                <ThemedText 
                                    style={[styles.summaryValue, styles.emptyValue]}
                                    lightColor={secondaryColor}
                                >
                                    No specific skills required
                                </ThemedText>
                            )}
                        </View>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <View style={styles.summaryLabelContainer}>
                            <Feather name="package" size={16} color={colors.light.secondary} />
                            <ThemedText 
                                type="defaultSemiBold" 
                                lightColor={colors.light.secondary}
                                style={styles.summaryLabel}
                            >
                                Tools Required
                            </ThemedText>
                        </View>
                        <ThemedText 
                            style={[styles.summaryValue, styles.toolsValue, !summary?.estimatedDuration && styles.emptyValue]} 
                            lightColor={!summary?.estimatedDuration ? secondaryColor : undefined}
                        >
                            {summary.requiredTools.join(', ')}
                        </ThemedText>
                    </View>
                </View>
            </Animated.View>

            <View style={styles.divider} />
            
            <View style={[styles.summaryRow, styles.priceRow]}>
                <View style={styles.summaryLabelContainer}>
                    <ThemedText 
                        type="defaultSemiBold" 
                        lightColor={colors.light.tint}
                        style={[styles.summaryLabel, styles.priceLabel]}
                    >
                        Estimated Price
                    </ThemedText>
                </View>
                <ThemedText 
                    type="defaultSemiBold" 
                    lightColor={summary?.estimatedPrice ? colors.light.tint : secondaryColor}
                    style={[styles.priceValue, !summary?.estimatedPrice && styles.emptyValue]}
                >
                    {summary?.estimatedPrice ? `${user?.settings?.currency} ${summary?.estimatedPrice}` : 'To be discussed'}
                </ThemedText>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    summaryContainer: {
        padding: widthPixel(16),
        borderRadius: widthPixel(12),
        marginHorizontal: widthPixel(16),
        marginBottom: heightPixel(24),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    summaryHeader: {
        marginBottom: heightPixel(0),
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: heightPixel(8),
    },
    summaryTitle: {
        fontSize: fontPixel(20),
    },
    divider: {
        height: 1,
        backgroundColor: colors.light.secondary + '20',
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
        fontSize: fontPixel(14),
    },
    summaryValue: {
        flex: 1,
        textAlign: 'right',
        fontSize: fontPixel(14),
    },
    skillsList: {
        flex: 1,
        alignItems: 'flex-end',
        gap: heightPixel(8),
    },
    skillTag: {
        backgroundColor: colors.light.tint + '20',
        paddingHorizontal: widthPixel(8),
        paddingVertical: heightPixel(4),
        borderRadius: widthPixel(16),
    },
    skillText: {
        color: colors.light.tint,
        fontSize: fontPixel(12),
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