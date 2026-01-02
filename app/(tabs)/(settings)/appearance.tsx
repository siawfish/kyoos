import SettingsToggle from "@/components/settings/SettingsToggle";
import BackButton from "@/components/ui/BackButton";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { selectIsUpdatingTheme } from "@/redux/app/selector";
import { actions } from "@/redux/app/slice";
import { Theme } from "@/redux/app/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { router } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";


const AppearanceScreen = () => {
  const isUpdatingTheme = useAppSelector(selectIsUpdatingTheme)
  const theme = useAppTheme()
  const isDark = theme === 'dark'
  const dispatch = useAppDispatch()

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

  const isDarkMode = useMemo(() => {
    return theme === 'dark'
  }, [theme])

  const handleThemeChange = () => {
    const theme = isDarkMode ? Theme.LIGHT : Theme.DARK
    dispatch(actions.updateTheme({
      theme,
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
          <Text style={[styles.label, { color: labelColor }]}>APPEARANCE</Text>
        </View>

        <View style={[styles.settingsGroup, { backgroundColor: cardBg, borderColor }]}>
          <SettingsToggle
            title="Dark Mode"
            icon="moon"
            color={colors.light.tint}
            onToggle={handleThemeChange}
            value={isDarkMode}
            disabled={isUpdatingTheme}
          />
        </View>

        <View style={[styles.descriptionGroup, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText 
            style={styles.descriptionText}
            lightColor={colors.light.secondary}
            darkColor={colors.dark.secondary}
          >
            Select the theme you want to use. Dark mode provides a sleek, eye-friendly interface that&apos;s perfect for low-light environments, while light mode offers a classic, bright experience.
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
    paddingHorizontal: widthPixel(16),
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

export default AppearanceScreen;
