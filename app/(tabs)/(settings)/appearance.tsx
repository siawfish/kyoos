import { ScrollView, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import { ThemedView } from "@/components/ui/Themed/ThemedView";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import SectionTitle from "@/components/ui/SectionTitle";
import SettingsToggle from "@/components/settings/SettingsToggle";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from "@/redux/app/selector";
import { Theme } from "@/redux/app/types";
import { actions } from "@/redux/app/slice";
import { useMemo, useState } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme.web";

const AppearanceScreen = () => {
  const user = useSelector(selectUser)
  const [isLoading, setIsLoading] = useState(false)
  const colorScheme = useColorScheme()
  const dispatch = useDispatch()

  const isDarkMode = useMemo(() => {
    if(user?.settings?.theme === Theme.SYSTEM) {
      return colorScheme === 'dark'
    }
    return user?.settings?.theme === Theme.DARK
  }, [colorScheme, user?.settings?.theme])

  const handleThemeChange = () => {
    setIsLoading(true)
    const theme = isDarkMode ? Theme.LIGHT : Theme.DARK
    dispatch(actions.updateTheme({
      theme,
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
          subtitle="Manage your appearance settings."
          title="Appearance" 
          icon={null}
      />
        <ThemedView 
          style={styles.settingsGroup}
          lightColor={colors.light.white}
          darkColor={colors.dark.black}
        >
          
          <SettingsToggle
            title="Dark Mode"
            icon="moon"
            color={colors.light.purple}
            onToggle={handleThemeChange}
            value={isDarkMode}
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
                  Select the theme you want to use. Dark mode provides a sleek, eye-friendly interface that&apos;s perfect for low-light environments, while light mode offers a classic, bright experience.
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

export default AppearanceScreen;