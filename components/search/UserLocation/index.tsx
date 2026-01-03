import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { heightPixel, fontPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { selectUserLocation } from "@/redux/app/selector";
import { useAppSelector } from "@/store/hooks";
import { Feather } from "@expo/vector-icons";
import { View, StyleSheet, Pressable } from "react-native";
import { Link } from "expo-router";

export default function UserLocation() {
    const location = useAppSelector(selectUserLocation);
    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');

    const secondaryColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary,
    }, 'secondary');

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    return (
        <View style={styles.locationInfo}>
            <Feather name="map-pin" size={16} color={tintColor} />
            <Link href="/(tabs)/(search)/location" asChild>
                <Pressable style={styles.locationText}>
                    <ThemedText style={[styles.locationLabel, { color: secondaryColor }]}>
                        YOUR LOCATION
                    </ThemedText>
                    <ThemedText style={[styles.locationAddress, { color: textColor }]} numberOfLines={1}>
                        {location?.address}
                    </ThemedText>
                </Pressable>
            </Link>
        </View>
    )
}

const styles = StyleSheet.create({
    locationInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: widthPixel(10),
      flex: 1,
    },
    locationText: {
      flex: 1,
    },
    locationLabel: {
      fontSize: fontPixel(9),
      fontFamily: 'SemiBold',
      letterSpacing: 1.2,
      marginBottom: heightPixel(2),
    },
    locationAddress: {
      fontSize: fontPixel(14),
      fontFamily: 'Medium',
    },  
});