import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { widthPixel, heightPixel, fontPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import ArtisanCard from '@/components/search/ArtisanCard';
import { Worker } from '@/redux/search/types';
import { FlashList } from '@shopify/flash-list';

const Artisans: Worker[] = [];

export default function PopularArtisans() {
    const renderItem = ({ item }: { item: Worker }) => (
        <ArtisanCard artisan={item} containerStyle={styles.cardContainer} requiredSkills={[]} />
    );

    return (
        <View style={styles.popularSection}>
            <View style={styles.sectionHeader}>
                <ThemedText type='subtitle' style={styles.sectionTitle}>Popular Joolsmen</ThemedText>
                <TouchableOpacity>
                <ThemedText style={styles.viewAllText}>View all</ThemedText>
                </TouchableOpacity>
            </View>
        
            <FlashList
                data={Artisans}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    popularSection: {
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
    cardContainer: {
      width: Dimensions.get('window').width * 0.8,
    },
    separator: {
      width: widthPixel(16),
    },
});
