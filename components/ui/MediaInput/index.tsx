import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme/colors';
import { ThemedView } from '@/components/ui/Themed/ThemedView';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import AttachMedia from '@/components/ui/AttachMedia';
import { fontPixel, heightPixel } from '@/constants/normalize';

export default function MediaInput() {
    return (
        <ThemedView>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                Media
            </ThemedText>
            <ThemedText 
                lightColor={colors.light.secondary}
                darkColor={colors.dark.secondary}
                style={styles.caption}
            >
                Add photos or videos to help explain the task
            </ThemedText>
            <View style={styles.mediaButton}>
                <AttachMedia />
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    caption: {
        fontSize: fontPixel(14),
        marginBottom: heightPixel(8),
    },
    mediaButton: {
        alignItems: 'flex-start',
    },
    sectionTitle: {
        marginBottom: heightPixel(8),
        fontSize: fontPixel(16),
    },
});