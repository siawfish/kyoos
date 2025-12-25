import { ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { ThemedView } from '@/components/ui/Themed/ThemedView';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import Constants from 'expo-constants';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ConfirmActionSheet } from '@/components/ui/ConfirmActionSheet';
import { useState } from 'react';
import SettingsItem from '@/components/settings/SettingItem';
import { useDispatch } from 'react-redux';
import { actions } from '@/redux/app/slice';

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
    href: '/(tabs)/(settings)/notifications',
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
  const borderColor = useThemeColor({ light: colors.light.grey, dark: colors.dark.background }, 'background');
  const [isConfirmLogout, setIsConfirmLogout] = useState(false);
  const [isConfirmDeleteAccount, setIsConfirmDeleteAccount] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(actions.logout());
  };

  const handleDeleteAccount = () => {
    // Implement delete account logic here
    console.log('Delete account pressed');
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>        
        <ThemedView 
          style={styles.settingsGroup}
          lightColor={colors.light.white}
          darkColor={colors.dark.black}
        >
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
        </ThemedView>

        <ThemedView 
          style={styles.settingsGroup}
          lightColor={colors.light.white}
          darkColor={colors.dark.black}
        >
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
        </ThemedView>

        <ThemedView 
          style={styles.settingsGroup}
          lightColor={colors.light.white}
          darkColor={colors.dark.black}
        >
          {deleteAccountSections.map((section, index) => (
            <SettingsItem
              key={index}
              title={section.title}
              icon={section.icon}
              color={section.color}
              onPress={() => setIsConfirmDeleteAccount(true)}
            />
          ))}
        </ThemedView>

        <TouchableOpacity style={styles.logoutButton} onPress={() => setIsConfirmLogout(true)}>
          <ThemedText style={styles.logoutText} lightColor={colors.light.danger} darkColor={colors.dark.danger}>
            Log Out
          </ThemedText>
        </TouchableOpacity>

        <ThemedText 
          type="subtitle"
          style={styles.versionText}
          lightColor={colors.light.secondary}
          darkColor={colors.dark.secondary}
        >
          Version {Constants.expoConfig?.version || '1.0.0'}
        </ThemedText>
      </ScrollView>
      <ConfirmActionSheet
        isOpen={isConfirmLogout}
        isOpenChange={setIsConfirmLogout}
        title="Are you sure you want to log out?"
        description="Logging out will remove your account from the app and you will need to sign in again."
        onConfirm={handleLogout}
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
    marginTop: heightPixel(20),
    marginBottom: heightPixel(16),
  },
  settingsGroup: {
    marginHorizontal: widthPixel(16),
    marginBottom: heightPixel(32),
    borderRadius: widthPixel(10),
  },
  logoutButton: {
    marginHorizontal: widthPixel(16),
    padding: widthPixel(16),
    borderRadius: widthPixel(10),
    alignItems: 'center',
  },
  logoutText: {
    fontSize: fontPixel(17),
    fontFamily: 'Bold',
  },
  versionText: {
    textAlign: 'center',
    marginTop: heightPixel(8),
    marginBottom: heightPixel(32),
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
