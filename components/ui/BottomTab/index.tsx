import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ui/Themed/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useMemo } from 'react';

const tabItems = [
    {
        name: '(search)',
        icon: 'home',
        label: 'Home',
    },
    {
        name: '(bookings)',
        icon: 'calendar-outline',
        label: 'Bookings',
    },
    {
        name: '(messaging)',
        icon: 'chatbubble-outline',
        label: 'Messages',
    },
    {
        name: '(settings)',
        icon: 'settings-outline',
        label: 'Settings',
    },
]

export default function BottomTab({ state, navigation }: BottomTabBarProps) {
    const primaryColor = useThemeColor({
      light: colors.light.tint,
      dark: colors.dark.tint,
    }, 'tint');

    const borderTopColor = useThemeColor({
      light: colors.light.lightTint,
      dark: colors.dark.lightTint,
    }, 'lightTint');

    const activeNavItem = useThemeColor({
      light: colors.light.lightTint,
      dark: colors.dark.lightTint,
    }, 'lightTint');

    const iconColor = useThemeColor({
      light: colors.light.secondary,
      dark: colors.dark.secondary,
    }, 'secondary');

    const currentRoute = useMemo(() => {
        return state.routes[state.index].name;
    }, [state.index]);
    
    return (
        <ThemedView 
            lightColor={colors.light.white}
            style={[styles.bottomNav, { borderTopColor }]}
        >
            {
                tabItems.map((item) => (
                    <TouchableOpacity 
                        key={item.name}
                        style={
                            [
                                styles.navItem, 
                                currentRoute === item.name && styles.activeNavItem,
                                currentRoute === item.name && { backgroundColor: activeNavItem }
                            ]
                        }
                        onPress={() => navigation.navigate(item.name)}
                    >
                        <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={24} color={currentRoute === item.name ? primaryColor : iconColor} />
                        {
                            currentRoute === item.name && (
                                <ThemedText type='defaultSemiBold' style={[styles.navText, { color: primaryColor }]}>{item.label}</ThemedText>
                            )
                        }
                    </TouchableOpacity>
                ))
            }
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingTop: heightPixel(16),
        paddingBottom: heightPixel(35),
        borderTopWidth: 1,
        paddingHorizontal: widthPixel(16),  
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: heightPixel(4),
        minWidth: widthPixel(80),
    },
    activeNavItem: {
        paddingHorizontal: widthPixel(20),
        paddingVertical: heightPixel(8),
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
    },
    navText: {
        fontSize: fontPixel(12),
    },
});