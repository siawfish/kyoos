import { StyleSheet, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import HeroSection from '@/components/search/HeroSection';
import UserLocation from '@/components/account/UserLocation';
import ServiceCategories from '@/components/ui/ServiceCategories';
import PopularArtisans from '@/components/search/PopularArtisans';
import TrendingWorks from '@/components/search/TrendingWorks';
import AISearchBar from '@/components/search/AISearchBar';
import { router } from 'expo-router';

export default function HomeScreen() {
  const backgroundColor = useThemeColor({
    light: colors.light.white,
    dark: colors.dark.background,
  }, 'white');

  const primaryColor = useThemeColor({
    light: colors.light.tint,
    dark: colors.dark.tint,
  }, 'tint');

  return (
    <ThemedSafeAreaView style={[styles.container, { backgroundColor: primaryColor }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}
      >
        {/* Location Header */}
        <UserLocation />

        {/* Main Content */}
        <ScrollView 
          style={[styles.content, { backgroundColor: backgroundColor }]}
          showsVerticalScrollIndicator={false}
        >
          {/* AI Search Bar */}
          <AISearchBar 
            onPress={() => router.push('/(tabs)/(search)/ai-search')}
          />

          {/* Hero Section */}
          <HeroSection />

          {/* Service Categories */}
          <ServiceCategories />

          {/* Popular Artisans */}
          <PopularArtisans />

          {/* Trending Works */}
          <TrendingWorks />
        </ScrollView>
        {/* Bottom Navigation */}
      </KeyboardAvoidingView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: heightPixel(24),
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginHorizontal: widthPixel(16),
    padding: widthPixel(12),
    borderRadius: 12,
    gap: widthPixel(8),
    height: heightPixel(40),
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
        elevation: 5,
      },
    }),
  },
  searchText: {
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
  },
});