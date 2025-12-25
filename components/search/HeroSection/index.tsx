import React from 'react';
import { View, Image, StyleSheet, Platform } from 'react-native';
import { widthPixel, heightPixel, fontPixel } from '@/constants/normalize';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import Button from '@/components/ui/Button';

export default function HeroSection() {
    const primaryColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    const secondaryColor = useThemeColor({
      light: colors.light.lightTint,
      dark: colors.dark.lightTint,
    }, 'tint');
    return (
        <View style={[styles.heroSection, { backgroundColor: primaryColor }]}>
            <View style={styles.heroContent}>
                <ThemedText type='title' style={styles.heroTitle}>YOUR SOLUTION, ONE{'\n'}TAP AWAY!</ThemedText>
                <ThemedText type='subtitle' style={styles.heroSubtitle}>Seamless, Fast & Reliable{'\n'}Services at Your Fingertips</ThemedText>
                <Button 
                    style={styles.exploreButton} 
                    lightBackgroundColor={colors.light.white}
                    darkBackgroundColor={colors.dark.black}
                    label='Explore' 
                    labelStyle={styles.exploreButtonText}
                />
            </View>
            <View style={[styles.heroImage, { backgroundColor: secondaryColor, borderRadius: 8 }]}>
                <Image source={require('@/assets/images/handymen.png')} style={styles.heroImage} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  heroSection: {
    margin: widthPixel(16),
    borderRadius: 16,
    padding: widthPixel(20),
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(16),
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: fontPixel(16),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: heightPixel(8),
  },
  heroSubtitle: {
    fontSize: fontPixel(14),
    color: '#fff',
    opacity: 0.8,
    marginBottom: heightPixel(10),
    lineHeight: fontPixel(20),
  },
  exploreButton: {
    paddingHorizontal: widthPixel(20),
    paddingVertical: heightPixel(0),
    height: heightPixel(40),
    marginHorizontal: widthPixel(0),
    borderRadius: 8,
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: "transparent",
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  exploreButtonText: {
    fontSize: fontPixel(14),
    color: colors.light.tint,
  },
  heroImage: {
    width: widthPixel(140),
    height: widthPixel(140),
  }
});