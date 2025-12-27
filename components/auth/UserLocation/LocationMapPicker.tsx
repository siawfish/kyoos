import Button from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { actions } from '@/redux/auth/slice';
import { LocationForm } from '@/redux/auth/types';
import { useAppDispatch } from '@/store/hooks';
import { Portal } from '@gorhom/portal';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import MapView, { Marker } from 'react-native-maps';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.8;

interface LocationMapPickerProps {
    onLocationSelect: (location: LocationForm) => void;
    onClose: () => void;
    isOpen: boolean;
    handleSheetChanges?: (index: number) => void;
    onReverseGeocode?: (latlng: string, callback: (loc: LocationForm) => void) => void;
}

const INITIAL_REGION = {
  latitude: 5.5560,
  longitude: -0.1969,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
}

const LocationMapPicker = ({
    onLocationSelect,
    onClose,
    isOpen,
    handleSheetChanges,
    onReverseGeocode: propOnReverseGeocode,
}: LocationMapPickerProps) => {
    const translateY = useSharedValue(0);
    const context = useSharedValue({ y: 0 });
    const active = useSharedValue(false); 
    const [selectedLocation, setSelectedLocation] = useState<{
      latitude: number;
      longitude: number;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();
  
    const handleMapPress = (e: any) => {
      setSelectedLocation(e.nativeEvent.coordinate);
    };
  
    const handleConfirm = () => {
      if (selectedLocation) {
        setIsLoading(true);
        const callback = (loc: LocationForm) => {
          onLocationSelect(loc);
          onClose();
          setIsLoading(false);
        };
        
        if (propOnReverseGeocode) {
          propOnReverseGeocode(
            `${selectedLocation.latitude},${selectedLocation.longitude}`,
            callback
          );
        } else {
          // Default to Redux action (backward compatibility)
          dispatch(actions.reverseGeocodeLocation({
            latlng: `${selectedLocation.latitude},${selectedLocation.longitude}`,
            callback,
          }));
        }
      }
    };

    const backgroundColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background,
    }, 'background');

    const borderColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint
    }, 'tint');

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
        <>
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
            <Portal>
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
                          initialRegion={INITIAL_REGION}
                        >
                          {selectedLocation && (
                            <Marker
                              coordinate={selectedLocation}
                            />
                          )}
                        </MapView>
                        <View style={styles.footer}>
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
        </>
    );
}

export default LocationMapPicker;

const styles = StyleSheet.create({
    bottomSheetContainer: {
        height: SCREEN_HEIGHT,
        width: '100%',
        position: 'absolute',
        top: SCREEN_HEIGHT,
        borderRadius: 0,
        zIndex: 100,
    },
    line: {
        width: 75,
        height: 4,
        backgroundColor: 'grey',
        alignSelf: 'center',
        marginVertical: 15,
        borderRadius: 0,
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
        borderRadius: 0,
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
        borderRadius: 0,
    },
    optionIconContainer: {
        width: widthPixel(24),
        height: widthPixel(24),
        borderRadius: 0,
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

