import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/constants/theme/colors";
import { widthPixel, heightPixel } from "@/constants/normalize";
import { useRouter } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";

interface SettingsItemProps {
    title: string;
    icon: string;
    color: string;
    borderColor?: string;
    href?: string;
    onPress?: () => void;
}

const SettingsItem = ({ title, icon, color, borderColor, href, onPress }: SettingsItemProps) => {
  const router = useRouter();
  const caretColor = useThemeColor({ light: colors.light.secondary, dark: colors.dark.secondary }, 'text');

  return (
    <TouchableOpacity onPress={onPress ? onPress : () => router.push(href as any)} style={[styles.settingsItem, { borderColor: borderColor, borderBottomWidth: borderColor ? 1 : 0 }]}>
      <View style={styles.settingsItemContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon as any} size={22} color={color} />
        </View>
        <ThemedText type="default">{title}</ThemedText>
      </View>
      {
        href && (
          <Ionicons name="chevron-forward" size={20} color={caretColor} />
        )
      }
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
});

export default SettingsItem;
