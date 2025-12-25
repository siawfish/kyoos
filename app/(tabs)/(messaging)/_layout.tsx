import { colors } from '@/constants/theme/colors';
import { fontPixel, widthPixel } from '@/constants/normalize';
import { Link, Stack } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color'
import user from "@/assets/images/individual.png";
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ui/Themed/ThemedText';

export default function MessagingLayout() {
  const tintColor = useThemeColor({
    light: colors.light.tint,
    dark: colors.dark.tint,
  }, 'background')
  const iconColor = useThemeColor({
    light: colors.light.black,
    dark: colors.dark.secondary,
  }, 'text')
  return (
    <Stack>
      <Stack.Screen 
        name="messaging" 
        options={{
          headerLargeTitleShadowVisible: false,
          headerLargeTitle: true,
          headerBackVisible: true,
          headerLargeTitleStyle: {
            fontSize: fontPixel(32),
            fontFamily: 'Bold',
          },
          headerSearchBarOptions: {
            placeholder: "Search messages",
            tintColor: tintColor,
          },
          title: "Messages",
          contentStyle: {
            paddingTop: 0
          }
        }}
      />
      <Stack.Screen 
        name="[id]" 
        options={{
          headerTintColor: tintColor,
          headerTitle: ({
            children,
            tintColor
          }) => (
            <View style={styles.headerTitle}>
              <Image source={user} style={{ width: widthPixel(20), height: widthPixel(20), borderRadius: "100%" }} />
              <ThemedText type="subtitle" style={{ textAlign: 'center' }}>{children}</ThemedText>
            </View>
          ),
          headerRight: () => (
            <Link href="/(tabs)/(bookings)/details" asChild>
              <TouchableOpacity>
                <MaterialCommunityIcons name="calendar" size={24} color={iconColor} />
              </TouchableOpacity>
            </Link>
          )
        }}
      />
    </Stack>
  );
}


const styles = StyleSheet.create({
  headerTitle: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  backButton: {
    width: widthPixel(35),
    height: widthPixel(35),
    borderRadius: "100%"
  }
})


