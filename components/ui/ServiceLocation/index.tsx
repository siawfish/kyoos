import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppTheme } from '@/hooks/use-app-theme';
import { colors } from '@/constants/theme/colors';
import { ThemedView } from '@/components/ui/Themed/ThemedView';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, widthPixel, heightPixel } from '@/constants/normalize';
import InputField from '@/components/ui/TextInput';
import { ServiceLocationType } from '@/redux/booking/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectServiceLocation, selectIsMapPickerOpen } from '@/redux/booking/selector';
import { actions } from '@/redux/booking/slice';
import { useGoogleAutocomplete, GoogleLocationResult } from '@appandflow/react-native-google-autocomplete';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import LocationMapPicker from './LocationMapPicker';

type ServiceLocationProps = {
    scrollViewRef?: React.RefObject<ScrollView>;
    serviceLocationType: ServiceLocationType;
    setServiceLocationType: (serviceLocationType: ServiceLocationType) => void;
}

export default function ServiceLocation({ scrollViewRef, serviceLocationType, setServiceLocationType }: ServiceLocationProps) {
    const location = useAppSelector(selectServiceLocation);
    const isMapPickerOpen = useAppSelector(selectIsMapPickerOpen);
    const dispatch = useAppDispatch();
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    
    const { locationResults, setTerm, isSearching, searchError, searchDetails } = useGoogleAutocomplete(
        process.env.EXPO_PUBLIC_GOOGLE_API_KEY || '', {
            components: 'country:gh',
            language: 'en',
        }
    );

    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');

    const accentColor = useThemeColor({
        light: colors.light.black,
        dark: colors.dark.white
    }, 'background');

    const borderColor = accentColor;

    const cardBg = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background');

    const inputBackgroundColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black
    }, 'white');

    const inputBackground = useThemeColor({
        light: colors.light.background + '95',
        dark: colors.dark.background + '95',
    }, 'background');

    const activeBgColor = useThemeColor({
        light: colors.light.black,
        dark: colors.dark.white
    }, 'background');

    const activeTextColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black
    }, 'text');

    const inactiveBgColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background');

    const secondaryColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary,
    }, 'secondary');

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    const handlePersonPress = () => {
        setServiceLocationType(ServiceLocationType.PERSON);
        // Scroll to bottom after a short delay to ensure the input field is rendered
        setTimeout(() => {
            scrollViewRef?.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleLocationSelect = (item: GoogleLocationResult) => {
        searchDetails(item.place_id).then((result) => {
            dispatch(actions.setServiceLocation({
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                address: result.formatted_address,
            }));
            setTerm('');
        });
    };

    const handleInputChange = (text: string) => {
        dispatch(actions.setServiceLocation({
            ...location,
            address: text,
        }));
        setTerm(text);
    };

    const handleMapPickerOpen = () => {
        dispatch(actions.openMapPicker());
    };

    const handleSheetChanges = (change: number) => {
        if (change === -1) {
            dispatch(actions.closeMapPicker());
        }
    };

    return (
        <ThemedView>
            <View style={[styles.locationButtonContainer, { backgroundColor: cardBg, borderColor }]}>
                <TouchableOpacity 
                    style={[
                        styles.locationButton,
                        serviceLocationType === ServiceLocationType.SHOP 
                            ? [styles.activeLocationButton, { backgroundColor: activeBgColor }]
                            : [styles.inactiveLocationButton, { backgroundColor: inactiveBgColor }]
                    ]}
                    onPress={() => setServiceLocationType(ServiceLocationType.SHOP)}
                >
                    <Feather 
                        name="home" 
                        size={18} 
                        color={serviceLocationType === ServiceLocationType.SHOP ? activeTextColor : textColor} 
                    />
                    <ThemedText 
                        type="subtitle"
                        style={styles.locationButtonText}
                        darkColor={serviceLocationType === ServiceLocationType.SHOP ? colors.dark.black : colors.dark.text}
                        lightColor={serviceLocationType === ServiceLocationType.SHOP ? colors.light.white : colors.light.text}
                    >
                        IN SHOP
                    </ThemedText>
                </TouchableOpacity>
                <View style={[styles.separator, { backgroundColor: borderColor }]} />
                <TouchableOpacity 
                    style={[
                        styles.locationButton,
                        serviceLocationType === ServiceLocationType.PERSON 
                            ? [styles.activeLocationButton, { backgroundColor: activeBgColor }]
                            : [styles.inactiveLocationButton, { backgroundColor: inactiveBgColor }]
                    ]}
                    onPress={handlePersonPress}
                >
                    <Feather 
                        name="map-pin" 
                        size={18} 
                        color={serviceLocationType === ServiceLocationType.PERSON ? activeTextColor : textColor} 
                    />
                    <ThemedText 
                        type="subtitle"
                        style={styles.locationButtonText}
                        darkColor={serviceLocationType === ServiceLocationType.PERSON ? colors.dark.black : colors.dark.text}
                        lightColor={serviceLocationType === ServiceLocationType.PERSON ? colors.light.white : colors.light.text}
                    >
                        IN PERSON
                    </ThemedText>
                </TouchableOpacity>
            </View>

            {serviceLocationType === ServiceLocationType.PERSON && (
                <View style={styles.marginTop}>
                    <View style={styles.inputContainer}>
                        <InputField
                            value={location?.address || ''}
                            placeholder="Enter location address"
                            onChangeText={handleInputChange}
                            isLoading={isSearching}
                            error={searchError?.message}
                            containerStyle={styles.inputContainerStyle}
                            style={[styles.input, { backgroundColor: inputBackgroundColor, paddingRight: widthPixel(48) }]}
                        />
                        <TouchableOpacity
                            style={[styles.mapButton, { backgroundColor: tintColor }]}
                            onPress={handleMapPickerOpen}
                            activeOpacity={0.7}
                        >
                            <Feather name="map-pin" size={18} color={activeTextColor} />
                        </TouchableOpacity>
                    </View>
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
                                        onPress={() => handleLocationSelect(item)}
                                        activeOpacity={0.7}
                                    >
                                        <Feather name="map-pin" size={16} color={secondaryColor} />
                                        <ThemedText style={[styles.description, { color: textColor }]} numberOfLines={2}>
                                            {item.description}
                                        </ThemedText>
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item) => item.place_id}
                                contentContainerStyle={styles.listContent}
                                style={styles.flashList}
                            />
                        </BlurView>
                    )}
                </View>
            )}
            
            <LocationMapPicker
                isOpen={isMapPickerOpen}
                handleSheetChanges={handleSheetChanges}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    locationButtonContainer: {
        flexDirection: 'row',
        borderWidth: 0.5,
        overflow: 'hidden',
    },
    locationButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: heightPixel(14),
        paddingHorizontal: widthPixel(16),
        gap: widthPixel(8),
    },
    activeLocationButton: {
        // Active state handled by backgroundColor prop
    },
    inactiveLocationButton: {
        // Inactive state handled by backgroundColor prop
    },
    separator: {
        width: 0.5,
    },
    locationButtonText: {
        fontSize: fontPixel(13),
        fontFamily: 'SemiBold',
        letterSpacing: 0.5,
    },
    marginTop: {
        marginTop: heightPixel(16),
        overflow: 'visible',
    },
    input: {
        minHeight: heightPixel(48),
        marginHorizontal: widthPixel(-16),
    },
    inputContainer: {
        position: 'relative',
    },
    inputContainerStyle: {
        marginBottom: 0,
    },
    mapButton: {
        position: 'absolute',
        right: widthPixel(0),
        top: heightPixel(12),
        width: widthPixel(36),
        height: widthPixel(36),
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    listView: {
        width: '100%',
        borderWidth: 0,
        overflow: 'hidden',
        marginTop: heightPixel(4),
        minHeight: heightPixel(180),
        maxHeight: heightPixel(300),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 6,
        zIndex: 1000,
    },
    flashList: {
        flex: 1,
    },
    listContent: {
        paddingBottom: heightPixel(8),
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
});
