import React, { useMemo } from "react";
import { View, StyleSheet, TouchableOpacity, Image, StyleProp, ViewStyle } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { colors } from "@/constants/theme/colors";
import { Feather } from "@expo/vector-icons";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { Skill, Worker } from "@/redux/search/types";
import { calculateWorkerAverageRate, calculateWorkerCost, calculateWorkerHourlyRate } from "@/constants/helpers";
import PriceTag from "@/components/search/PriceTag";

interface ArtisanCardProps {
    artisan: Worker;
    containerStyle?: StyleProp<ViewStyle>;
    estimatedDuration?: number;
    requiredSkills: Skill[];
    onPress?: (id: string) => void;
}

const ArtisanCard = ({ artisan, containerStyle, estimatedDuration, requiredSkills, onPress }: ArtisanCardProps) => {
    const cardBackgroundColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black,
    }, 'background');

    const handleCardPress = () => {
        onPress?.(artisan.id);
    };

    const workerCost = useMemo(() => calculateWorkerCost(artisan, requiredSkills, estimatedDuration || 0), [artisan, requiredSkills, estimatedDuration]);
    const hourlyRate = useMemo(() => calculateWorkerHourlyRate(artisan, requiredSkills), [artisan, requiredSkills]);
    const averageRate = useMemo(() => calculateWorkerAverageRate(artisan), [artisan]);

    return (
        <TouchableOpacity 
            style={[styles.artisanCard, { backgroundColor: cardBackgroundColor }, containerStyle]}
            onPress={handleCardPress}
        >
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <View style={[styles.avatar, { backgroundColor: colors.light.lightTint }]}>
                        {artisan.avatar ? (
                            <Image source={{ uri: artisan.avatar }} style={styles.avatarImage} />
                        ) : (
                            <ThemedText style={styles.avatarText}>
                                {artisan.name.charAt(0).toUpperCase()}
                            </ThemedText>
                        )}
                    </View>
                    <View style={styles.verifiedBadge}>
                        <Image source={require('@/assets/images/verified.png')} style={styles.verifiedImage} />
                    </View>
                </View>
                
                <View style={styles.priceContainer}>
                    <ThemedText style={styles.priceLabel}>Starting from</ThemedText>
                    {
                        workerCost > 0 ? (
                            <PriceTag price={workerCost} />
                        ) : (
                            <PriceTag price={hourlyRate || averageRate} suffix="/hr" />
                        )
                    }
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.nameRow}>
                    <ThemedText type="defaultSemiBold" style={styles.businessName}>
                        {artisan.name}
                    </ThemedText>
                </View>
                
                <View style={styles.ratingContainer}>
                    <Feather name="star" size={14} color={colors.light.tint} />
                    <ThemedText style={styles.rating}>{artisan.rating}</ThemedText>
                    <ThemedText style={styles.reviewCount}>(723 reviews)</ThemedText>
                </View>

                <View style={styles.locationContainer}>
                    <Feather name="map-pin" size={12} color={colors.light.secondary} />
                    <ThemedText style={styles.location} numberOfLines={1}>
                        {artisan.location?.address}
                    </ThemedText>
                </View>

                <View style={styles.skillsContainer}>
                    {artisan.skills.slice(0, 2).map((skill) => (
                        <View key={skill?.id} style={styles.skillTag}>
                            <ThemedText style={styles.skillText}>{skill?.name}</ThemedText>
                        </View>
                    ))}
                    {artisan.skills.length > 2 && (
                        <View style={styles.moreSkills}>
                            <ThemedText style={styles.moreSkillsText}>
                                +{artisan.skills.length - 2} more
                            </ThemedText>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    artisanCard: {
        padding: widthPixel(16),
        borderRadius: widthPixel(16),
        width: '100%',
        minWidth: widthPixel(300),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        height: heightPixel(200),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: heightPixel(12),
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: widthPixel(56),
        height: widthPixel(56),
        borderRadius: widthPixel(28),
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: {
        width: widthPixel(56),
        height: widthPixel(56),
        borderRadius: widthPixel(28),
    },
    avatarText: {
        fontSize: fontPixel(20),
        fontWeight: '600',
        color: colors.light.tint,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
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
        fontSize: fontPixel(12),
        color: colors.light.secondary,
        marginBottom: heightPixel(2),
    },
    price: {
        fontSize: fontPixel(20),
        fontWeight: '700',
        color: colors.light.tint,
    },
    content: {
        flex: 1,
    },
    nameRow: {
        marginBottom: heightPixel(6),
    },
    businessName: {
        fontSize: fontPixel(16),
        fontWeight: '600',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: heightPixel(6),
    },
    rating: {
        marginLeft: widthPixel(4),
        fontSize: fontPixel(14),
        fontWeight: '500',
    },
    reviewCount: {
        marginLeft: widthPixel(4),
        fontSize: fontPixel(12),
        color: colors.light.secondary,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: heightPixel(12),
    },
    location: {
        marginLeft: widthPixel(4),
        fontSize: fontPixel(12),
        color: colors.light.secondary,
        flex: 1,
    },
    skillsContainer: {
        flexDirection: 'row',
        gap: widthPixel(6),
        flexWrap: 'wrap',
    },
    skillTag: {
        backgroundColor: colors.light.lightTint,
        paddingHorizontal: widthPixel(8),
        paddingVertical: heightPixel(4),
        borderRadius: widthPixel(6),
    },
    skillText: {
        fontSize: fontPixel(11),
        color: colors.light.tint,
        fontWeight: '500',
    },
    moreSkills: {
        paddingHorizontal: widthPixel(8),
        paddingVertical: heightPixel(4),
    },
    moreSkillsText: {
        fontSize: fontPixel(11),
        color: colors.light.secondary,
    },
});

export default ArtisanCard;