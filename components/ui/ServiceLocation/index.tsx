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

type ServiceLocationProps = {
    scrollViewRef?: React.RefObject<ScrollView>;
    serviceLocationType: ServiceLocationType;
    setServiceLocationType: (serviceLocationType: ServiceLocationType) => void;
}

export default function ServiceLocation({ scrollViewRef, serviceLocationType, setServiceLocationType }: ServiceLocationProps) {
    const theme = useAppTheme();
    const isDark = theme === 'dark';

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');

    const labelColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary,
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

    const handlePersonPress = () => {
        setServiceLocationType(ServiceLocationType.PERSON);
        // Scroll to bottom after a short delay to ensure the input field is rendered
        setTimeout(() => {
            scrollViewRef?.current?.scrollToEnd({ animated: true });
        }, 100);
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
                <InputField
                    placeholder="Enter location address"
                    style={[styles.input, styles.marginTop, { backgroundColor: inputBackgroundColor }]}
                />
            )}
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
    },
    input: {
        minHeight: heightPixel(48),
        marginHorizontal: widthPixel(-16),
    },
});
