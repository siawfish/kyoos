import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { widthPixel, heightPixel, fontPixel } from '@/constants/normalize';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { Ionicons } from '@expo/vector-icons';

const SERVICE_CATEGORIES = [
  { icon: 'cut-outline' as const, name: 'Hairdresser' },
  { icon: 'water-outline' as const, name: 'Cleaning' },
  { icon: 'color-palette-outline' as const, name: 'Painting' },
  { icon: 'restaurant-outline' as const, name: 'Cooking' },
];

export default function ServiceCategories() {
    const primaryColor = useThemeColor({
      light: colors.light.tint,
      dark: colors.dark.tint,
    }, 'tint');

    const cardBackgroundColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.black,
    }, 'background');

    return (
        <View style={styles.categoriesSection}>
            <View style={styles.sectionHeader}>
                <ThemedText type='subtitle' style={styles.sectionTitle}>Service Categories</ThemedText>
                <TouchableOpacity>
                <ThemedText style={styles.viewAllText}>View all</ThemedText>
                </TouchableOpacity>
            </View>
            <View style={styles.categoriesGrid}>
                {SERVICE_CATEGORIES.map((category, index) => (
                    <TouchableOpacity key={index} style={[styles.categoryCard, { backgroundColor: cardBackgroundColor }]}>
                        <View style={styles.categoryIcon}>
                            <Ionicons name={category.icon} size={24} color={primaryColor} />
                        </View>
                        <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
                        <Ionicons name="chevron-forward" size={16} color="#666" />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    categoriesSection: {
        paddingHorizontal: widthPixel(16),
        marginTop: heightPixel(24),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: heightPixel(16),
    },
    sectionTitle: {
        fontSize: fontPixel(18),
        fontWeight: '600',
    },
    viewAllText: {
        fontSize: fontPixel(14),
        color: colors.light.tint,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: widthPixel(12),
    },
    categoryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: widthPixel(8),
        paddingVertical: heightPixel(8),
        borderRadius: 12,
        gap: widthPixel(12),
        width: '48%',
    },
    categoryName: {
        flex: 1,
        fontSize: fontPixel(14),
        fontWeight: '500',
    },
    categoryIcon: {
        width: widthPixel(40),
        height: widthPixel(40),
        backgroundColor: colors.light.lightTint,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    }
});
