import SettingsItem from '@/components/settings/SettingItem';
import { AccentScreenHeader } from '@/components/ui/AccentScreenHeader';
import { ConfirmActionSheet } from '@/components/ui/ConfirmActionSheet';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP } from '@/constants/navigation/tabRootScrollPadding';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { actions } from '@/redux/app/slice';
import { useAppDispatch } from '@/store/hooks';
import Constants from 'expo-constants';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HeaderNotificationButton from '@/components/ui/AccentScreenHeader/HeaderNotificationButton';


const settingsSections = [
  {
    title: 'Profile',
    icon: 'person-outline',
    color: colors.light.blue,
    href: '/(tabs)/(settings)/profile',
  },
  {
    title: 'Appearance',
    icon: 'color-palette-outline',
    color: colors.light.purple,
    href: '/(tabs)/(settings)/appearance',
  },
  {
    title: 'Notifications',
    icon: 'notifications-outline',
    color: colors.light.tint,
    href: '/(tabs)/(settings)/notification-settings',
  },
];

const legalSections = [
  {
    title: 'Terms of Use',
    icon: 'document-text-outline',
    color: colors.light.green,
  },
  {
    title: 'Privacy Policy',
    icon: 'shield-checkmark-outline',
    color: colors.light.blue,
  }
]

const deleteAccountSections = [
  {
    title: 'Delete Account',
    icon: 'trash-outline',
    color: colors.light.danger,
  }
]

const SettingsScreen = () => {
  const dispatch = useAppDispatch();
  const theme = useAppTheme();
  const isDark = theme === 'dark';
  
  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');
  const borderColor = isDark ? colors.dark.white : colors.light.black;
  const labelColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary
  }, 'text');
  const cardBg = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');
  
  const [isConfirmLogout, setIsConfirmLogout] = useState(false);
  const [isConfirmDeleteAccount, setIsConfirmDeleteAccount] = useState(false);
  
  const handleDeleteAccount = () => {
    // Implement delete account logic here
    console.log('Delete account pressed');
  };

  return (
    <ScreenLayout style={[styles.container, { backgroundColor }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <AccentScreenHeader
          title="SETTINGS"
          renderRight={()=><HeaderNotificationButton />}
          titleStyle={{
            fontSize: fontPixel(10),
            fontFamily: 'SemiBold',
            letterSpacing: 1.5,
          }}
        />

        <View style={styles.sectionLabelContainer}>
          <Text style={[styles.sectionLabel, { color: labelColor }]}>GENERAL</Text>
        </View>
        <View style={[styles.settingsGroup, { backgroundColor: cardBg, borderColor }]}>
          {settingsSections.map((section, index) => (
            <SettingsItem
              key={index}
              title={section.title}
              icon={section.icon}
              color={section.color}
              borderColor={index !== settingsSections.length - 1 ? borderColor : undefined}
              href={section.href}
            />
          ))}
        </View>

        <View style={styles.sectionLabelContainer}>
          <Text style={[styles.sectionLabel, { color: labelColor }]}>LEGAL</Text>
        </View>
        <View style={[styles.settingsGroup, { backgroundColor: cardBg, borderColor }]}>
          {legalSections.map((section, index) => (
            <SettingsItem
              key={index}
              title={section.title}
              icon={section.icon}
              color={section.color}
              borderColor={index !== legalSections.length - 1 ? borderColor : undefined}
              onPress={() => {}}
            />
          ))}
        </View>

        <View style={styles.sectionLabelContainer}>
          <Text style={[styles.sectionLabel, { color: labelColor }]}>ACCOUNT</Text>
        </View>
        <View style={[styles.settingsGroup, { backgroundColor: cardBg, borderColor }]}>
          {deleteAccountSections.map((section, index) => (
            <SettingsItem
              key={index}
              title={section.title}
              icon={section.icon}
              color={section.color}
              onPress={() => setIsConfirmDeleteAccount(true)}
            />
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: colors.light.danger }]} 
          onPress={() => setIsConfirmLogout(true)}
        >
          <ThemedText 
            style={styles.logoutText} 
            lightColor={colors.light.danger} 
            darkColor={colors.dark.danger}
          >
            LOG OUT
          </ThemedText>
        </TouchableOpacity>
          {
            Constants.expoConfig?.version ? (
              <ThemedText 
                type="subtitle"
                style={styles.versionText}
                lightColor={colors.light.secondary}
                darkColor={colors.dark.secondary}
              >
                Version {Constants.expoConfig?.version}
              </ThemedText>
            ) : null
          }
      </ScrollView>
      <ConfirmActionSheet
        isOpen={isConfirmLogout}
        isOpenChange={setIsConfirmLogout}
        title="Are you sure you want to log out?"
        description="Logging out will remove your account from the app and you will need to sign in again."
        onConfirm={() => dispatch(actions.logout())}
        confirmText="Yes, Log Out"
        cancelText="Cancel"
      />
      <ConfirmActionSheet
        isOpen={isConfirmDeleteAccount}
        isOpenChange={setIsConfirmDeleteAccount}
        title="Are you sure you want to delete your account?"
        description="Deleting your account will remove all your data from the app and you will not be able to sign in again."
        onConfirm={handleDeleteAccount}
        confirmText="Yes, Delete Account"
        cancelText="Cancel"
        icon={<Image source={require('@/assets/images/danger.png')} style={styles.dangerIcon} />}
        confirmButtonStyle={styles.dangerButton}
        confirmTextStyle={styles.dangerText}
      />
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
  sectionLabelContainer: {
    paddingHorizontal: widthPixel(16),
    marginBottom: heightPixel(12),
    marginTop: heightPixel(8),
  },
  sectionLabel: {
    fontSize: fontPixel(10),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
  },
  settingsGroup: {
    marginHorizontal: widthPixel(16),
    marginBottom: heightPixel(16),
    borderWidth: 0.5,
    borderRadius: 0,
    overflow: 'hidden',
  },
  logoutButton: {
    marginHorizontal: widthPixel(16),
    paddingVertical: heightPixel(16),
    paddingHorizontal: widthPixel(16),
    borderWidth: 0.5,
    borderRadius: 0,
    alignItems: 'center',
    marginBottom: heightPixel(16),
  },
  logoutText: {
    fontSize: fontPixel(12),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
  },
  versionText: {
    textAlign: 'center',
    marginTop: heightPixel(8),
    marginBottom: heightPixel(32),
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
  },
  dangerIcon: {
    width: widthPixel(60),
    height: heightPixel(60),
  },
  dangerText: {
    fontFamily: 'Bold',
    color: colors.light.danger,
  },
  dangerButton: {
    backgroundColor: colors.light.dangerBackground,
  },
});

export default SettingsScreen;
