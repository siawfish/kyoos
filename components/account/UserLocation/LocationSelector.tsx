import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useGoogleAutocompleteProxy, GoogleLocationResult } from '@/hooks/useGoogleAutocompleteProxy';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/theme/colors';
import { heightPixel, widthPixel, fontPixel } from '@/constants/normalize';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppTheme } from '@/hooks/use-app-theme';
import InputField from '@/components/ui/TextInput';
import LocationMapPicker from './LocationMapPicker';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AccentScreenHeader } from '@/components/ui/AccentScreenHeader';
import { selectUserLocation, selectUserLocationIsMapPickerOpen } from '@/redux/app/selector';
import { actions } from '@/redux/app/slice';

export default function LocationSelector() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const location = useAppSelector(selectUserLocation);
  const isMapPickerOpen = useAppSelector(selectUserLocationIsMapPickerOpen);
  const theme = useAppTheme();
  const isDark = theme === 'dark';
  const accentColor = isDark ? colors.dark.white : colors.light.black;

  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background,
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

  const inputBackground = useThemeColor({
    light: colors.light.background + '95',
    dark: colors.dark.background + '95',
  }, 'background');

  const { locationResults, setTerm, isSearching, searchError, searchDetails } = useGoogleAutocompleteProxy({
    components: 'country:gh',
    language: 'en',
  });

  const onLocationSelect = useCallback((item: GoogleLocationResult) => {
    searchDetails(item.place_id).then((result) => {
      dispatch(actions.setLocation({
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        address: result.formatted_address,
        error: '',
        isLoading: false,
        isMapPickerOpen: false,
      }));
      setTerm('');
    });
  }, [dispatch, searchDetails, setTerm]);

  const renderItem: ListRenderItem<GoogleLocationResult> = useCallback(({ item }) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: borderColor, backgroundColor: inputBackground }]}
      onPress={() => onLocationSelect(item)}
      activeOpacity={0.7}
    >
      <Feather name="map-pin" size={16} color={secondaryColor} />
      <ThemedText style={[styles.description, { color: textColor }]} numberOfLines={2}>
        {item.description}
      </ThemedText>
    </TouchableOpacity>
  ), [borderColor, inputBackground, secondaryColor, textColor, onLocationSelect]);

  const ListHeader = useMemo(() => (
    <View style={[styles.stickyHeader, { backgroundColor }]}>
      <AccentScreenHeader
        onBackPress={() => router.back()}
        title={
          <View>
            <ThemedText style={[styles.sectionEyebrow, { color: secondaryColor }]}>
              YOUR LOCATION
            </ThemedText>
            <ThemedText style={[styles.title, { color: textColor }]}>
              Where are you located?
            </ThemedText>
          </View>
        }
        subtitle={
          <ThemedText style={[styles.subtitle, { color: secondaryColor }]}>
            This helps us connect you with nearby artisans
          </ThemedText>
        }
      />

      <View style={styles.inputSection}>
        <InputField
          label="SEARCH LOCATION"
          isLoading={isSearching}
          value={location?.address || ''}
          clearButtonMode="never"
          error={searchError?.message || location?.error}
          onChangeText={(text) => {
            dispatch(actions.setLocation({
              ...location,
              address: text,
              error: '',
            }));
            setTerm(text);
          }}
          placeholder="Enter your location"
          errorStyle={styles.error}
          style={{ backgroundColor: inputBackground }}
        />

        <TouchableOpacity
          style={styles.pickContainer}
          onPress={() => dispatch(actions.openMapPicker())}
          activeOpacity={0.7}
        >
          <View style={styles.pickContent}>
            <Feather name="map-pin" size={20} color={tintColor} />
            <ThemedText style={[styles.pickText, { color: textColor }]}>
              Pick location on map
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={18} color={secondaryColor} />
        </TouchableOpacity>
      </View>

      {locationResults.length > 0 && (
        <View style={[styles.stickyDivider, { backgroundColor: borderColor }]} />
      )}
    </View>
  ), [
    backgroundColor,
    accentColor,
    router,
    secondaryColor,
    textColor,
    isSearching,
    location,
    searchError,
    dispatch,
    setTerm,
    inputBackground,
    tintColor,
    locationResults.length,
    borderColor,
  ]);

  const ItemSeparator = useCallback(() => (
    <View style={[styles.separator, { backgroundColor: borderColor }]} />
  ), [borderColor]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <FlashList
        data={locationResults}
        renderItem={renderItem}
        keyExtractor={(item) => item.place_id}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={styles.listContent}
        stickyHeaderIndices={[0]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />

      <LocationMapPicker
        isOpen={isMapPickerOpen}
        handleSheetChanges={(change) => {
          if (change === -1) {
            dispatch(actions.closeMapPicker());
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: heightPixel(40),
  },
  headerSection: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(20),
  },
  sectionEyebrow: {
    fontSize: fontPixel(10),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
    marginBottom: heightPixel(8),
  },
  title: {
    fontSize: fontPixel(32),
    fontFamily: 'Bold',
    lineHeight: fontPixel(38),
    letterSpacing: -1,
    marginBottom: heightPixel(12),
  },
  subtitle: {
    fontSize: fontPixel(15),
    fontFamily: 'Regular',
    lineHeight: fontPixel(22),
  },
  inputSection: {},
  pickContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: widthPixel(16),
  },
  pickContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(12),
  },
  pickText: {
    fontSize: fontPixel(14),
    fontFamily: 'Medium',
  },
  stickyHeader: {
    paddingBottom: heightPixel(8),
  },
  stickyDivider: {
    marginTop: heightPixel(12),
    height: StyleSheet.hairlineWidth,
    width: '100%',
    opacity: 0.6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(12),
    padding: widthPixel(16),
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
    opacity: 0.6,
  },
  description: {
    flex: 1,
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
  },
  error: {
    right: widthPixel(16),
  },
});
