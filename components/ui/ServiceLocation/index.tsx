import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { ThemedView } from '@/components/ui/Themed/ThemedView';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, widthPixel, heightPixel } from '@/constants/normalize';
import InputField from '@/components/ui/TextInput';
import { ServiceLocationType } from '@/redux/booking/types';

type ServiceLocationProps = {
    scrollViewRef?: React.RefObject<ScrollView>;
    serviceLocationType: ServiceLocationType;
    setServiceLocationType: (serviceLocationType: ServiceLocationType) => void;
}

export default function ServiceLocation({ scrollViewRef, serviceLocationType, setServiceLocationType }: ServiceLocationProps) {

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    const inputBackgroundColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black
    }, 'white');

    const handlePersonPress = () => {
        setServiceLocationType(ServiceLocationType.PERSON);
        // Scroll to bottom after a short delay to ensure the input field is rendered
        setTimeout(() => {
            scrollViewRef?.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    return (
        <ThemedView>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Service Location
            </ThemedText>
            <View style={styles.locationButtons}>
                <View style={styles.locationButtonContainer}>
                    <TouchableOpacity 
                        style={[
                            styles.locationButton,
                            styles.leftBorderRadius,
                            serviceLocationType === ServiceLocationType.SHOP && styles.activeLocationButton,
                            { borderColor: tintColor }
                        ]}
                        onPress={() => setServiceLocationType(ServiceLocationType.SHOP)}
                    >
                        <Feather 
                            name="home" 
                            size={18} 
                            color={serviceLocationType === ServiceLocationType.SHOP ? colors.light.white : tintColor} 
                        />
                        <ThemedText 
                            type="subtitle"
                            style={[
                                styles.locationButtonText,
                                serviceLocationType === ServiceLocationType.SHOP && styles.activeLocationButtonText
                            ]}
                        >
                            In Shop
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[
                            styles.locationButton,
                            styles.rightBorderRadius,
                            serviceLocationType === ServiceLocationType.PERSON && styles.activeLocationButton,
                            { borderColor: tintColor }
                        ]}
                        onPress={handlePersonPress}
                    >
                        <Feather 
                            name="map-pin" 
                            size={18} 
                            color={serviceLocationType === ServiceLocationType.PERSON ? colors.light.white : tintColor} 
                        />
                        <ThemedText 
                            type="subtitle"
                            style={[
                                styles.locationButtonText,
                                serviceLocationType === ServiceLocationType.PERSON && styles.activeLocationButtonText
                            ]}
                        >
                            In Person
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>

            {serviceLocationType === ServiceLocationType.PERSON && (
                <InputField
                    placeholder="Enter location address"
                    style={[styles.input, styles.marginTop, { backgroundColor: inputBackgroundColor }]}
                />
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    sectionTitle: {
        marginBottom: heightPixel(8),
        fontSize: fontPixel(16),
    },
    locationButtons: {
        flexDirection: 'row',
        marginHorizontal: -widthPixel(16),
        paddingHorizontal: widthPixel(16),
    },
    locationButtonContainer: {
        flexDirection: 'row',
        borderRadius: widthPixel(4),
        overflow: 'hidden',
        // marginLeft: widthPixel(16),
        backgroundColor: colors.light.lightTint,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: widthPixel(8),
        gap: widthPixel(8),
        // backgroundColor: colors.light.lightTint,
    },
    rightBorderRadius: {
        borderTopRightRadius: widthPixel(4),
        borderBottomRightRadius: widthPixel(4),
    },
    leftBorderRadius: {
        borderTopLeftRadius: widthPixel(4),
        borderBottomLeftRadius: widthPixel(4),
    },
    activeLocationButton: {
        backgroundColor: colors.light.tint,
        borderRadius: widthPixel(4),
    },
    locationButtonText: {
        fontSize: fontPixel(14),
    },
    activeLocationButtonText: {
        color: colors.light.white,
    },
    marginTop: {
        marginTop: heightPixel(16),
    },
    input: {
        minHeight: heightPixel(48),
        marginHorizontal: widthPixel(-16),
    },
});