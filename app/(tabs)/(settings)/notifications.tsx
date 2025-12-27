import SettingsToggle from "@/components/settings/SettingsToggle";
import BackButton from "@/components/ui/BackButton";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { selectUser } from "@/redux/app/selector";
import { actions } from "@/redux/app/slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
  
const NotificationsScreen = () => {
  const user = useAppSelector(selectUser)
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');
  const accentColor = isDark ? colors.dark.white : colors.light.black;
  const borderColor = accentColor;
  const labelColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary
  }, 'text');
  const cardBg = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');

  const handlePushNotificationToggle = () => {
    setIsLoading(true)
    dispatch(actions.updateNotifications({
      pushNotification: !user?.settings?.notifications?.pushNotification,
      callback: () => setIsLoading(false)
    }))
  }

  return (
    <ThemedSafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
          <View style={styles.header}>
            <BackButton onPress={() => router.back()} iconName="arrow-left" />
          </View>
          <Text style={[styles.label, { color: labelColor }]}>NOTIFICATIONS</Text>
        </View>

        <View style={[styles.settingsGroup, { backgroundColor: cardBg, borderColor }]}>
          <SettingsToggle
            title="Push Notifications"
            icon="notifications-outline"
            color={colors.light.tint}
            onToggle={handlePushNotificationToggle}
            value={user?.settings?.notifications?.pushNotification as boolean}
            disabled={isLoading}
          />
        </View>

        <View style={[styles.descriptionGroup, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText 
            style={styles.descriptionText}
            lightColor={colors.light.secondary}
            darkColor={colors.dark.secondary}
          >
            Select the notifications you want to receive. Push notifications help you stay up to date with important updates, messages, and activity in the app. You can customize which notifications you receive to ensure you only get the updates that matter most to you.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: heightPixel(100),
  },
  headerSection: {
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(32),
    paddingBottom: heightPixel(20),
  },
  accentBar: {
    width: widthPixel(40),
    height: heightPixel(4),
    marginBottom: heightPixel(20),
  },
  header: {
    marginBottom: heightPixel(16),
  },
  label: {
    fontSize: fontPixel(10),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
  },
  settingsGroup: {
    marginHorizontal: widthPixel(20),
    marginBottom: heightPixel(16),
    borderWidth: 0.5,
    borderRadius: 0,
    overflow: 'hidden',
  },
  descriptionGroup: {
    marginHorizontal: widthPixel(20),
    marginBottom: heightPixel(16),
    borderWidth: 0.5,
    borderRadius: 0,
    padding: widthPixel(16),
  },
  descriptionText: {
    fontSize: fontPixel(15),
    fontFamily: 'Regular',
    lineHeight: fontPixel(22),
  },
});

export default NotificationsScreen;
