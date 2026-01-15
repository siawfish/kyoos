import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppTheme } from '@/hooks/use-app-theme';
import { colors } from '@/constants/theme/colors';
import { Portal } from '@gorhom/portal';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { BlurView } from 'expo-blur';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import BackButton from '@/components/ui/BackButton';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MapPressEvent, Marker } from 'react-native-maps';
import ThemedMapView from '@/components/ui/ThemedMapView';
import Button from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { actions } from '@/redux/booking/slice';
import { selectServiceLocation } from '@/redux/booking/selector';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.8;

interface LocationMapPickerProps {
    isOpen: boolean;
    handleSheetChanges?: (index: number) => void;
}

const INITIAL_REGION = {
  latitude: 5.5560,
  longitude: -0.1969,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
}

const LocationMapPicker = ({
    isOpen,
    handleSheetChanges,
}: LocationMapPickerProps) => {
    const translateY = useSharedValue(0);
    const context = useSharedValue({ y: 0 });
    const active = useSharedValue(false); 
    const [selectedLocation, setSelectedLocation] = useState<{
      latitude: number;
      longitude: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const location = useAppSelector(selectServiceLocation);
    const dispatch = useAppDispatch();
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const accentColor = isDark ? colors.dark.white : colors.light.black;
  
    const handleMapPress = (e: MapPressEvent) => {
      setSelectedLocation(e.nativeEvent.coordinate);
    };
  
    const handleConfirm = () => {
      if (selectedLocation) {
        setIsLoading(true);
        dispatch(actions.reverseGeocodeServiceLocation(
          `${selectedLocation.latitude},${selectedLocation.longitude}`
        ));
        // Loading state will be reset when the saga completes
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

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

    useEffect(() => {
        if (isOpen) {
            translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
            active.value = true;
        } else {
            translateY.value = withSpring(0, { damping: 50 });
            active.value = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const gesture = Gesture.Pan()
        .onStart(() => {
            context.value = { y: translateY.value };
        })
        .onUpdate((event) => {
            translateY.value = event.translationY + context.value.y;
            translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
        })
        .onEnd(() => {
            if (translateY.value > -SCREEN_HEIGHT * 0.3) {
                translateY.value = withSpring(0, { damping: 50 });
                if (handleSheetChanges) {
                    runOnJS(handleSheetChanges)(-1);
                }
                active.value = false;
            } else {
                translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
            }
        });

    const rBottomSheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
      <Portal>
        {isOpen && (
            <TouchableOpacity 
                style={StyleSheet.absoluteFill} 
                onPress={() => {
                    translateY.value = withSpring(0, { damping: 50 });
                    active.value = false;
                    if (handleSheetChanges) {
                      handleSheetChanges(-1);
                    }
                }}
            >
                <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
            </TouchableOpacity>
        )}
            <GestureDetector gesture={gesture}>
                <Animated.View
                    style={[
                        styles.bottomSheetContainer,
                        rBottomSheetStyle,
                        { backgroundColor }
                    ]}
                >
                  <View style={[styles.line, { backgroundColor: borderColor }]} />
                  <View style={styles.bottomSheetHeader}>
                    <View style={styles.headerLeft}>
                      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                      <ThemedText style={[styles.headerLabel, { color: secondaryColor }]}>
                        MAP PICKER
                      </ThemedText>
                      <ThemedText style={[styles.bottomSheetTitle, { color: textColor }]}>
                        Select Location
                      </ThemedText>
                      <ThemedText style={[styles.helperText, { color: secondaryColor }]}>
                        Tap on the map to select your location
                      </ThemedText>
                    </View>
                    <BackButton 
                      iconName="x"
                      onPress={() => {
                        translateY.value = withSpring(0, { damping: 50 });
                        active.value = false;
                        if (handleSheetChanges) {
                          handleSheetChanges(-1);
                        }
                      }}
                      containerStyle={styles.closeButton}
                    />
                  </View>
                  <View style={styles.mapContainer}>
                    <ThemedMapView
                      style={styles.map}
                      onPress={handleMapPress}
                      initialRegion={{
                        latitude: location?.lat || INITIAL_REGION.latitude,
                        longitude: location?.lng || INITIAL_REGION.longitude,
                        latitudeDelta: INITIAL_REGION.latitudeDelta,
                        longitudeDelta: INITIAL_REGION.longitudeDelta,
                      }}
                      showsUserLocation
                      showsMyLocationButton={false}
                      showsCompass={false}
                      toolbarEnabled={false}
                    >
                      {selectedLocation && (
                        <Marker coordinate={selectedLocation} anchor={{ x: 0.5, y: 0.5 }}>
                          <View style={styles.markerContainer}>
                            <View style={[styles.markerPin, { backgroundColor: tintColor }]} />
                            <View style={[styles.markerPinInner, { backgroundColor: tintColor }]} />
                            <View style={[styles.markerCircle, { borderColor: tintColor }]} />
                          </View>
                        </Marker>
                      )}
                    </ThemedMapView>
                    <View style={[styles.footer, { borderTopColor: borderColor }]}>
                      <Button
                        isLoading={isLoading}
                        onPress={handleConfirm}
                        disabled={!selectedLocation}
                        label="Confirm Location"
                      />
                    </View>
                  </View> 
                </Animated.View>
            </GestureDetector>
        </Portal>
    );
}

export default LocationMapPicker;

const styles = StyleSheet.create({
    bottomSheetContainer: {
        height: SCREEN_HEIGHT,
        width: '100%',
        position: 'absolute',
        top: SCREEN_HEIGHT,
        zIndex: 100,
    },
    line: {
        width: widthPixel(40),
        height: heightPixel(2),
        alignSelf: 'center',
        marginVertical: heightPixel(12),
    },
    bottomSheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: widthPixel(16),
        paddingTop: heightPixel(20),
        paddingBottom: heightPixel(24),
    },
    headerLeft: {
        flex: 1,
    },
    accentBar: {
        width: widthPixel(40),
        height: heightPixel(4),
        marginBottom: heightPixel(16),
    },
    headerLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
        marginBottom: heightPixel(8),
    },
    bottomSheetTitle: {
        fontSize: fontPixel(24),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
        lineHeight: fontPixel(28),
        marginBottom: heightPixel(8),
    },
    closeButton: {
        marginTop: heightPixel(8),
    },
    mapContainer: {
        flex: 1,
    },
    map: {
      height: '60%',
    },
    footer: {
      paddingVertical: heightPixel(16),
      borderTopWidth: 0.5,
    },
    helperText: {
      fontSize: fontPixel(15),
      fontFamily: 'Regular',
      lineHeight: fontPixel(22),
    },
    markerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    markerPin: {
      width: widthPixel(20),
      height: widthPixel(20),
      borderRadius: widthPixel(10),
      borderWidth: 3,
      borderColor: '#FFFFFF',
      zIndex: 2,
      position: 'relative',
    },
    markerPinInner: {
      position: 'absolute',
      width: widthPixel(12),
      height: widthPixel(12),
      borderRadius: widthPixel(6),
      top: widthPixel(4),
      left: widthPixel(4),
    },
    markerCircle: {
      position: 'absolute',
      width: widthPixel(40),
      height: widthPixel(40),
      borderRadius: widthPixel(20),
      borderWidth: 2,
      opacity: 0.3,
      top: widthPixel(-10),
      left: widthPixel(-10),
    },
});
