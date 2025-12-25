import { Switch, View,TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { widthPixel, heightPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { ThemedText } from "@/components/ui/Themed/ThemedText";

interface SettingsToggleProps {
    title: string;
    icon: string;
    color: string;
    onToggle: () => void;
    value: boolean;
    disabled?: boolean;
}

const SettingsToggle = ({ title, icon, color, onToggle, value, disabled }: SettingsToggleProps) => {

    return (
        <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon as any} size={22} color={color} />
                </View>
                <ThemedText type="default">{title}</ThemedText>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                style={styles.switch}
                disabled={disabled}
                trackColor={{ false: colors.light.background, true: colors.light.tint }}
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: heightPixel(12),
        paddingHorizontal: widthPixel(16),
    },
    settingsItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: widthPixel(32),
        height: widthPixel(32),
        borderRadius: widthPixel(8),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: widthPixel(12),
    },
    switch: {
        transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    }
});

export default SettingsToggle;
