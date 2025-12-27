import BackButton from '@/components/ui/BackButton';
import InputField from '@/components/ui/TextInput';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectLocation } from '@/redux/auth/selector';
import { actions } from '@/redux/auth/slice';
import { LocationForm } from '@/redux/auth/types';
import { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { GoogleLocationResult, useGoogleAutocomplete } from '@appandflow/react-native-google-autocomplete';
import { FlashList } from '@shopify/flash-list';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import LocationMapPicker from './LocationMapPicker';

interface UserLocationProps {
    mode?: 'auth' | 'account';
    selectLocation?: (state: RootState) => LocationForm;
    onSetLocation?: (location: LocationForm) => void;
    onReverseGeocode?: (latlng: string, callback: (loc: LocationForm) => void) => void;
    headerConfig?: {
        stepLabel?: string;
        title: string;
        subtitle: string;
    };
    showBackButton?: boolean;
    onBack?: () => void;
    contentBottomPadding?: number;
}

export default function UserLocation({
    mode = 'auth',
    selectLocation: propSelectLocation,
    onSetLocation: propOnSetLocation,
    onReverseGeocode: propOnReverseGeocode,
    headerConfig,
    showBackButton = false,
    onBack,
    contentBottomPadding,
}: UserLocationProps = {}) {
  const dispatch = useAppDispatch();
  const reduxLocation = useAppSelector(selectLocation);
  const propLocation = useAppSelector(propSelectLocation || selectLocation);
  const location = propSelectLocation ? propLocation : reduxLocation;
  const [showMapPicker, setShowMapPicker] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const inputBackground = useThemeColor({light: colors.light.white, dark: colors.dark.black}, 'background');
  
  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background,
  }, 'background');

  const textColor = isDark ? colors.dark.text : colors.light.text;
  const subtitleColor = isDark ? colors.dark.secondary : colors.light.secondary;
  const accentColor = isDark ? colors.dark.white : colors.light.black;

  const { locationResults, setTerm, isSearching, searchError, searchDetails } = useGoogleAutocomplete(
    process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '', {
      components: 'country:gh',
      language: 'en',
    }
  );

  const handleLocationSelect = (location: LocationForm) => {
    if (propOnSetLocation) {
      propOnSetLocation(location);
    } else {
      // Default to Redux action (backward compatibility)
      dispatch(actions.setLocation(location));
    }
  };

  const onLocationSelect = (item: GoogleLocationResult) => {
    searchDetails(item.place_id).then((result) => {
      const newLocation = {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        address: result.formatted_address,
      };
      
      if (propOnSetLocation) {
        propOnSetLocation(newLocation);
      } else {
        // Default to Redux action (backward compatibility)
        dispatch(actions.setLocation(newLocation));
      }
      setTerm('');
    });
  }

  // Default header config for auth mode
  const defaultHeaderConfig = {
    stepLabel: 'STEP 4',
    title: 'Where are you\nlocated?',
    subtitle: 'This helps us connect you with nearby opportunities',
  };

  const finalHeaderConfig = headerConfig || defaultHeaderConfig;

  const handleInputChange = (text: string) => {
    const newLocation = {
      ...location,
      address: text,
      error: '',
    };
    
    if (propOnSetLocation) {
      propOnSetLocation(newLocation);
    } else {
      // Default to Redux action (backward compatibility)
      dispatch(actions.setLocation(newLocation));
    }
    setTerm(text);
  };

  return (
    <>
      {showBackButton && onBack && (
        <View style={styles.backButtonContainer}>
          <BackButton iconName='arrow-left' onPress={onBack} />
        </View>
      )}
      <View style={[styles.container, { backgroundColor }, contentBottomPadding ? { paddingBottom: contentBottomPadding } : undefined]}>
        <View style={styles.header}>
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
          {finalHeaderConfig.stepLabel && (
            <Text style={[styles.label, { color: subtitleColor }]}>
              {finalHeaderConfig.stepLabel}
            </Text>
          )}
          <Text style={[styles.title, { color: textColor }]}>
            {finalHeaderConfig.title}
          </Text>
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            {finalHeaderConfig.subtitle}
          </Text>
        </View>

      <View style={styles.inputContainer}>
        <InputField
          label="LOCATION"
          isLoading={isSearching}
          value={location.address}
          clearButtonMode="never"
          error={searchError?.message || location.error}
          onChangeText={handleInputChange}
          placeholder="Enter your location"
          errorStyle={styles.error}
          style={[styles.input, { backgroundColor: inputBackground }]}
        />
        
        <TouchableOpacity style={styles.pickContainer} onPress={() => setShowMapPicker(true)}>
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
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={handleLocationSelect}
        onReverseGeocode={propOnReverseGeocode}
        handleSheetChanges={(change) => {
          if(change === -1){
            setShowMapPicker(false);
          }
        }}
      />
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  backButtonContainer: {
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(16),
    marginBottom: heightPixel(8),
  },
  container: {
    flex: 1,
    paddingVertical: heightPixel(16),
  },
  header: {
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(8),
  },
  accentBar: {
    width: widthPixel(40),
    height: heightPixel(4),
    marginBottom: heightPixel(20),
  },
  label: {
    fontSize: fontPixel(11),
    fontFamily: 'SemiBold',
    letterSpacing: 2,
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
  inputContainer: {
    marginTop: heightPixel(32),
    flex: 1,
  },
  input: {
    width: '100%',
  },
  listView: {
    width: '100%',
    borderRadius: 0,
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

