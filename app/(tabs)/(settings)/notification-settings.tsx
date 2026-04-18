import SettingsToggle from "@/components/settings/SettingsToggle";
import { AccentScreenHeader } from "@/components/ui/AccentScreenHeader";
import { ScreenLayout } from "@/components/layout/ScreenLayout";
import { TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP } from "@/constants/navigation/tabRootScrollPadding";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { selectIsUpdatingNotifications, selectUser } from "@/redux/app/selector";
import { actions } from "@/redux/app/slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import BackButton from "@/components/ui/BackButton";
  
const NotificationsScreen = () => {
  const user = useAppSelector(selectUser)
  const dispatch = useAppDispatch()
  const isUpdatingNotifications = useAppSelector(selectIsUpdatingNotifications)
  const theme = useAppTheme()
  const isDark = theme === 'dark'

  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');
  const borderColor = isDark ? colors.dark.white : colors.light.black;
  const cardBg = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');

  const handlePushNotificationToggle = () => {
    dispatch(actions.updateNotifications({
      pushNotification: !user?.settings?.notifications?.pushNotification,
    }))
  }

  return (
    <ScreenLayout style={[styles.container, { backgroundColor }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AccentScreenHeader
          renderRight={()=><BackButton iconName="x" onPress={() => router.back()} />}
          title="NOTIFICATIONS"
          titleStyle={{
            fontSize: fontPixel(10),
            fontFamily: 'SemiBold',
            letterSpacing: 1.5,
          }}
        />

        <View style={[styles.settingsGroup, { backgroundColor: cardBg, borderColor }]}>
          <SettingsToggle
            title="Push Notifications"
            icon="notifications-outline"
            color={colors.light.tint}
            onToggle={handlePushNotificationToggle}
            value={user?.settings?.notifications?.pushNotification as boolean}
            disabled={isUpdatingNotifications}
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
    </ScreenLayout>
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
    paddingBottom: TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP,
  },
  settingsGroup: {
    marginHorizontal: widthPixel(16),
    marginBottom: heightPixel(16),
    borderWidth: 0.5,
    borderRadius: 0,
    overflow: 'hidden',
  },
  descriptionGroup: {
    marginHorizontal: widthPixel(16),
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
