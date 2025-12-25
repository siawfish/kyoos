import { ScrollView, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import { ThemedView } from "@/components/ui/Themed/ThemedView";
import { fontPixel, widthPixel, heightPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import SectionTitle from "@/components/ui/SectionTitle";
import SettingsToggle from "@/components/settings/SettingsToggle";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "@/redux/app/selector";
import { actions } from "@/redux/app/slice";
import { useState } from "react";
  
const NotificationsScreen = () => {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false)

  const handlePushNotificationToggle = () => {
    setIsLoading(true)
    dispatch(actions.updateNotifications({
      pushNotification: !user?.settings?.notifications?.pushNotification,
      callback: () => setIsLoading(false)
    }))
  }
  return (
    <ThemedSafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>  
      <SectionTitle 
          containerStyle={styles.header}
          titleStyle={styles.title}
          subtitleStyle={styles.subtitle}
          subtitle="Manage your notifications settings."
          title="Notifications" 
          icon={null}
      />
        <ThemedView 
          style={styles.settingsGroup}
          lightColor={colors.light.white}
          darkColor={colors.dark.black}
        >
          
          <SettingsToggle
            title="Push Notifications"
            icon="notifications-outline"
            color={colors.light.tint}
            onToggle={handlePushNotificationToggle}
            value={user?.settings?.notifications?.pushNotification as boolean}
            disabled={isLoading}
          />
        </ThemedView>
        <ThemedView style={styles.settingsGroup}>
          <ThemedText 
            type="subtitle"
            style={styles.versionText}
            lightColor={colors.light.secondary}
            darkColor={colors.dark.secondary}
          >
            Select the notifications you want to receive. Push notifications help you stay up to date with important updates, messages, and activity in the app. You can customize which notifications you receive to ensure you only get the updates that matter most to you.
          </ThemedText>
        </ThemedView>
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
    marginTop: heightPixel(20),
  },
  header: {
    marginHorizontal: widthPixel(16),
    marginBottom: heightPixel(32),
  },
  title: {
    fontSize: fontPixel(32),
    fontFamily: 'Bold',
    lineHeight: 38
  },
  subtitle: {
    fontSize: fontPixel(16),
    fontFamily: 'Regular',
    lineHeight: 20
  },
  settingsGroup: {
    marginHorizontal: widthPixel(16),
    marginBottom: heightPixel(32),
    borderRadius: widthPixel(10),
  },
  versionText: {
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
    lineHeight: 20,
    textAlign: 'center'
  }
});

export default NotificationsScreen;