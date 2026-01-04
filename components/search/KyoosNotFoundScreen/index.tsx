import BackButton from "@/components/ui/BackButton";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useRouter } from "expo-router";
import { Image, StyleSheet, View } from "react-native";

export default function KyoosNotFoundScreen() {
    const router = useRouter();
    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text');

    const secondaryColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary
    }, 'secondary');

    return (
        <ThemedSafeAreaView style={styles.container}>
            <View style={styles.header}>
                <BackButton
                    iconName="arrow-left"
                    onPress={() => router.back()}
                />
            </View>
            
            <View style={styles.content}>
                <Image 
                    source={require('@/assets/images/empty-list.png')} 
                    style={styles.image}
                    resizeMode="contain"
                />
                <ThemedText style={[styles.title, { color: textColor }]}>
                    Artisan Not Found
                </ThemedText>
                <ThemedText style={[styles.message, { color: secondaryColor }]} type="subtitle">
                    The artisan you're looking for doesn't exist or is no longer available.
                </ThemedText>
            </View>
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(16),
    },
    content: {
        flex: 0.7,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: widthPixel(32),
        gap: heightPixel(24),
    },
    image: {
        width: widthPixel(200),
        height: widthPixel(200),
        marginBottom: heightPixel(16),
    },
    title: {
        fontSize: fontPixel(24),
        fontFamily: 'Bold',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    message: {
        fontSize: fontPixel(16),
        textAlign: 'center',
        lineHeight: fontPixel(24),
        paddingHorizontal: widthPixel(16),
    },
});

