import { BlurView } from "expo-blur";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { useAppTheme } from "@/hooks/use-app-theme";
import { colors } from "@/constants/theme/colors";
import { Portal } from "@gorhom/portal";
import { ThemedText } from "../Themed/ThemedText";
import { fontPixel, heightPixel } from "@/constants/normalize";

export default function OverlayLoader() {
    const theme = useAppTheme();
    const isDark = theme === 'dark';

    return (
        <Portal>
            <BlurView
                intensity={20}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.loaderContainer}>
                <ActivityIndicator 
                    size="small" 
                    color={isDark ? colors.dark.white : colors.light.black} 
                />
                <ThemedText style={styles.loaderText}>Loading...</ThemedText>
            </View>
        </Portal>
    )
}

const styles = StyleSheet.create({
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        color: colors.light.white,
        fontSize: fontPixel(16),
        textAlign: 'center',
        marginTop: heightPixel(10),
    },
});