import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useGoogleAutocomplete, GoogleLocationResult } from '@appandflow/react-native-google-autocomplete';
import { FlashList } from '@shopify/flash-list';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/constants/theme/colors';
import { heightPixel, widthPixel, fontPixel } from '@/constants/normalize';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppTheme } from '@/hooks/use-app-theme';
import InputField from '@/components/ui/TextInput';
import LocationMapPicker from './LocationMapPicker';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import BackButton from '@/components/ui/BackButton';
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

  const { locationResults, setTerm, isSearching, searchError, searchDetails } = useGoogleAutocomplete(
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '', {
      components: 'country:gh',
      language: 'en',
    }
  );

  const onLocationSelect = (item: GoogleLocationResult) => {
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
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
          <View style={styles.header}>
            <BackButton 
              iconName='arrow-left'
              onPress={() => router.back()}
            />
          </View>
          <ThemedText style={[styles.label, { color: secondaryColor }]}>
            YOUR LOCATION
          </ThemedText>
          <ThemedText style={[styles.title, { color: textColor }]}>
            Where are you located?
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: secondaryColor }]}>
            This helps us connect you with nearby artisans
          </ThemedText>
        </View>

        {/* Input Section */}
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
          
          {locationResults.length > 0 && (
            <BlurView 
              intensity={80} 
              tint={isDark ? 'dark' : 'light'} 
              style={[styles.listView, { backgroundColor: inputBackground, borderColor }]}
            >
              <FlashList
                data={locationResults}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.row, { borderBottomColor: borderColor }]}
                    onPress={() => onLocationSelect(item)}
                    activeOpacity={0.7}
                  >
                    <Feather name="map-pin" size={16} color={secondaryColor} />
                    <ThemedText style={[styles.description, { color: textColor }]} numberOfLines={2}>
                      {item.description}
                    </ThemedText>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.place_id}
              />
            </BlurView>
          )}
        </View>
      </ScrollView>

      <LocationMapPicker
        isOpen={isMapPickerOpen}
        handleSheetChanges={(change) => {
          if(change === -1){
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: heightPixel(40),
  },
  headerSection: {
    paddingHorizontal: widthPixel(20),
    paddingBottom: heightPixel(20),
  },
  accentBar: {
    width: widthPixel(40),
    height: heightPixel(4),
    marginBottom: heightPixel(20),
  },
  header: {
    marginBottom: heightPixel(16),
  },
  label: {
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
  inputSection: {
    // gap: heightPixel(12),
  },
  pickContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: widthPixel(16),
    // paddingVertical: heightPixel(16),
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
  listView: {
    width: '100%',
    borderWidth: 0.5,
    borderLeftWidth: 0,
    overflow: 'hidden',
    marginTop: heightPixel(4),
    maxHeight: heightPixel(300),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(12),
    padding: widthPixel(16),
    borderBottomWidth: 0.5,
  },
  description: {
    flex: 1,
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
  },
  error: {
    right: widthPixel(16),
  }
}); 