import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { calculateWorkerAverageRate, calculateWorkerCost, calculateWorkerHourlyRate, formatPrice } from "@/constants/helpers";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { selectUser } from "@/redux/app/selector";
import { Worker } from "@/redux/search/types";
import { useAppSelector } from "@/store/hooks";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useMemo } from "react";
import { Image, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

interface ArtisanCardProps {
    artisan: Worker;
    containerStyle?: StyleProp<ViewStyle>;
    estimatedDuration?: number;
    onPress?: (id: string) => void;
}

const ArtisanCard = ({ artisan, containerStyle, estimatedDuration, onPress }: ArtisanCardProps) => {
    const user = useAppSelector(selectUser);
    const currency = user?.settings?.currency || 'GHS';
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const accentColor = isDark ? colors.dark.white : colors.light.black;

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

    const handleCardPress = () => {
        onPress?.(artisan.id);
    };

    const workerCost = useMemo(() => calculateWorkerCost(artisan, estimatedDuration || 0), [artisan, estimatedDuration]);
    const hourlyRate = useMemo(() => calculateWorkerHourlyRate(artisan), [artisan]);
    const averageRate = useMemo(() => calculateWorkerAverageRate(artisan), [artisan]);
    
    const displayPrice = workerCost > 0 ? workerCost : (hourlyRate || averageRate);
    const priceSuffix = workerCost > 0 ? '' : '/hr';

    return (
        <TouchableOpacity 
            style={[styles.artisanCard, containerStyle]}
            onPress={handleCardPress}
            activeOpacity={0.8}
        >
            <BlurView 
                intensity={80} 
                tint={blurTint as 'light' | 'dark'} 
                style={[styles.cardContainer, { backgroundColor, borderColor }]}
            >
                <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                <View style={styles.cardContent}>
                    {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                            <View style={[styles.avatar, { backgroundColor: miscColor, borderColor }]}>
                        {artisan.avatar ? (
                            <Image source={{ uri: artisan.avatar }} style={styles.avatarImage} />
                        ) : (
                                    <ThemedText style={[styles.avatarText, { color: textColor }]}>
                                {artisan.name.charAt(0).toUpperCase()}
                            </ThemedText>
                        )}
                    </View>
                    <View style={styles.verifiedBadge}>
                        <Image source={require('@/assets/images/verified.png')} style={styles.verifiedImage} />
                    </View>
                </View>
                
                <View style={styles.priceContainer}>
                            <ThemedText style={[styles.priceLabel, { color: secondaryColor }]}>
                                STARTING FROM
                            </ThemedText>
                            <View style={styles.priceRow}>
                                <ThemedText style={[styles.currency, { color: textColor }]}>
                                    {currency}
                                </ThemedText>
                                <ThemedText style={[styles.price, { color: textColor }]}>
                                    {formatPrice(displayPrice)}
                                </ThemedText>
                                {priceSuffix && (
                                    <ThemedText style={[styles.priceSuffix, { color: secondaryColor }]}>
                                        {priceSuffix}
                                    </ThemedText>
                                )}
                            </View>
                </View>
            </View>

                    {/* Content Section */}
            <View style={styles.content}>
                <View style={styles.nameRow}>
                            <ThemedText style={[styles.businessName, { color: textColor }]}>
                        {artisan.name}
                    </ThemedText>
                </View>
                
                <View style={styles.ratingContainer}>
                            <Feather name="star" size={14} color={tintColor} />
                            <ThemedText style={[styles.rating, { color: textColor }]}>
                                {artisan.rating}
                            </ThemedText>
                            <ThemedText style={[styles.reviewCount, { color: secondaryColor }]}>
                                (723 reviews)
                            </ThemedText>
                </View>

                <View style={styles.locationContainer}>
                            <Feather name="map-pin" size={12} color={secondaryColor} />
                            <ThemedText style={[styles.location, { color: secondaryColor }]} numberOfLines={1}>
                        {artisan.location?.address}
                    </ThemedText>
                </View>

                <View style={styles.skillsContainer}>
                    {artisan.skills.slice(0, 2).map((skill) => (
                                <View key={skill?.id} style={[styles.skillTag, { borderColor, backgroundColor: miscColor }]}>
                                    <ThemedText style={[styles.skillText, { color: textColor }]}>
                                        {skill?.name}
                                    </ThemedText>
                        </View>
                    ))}
                    {artisan.skills.length > 2 && (
                        <View style={styles.moreSkills}>
                                    <ThemedText style={[styles.moreSkillsText, { color: secondaryColor }]}>
                                +{artisan.skills.length - 2} more
                            </ThemedText>
                        </View>
                    )}
                </View>
            </View>
                </View>
            </BlurView>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    artisanCard: {
        width: '100%',
        minWidth: widthPixel(300),
    },
    cardContainer: {
        flexDirection: 'row',
        borderWidth: 0.5,
        borderLeftWidth: 0,
        overflow: 'hidden',
        shadowColor: '#000',
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
    cardContent: {
        flex: 1,
        padding: widthPixel(16),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: heightPixel(16),
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: widthPixel(56),
        height: widthPixel(56),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
    },
    avatarImage: {
        width: widthPixel(56),
        height: widthPixel(56),
    },
    avatarText: {
        fontSize: fontPixel(20),
        fontFamily: 'Bold',
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -widthPixel(2),
        right: -widthPixel(2),
        width: widthPixel(20),
        height: widthPixel(20),
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedImage: {
        width: widthPixel(16),
        height: widthPixel(16),
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    priceLabel: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
        marginBottom: heightPixel(4),
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: widthPixel(4),
    },
    currency: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 0.5,
    },
    price: {
        fontSize: fontPixel(18),
        fontFamily: 'Bold',
        letterSpacing: -0.3,
    },
    priceSuffix: {
        fontSize: fontPixel(12),
        fontFamily: 'Regular',
    },
    content: {
        flex: 1,
    },
    nameRow: {
        marginBottom: heightPixel(8),
    },
    businessName: {
        fontSize: fontPixel(18),
        fontFamily: 'Bold',
        letterSpacing: -0.3,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: heightPixel(8),
        gap: widthPixel(4),
    },
    rating: {
        fontSize: fontPixel(14),
        fontFamily: 'SemiBold',
    },
    reviewCount: {
        fontSize: fontPixel(12),
        fontFamily: 'Regular',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: heightPixel(12),
        gap: widthPixel(4),
    },
    location: {
        fontSize: fontPixel(12),
        fontFamily: 'Regular',
        flex: 1,
    },
    skillsContainer: {
        flexDirection: 'row',
        gap: widthPixel(6),
        flexWrap: 'wrap',
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
    moreSkills: {
        paddingHorizontal: widthPixel(10),
        paddingVertical: heightPixel(6),
    },
    moreSkillsText: {
        fontSize: fontPixel(11),
        fontFamily: 'Regular',
    },
});

export default ArtisanCard;