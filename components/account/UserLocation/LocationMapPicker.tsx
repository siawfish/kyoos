import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { Portal } from '@gorhom/portal';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { BlurView } from 'expo-blur';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';
import Button from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { actions } from '@/redux/app/slice';
import { selectUserLocation } from '@/redux/app/selector';
import { StoreName } from '@/redux/app/types';

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
    const location = useAppSelector(selectUserLocation);
    const dispatch = useAppDispatch();
  
    const handleMapPress = (e: MapPressEvent) => {
      setSelectedLocation(e.nativeEvent.coordinate);
    };
  
    const handleConfirm = () => {
      if (selectedLocation) {
        dispatch(actions.saveUserLocation());
        dispatch(actions.reverseGeocodeLocation({
          latlng: `${selectedLocation.latitude},${selectedLocation.longitude}`,
          store: StoreName.LOCATION,
        }));
      }
    };

    const backgroundColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background,
    }, 'background');

    useEffect(() => {
        if (isOpen) {
            translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
            active.value = true;
        } else {
            translateY.value = withSpring(0, { damping: 50 });
            active.value = false;
        }
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
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
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
                  <View style={styles.line} />
                  <View style={styles.bottomSheetHeader}>
                    <ThemedText style={styles.bottomSheetTitle}>Select Location</ThemedText>
                    <ThemedText style={styles.helperText}>
                      Tap on the map to select your location
                    </ThemedText>
                  </View>
                  <View style={styles.mapContainer}>
                    <MapView
                      style={styles.map}
                      onPress={handleMapPress}
                      initialRegion={{
                        latitude: location.lat || INITIAL_REGION.latitude,
                        longitude: location.lng || INITIAL_REGION.longitude,
                        latitudeDelta: INITIAL_REGION.latitudeDelta,
                        longitudeDelta: INITIAL_REGION.longitudeDelta,
                      }}
                    >
                      {selectedLocation && (
                        <Marker
                          coordinate={selectedLocation}
                        />
                      )}
                    </MapView>
                    <View style={styles.footer}>
                      <Button
                        isLoading={location.isLoading}
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
        borderRadius: 25,
        zIndex: 100,
    },
    line: {
        width: 75,
        height: 4,
        backgroundColor: 'grey',
        alignSelf: 'center',
        marginVertical: 15,
        borderRadius: 2,
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: widthPixel(8),
        flex: 1
    },
    selector: {
        fontSize: widthPixel(18),
        padding: widthPixel(16),
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: colors.light.tint,
        borderTopWidth: 0.3,
        borderBottomWidth: 0.3,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        minHeight: heightPixel(56),
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: widthPixel(12),
        paddingVertical: heightPixel(6),
        borderRadius: widthPixel(16),
        borderWidth: 1,
        gap: widthPixel(8),
    },
    pillText: {
        fontSize: fontPixel(14),
        fontFamily: 'Medium',
    },
    bottomSheetHeader: {
        padding: widthPixel(16),
        paddingBottom: heightPixel(8),
    },
    bottomSheetContent: {
        paddingHorizontal: widthPixel(16),
        paddingBottom: heightPixel(40),
    },
    bottomSheetTitle: {
        fontSize: fontPixel(18),
        fontFamily: 'Bold',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: heightPixel(16),
        paddingHorizontal: widthPixel(16),
        marginHorizontal: -widthPixel(16),
        borderBottomWidth: 0.3,
        borderBottomColor: colors.dark.misc,
    },
    optionText: {
        fontSize: fontPixel(16),
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
    },
    optionIcon: {
        width: widthPixel(20),
        height: widthPixel(20),
        borderRadius: widthPixel(10),
    },
    optionIconContainer: {
        width: widthPixel(24),
        height: widthPixel(24),
        borderRadius: widthPixel(12),
        backgroundColor: colors.light.lightTint,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapContainer: {
        flex: 1,
    },
    map: {
      height: '60%',
    },
    footer: {
      paddingVertical: widthPixel(16),
      marginTop: heightPixel(16),
    },
    helperText: {
      fontSize: fontPixel(14),
    },
});
