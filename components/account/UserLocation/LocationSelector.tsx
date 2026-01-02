import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useGoogleAutocomplete, GoogleLocationResult } from '@appandflow/react-native-google-autocomplete';
import { FlashList } from '@shopify/flash-list';
import { colors } from '@/constants/theme/colors';
import { heightPixel, widthPixel } from '@/constants/normalize';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
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
  const inputBackground = useThemeColor({light: colors.light.white, dark: colors.dark.black}, 'background');
  
  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background,
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
      <View style={styles.header}>
        <BackButton 
          iconName='arrow-left'
          onPress={() => router.back()}
        />
      </View>
      <View style={styles.header}>
        <ThemedText type="title">Where are you located?</ThemedText>
        <ThemedText 
          type="default" 
          lightColor={colors.light.secondary}
          darkColor={colors.dark.secondary}
          style={styles.subtitle}
        >
          This helps us connect you with nearby artisans
        </ThemedText>
      </View>

      <View style={styles.inputContainer}>
        <InputField
          label="Location"
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
          style={[styles.input, { backgroundColor: inputBackground }]}
        />
        
        <TouchableOpacity style={styles.pickContainer} onPress={() => dispatch(actions.openMapPicker())}>
          <Image source={require('@/assets/images/map-marker.png')} style={styles.pickIcon} />
          <ThemedText type="default" style={styles.description}>
            Pick location
          </ThemedText>
        </TouchableOpacity>
        
        {locationResults.length > 0 && (
          <View style={[styles.listView, { backgroundColor: inputBackground }]}>
            <FlashList
              data={locationResults}
              renderItem={({ item }) => (
                <View 
                  style={styles.row}
                  onTouchEnd={() => onLocationSelect(item)}
                >
                  <ThemedText type="default" style={styles.description}>
                    {item.description}
                  </ThemedText>
                </View>
              )}
              keyExtractor={(item) => item.place_id}
            />
          </View>
        )}
      </View>

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
    paddingVertical: heightPixel(16),
  },
  header: {
    marginTop: heightPixel(16),
    marginHorizontal: widthPixel(16),
  },
  subtitle: {
    fontSize: widthPixel(16),
  },
  inputContainer: {
    marginTop: heightPixel(32),
    flex: 1,
  },
  input: {
    width: '100%',
  },
  listView: {
    width: '100%',
    borderRadius: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: heightPixel(4),
    height: heightPixel(300),
  },
  row: {
    padding: widthPixel(15),
    borderBottomWidth: 1,
    borderBottomColor: colors.light.misc,
  },
  description: {
    fontSize: widthPixel(14),
  },
  pickContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(8),
    paddingHorizontal: widthPixel(16),
    paddingTop: heightPixel(8),
  },
  pickIcon: {
    width: widthPixel(30),
    height: widthPixel(30),
  },
  error: {
    right: widthPixel(16),
  }
}); 