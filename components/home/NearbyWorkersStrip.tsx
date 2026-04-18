import EmptyList from '@/components/ui/EmptyList';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Worker } from '@/redux/search/types';
import { distanceMetersFromUser, formatDistanceMeters } from '@/utils/geo';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

function primarySkillLabel(worker: Worker): string {
  const skills = worker.skills;
  if (!skills?.length) return 'Worker';
  const sorted = [...skills].sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0));
  return sorted[0].name ?? 'Worker';
}

interface NearbyWorkersStripProps {
  workers: Worker[];
  userLat: number;
  userLng: number;
  /** While search is initializing and workers are not yet loaded */
  isLoadingNearby?: boolean;
}

function NearbyWorkersStripSkeleton() {
  const opacity = useSharedValue(0.3);
  const skeletonColor = useThemeColor(
    { light: colors.light.grey, dark: colors.dark.grey },
    'background',
  ) as string;

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.7, { duration: 1000 }), withTiming(0.3, { duration: 1000 })),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.skeletonRow}>
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={[styles.cell, i > 0 && styles.skeletonCellSpacing]}>
          <Animated.View
            style={[styles.skeletonRing, animatedStyle, { backgroundColor: skeletonColor }]}
          />
          <Animated.View
            style={[styles.skeletonLineShort, animatedStyle, { backgroundColor: skeletonColor }]}
          />
          <Animated.View
            style={[styles.skeletonLineTiny, animatedStyle, { backgroundColor: skeletonColor }]}
          />
        </View>
      ))}
    </View>
  );
}

export default function NearbyWorkersStrip({
  workers,
  userLat,
  userLng,
  isLoadingNearby,
}: NearbyWorkersStripProps) {
  const secondaryColor = useThemeColor(
    { light: colors.light.secondary, dark: colors.dark.secondary },
    'text',
  );
  const textColor = useThemeColor({ light: colors.light.text, dark: colors.dark.text }, 'text');
  const tintColor = useThemeColor({ light: colors.light.tint, dark: colors.dark.tint }, 'tint');

  const data = useMemo(() => workers.slice(0, 40), [workers]);

  const renderItem = useCallback(
    ({ item }: { item: Worker }) => {
      const meters = distanceMetersFromUser(userLat, userLng, item.coordinates);
      const label = primarySkillLabel(item);
      return (
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/(tabs)/(search)/(artisan)/artisan',
              params: { artisanId: item.id },
            })
          }
          style={styles.cell}
        >
          <View style={[styles.ring, { borderColor: tintColor }]}>
            <Image
              source={{ uri: item.avatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          </View>
          <ThemedText style={[styles.skill, { color: textColor }]} numberOfLines={1}>
            {label}
          </ThemedText>
          <ThemedText style={[styles.distance, { color: secondaryColor }]} numberOfLines={1}>
            {formatDistanceMeters(meters)}
          </ThemedText>
        </Pressable>
      );
    },
    [userLat, userLng, textColor, secondaryColor, tintColor],
  );

  if (isLoadingNearby && data.length === 0) {
    return (
      <View style={styles.wrap}>
        <NearbyWorkersStripSkeleton />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <EmptyList
        message="No workers nearby yet"
        containerStyle={styles.emptyList}
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(w) => w.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: widthPixel(12) }} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: heightPixel(12),
  },
  listContent: {
    paddingHorizontal: widthPixel(4),
  },
  cell: {
    width: widthPixel(76),
    alignItems: 'center',
  },
  skeletonCellSpacing: {
    marginLeft: widthPixel(12),
  },
  ring: {
    width: widthPixel(64),
    height: widthPixel(64),
    borderWidth: 2,
    padding: 2,
    marginBottom: heightPixel(6),
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  skill: {
    fontSize: fontPixel(11),
    fontFamily: 'SemiBold',
    textAlign: 'center',
    width: '100%',
  },
  distance: {
    fontSize: fontPixel(10),
    fontFamily: 'Medium',
    marginTop: heightPixel(2),
  },
  emptyList: {
    flexGrow: 0,
    flexShrink: 1,
    paddingVertical: heightPixel(12),
    paddingHorizontal: widthPixel(8),
  },
  skeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: widthPixel(4),
    marginBottom: heightPixel(12),
  },
  skeletonRing: {
    width: widthPixel(64),
    height: widthPixel(64),
    marginBottom: heightPixel(6),
  },
  skeletonLineShort: {
    width: widthPixel(56),
    height: heightPixel(10),
    marginBottom: heightPixel(4),
  },
  skeletonLineTiny: {
    width: widthPixel(40),
    height: heightPixel(8),
  },
});
