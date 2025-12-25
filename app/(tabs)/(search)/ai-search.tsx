import React, { useEffect, useRef, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Platform, 
  KeyboardAvoidingView, 
  ScrollView, 
  TextInput,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { ThemedView } from '@/components/ui/Themed/ThemedView';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import Button from '@/components/ui/Button';
import BackButton from '@/components/ui/BackButton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectIsLoading, selectMedia, selectSearch } from '../../../redux/search/selector';
import { actions } from '../../../redux/search/slice';
import AttachMedia from '@/components/ui/AttachMedia';
import SpeechToText from '@/components/search/SpeechToText';
import { Media } from '@/redux/app/types';
import MediaCountPreview from '@/components/search/MediaCountPreview';
import LoadingPopover from '@/components/search/LoadingPopover';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const suggestions = [
  "I need a plumber to fix a leaking pipe in my bathroom",
  "Looking for an electrician to install ceiling fans",
  "Need a carpenter to build custom shelves",
  "My air conditioner is not cooling properly",
  "I want to renovate my kitchen",
  "Need help with garden landscaping"
];

export default function AISearchScreen() {  
  const [isTyping, setIsTyping] = useState(false);
  const search = useAppSelector(selectSearch);
  const isLoading = useAppSelector(selectIsLoading);
  const media = useAppSelector(selectMedia);
  const dispatch = useAppDispatch();  
  // Animation refs
  const gradientAnimation = useRef(new Animated.Value(0)).current;
  const sparkleScale = useRef(new Animated.Value(1)).current;
  const sparkleOpacity = useRef(new Animated.Value(0.8)).current;
  const borderAnimation = useRef(new Animated.Value(0)).current;
  const suggestionAnimation = useRef(new Animated.Value(0)).current;
  
  // Theme colors
  const backgroundColor = useThemeColor({
    light: colors.light.white,
    dark: colors.dark.background,
  }, 'white');
  
  const textColor = useThemeColor({
    light: colors.light.text,
    dark: colors.dark.white,
  }, 'text');
  
  const secondaryTextColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary,
  }, 'secondary');

  const cardBackgroundColor = useThemeColor({
    light: colors.light.white,
    dark: colors.dark.grey,
  }, 'white');

  const suggestionCardBackgroundColor = useThemeColor({
    light: colors.light.misc,
    dark: colors.dark.grey,
  }, 'grey');

  const borderColor = useThemeColor({
    light: colors.light.grey,
    dark: colors.dark.grey,
  }, 'grey');

  const characterCountBackgroundColor = useThemeColor({
    light: 'rgba(255, 255, 255, 0.9)',
    dark: 'rgba(0, 0, 0, 0.7)',
  }, 'background');

  const tintColor = useThemeColor({
    light: colors.light.tint,
    dark: colors.dark.tint,
  }, 'tint');

  // Color interpolations for gradient animation
  const animatedColor1 = gradientAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#667eea', '#f093fb']
  });
  
  const animatedColor2 = gradientAnimation.interpolate({
    inputRange: [0, 1], 
    outputRange: ['#764ba2', '#f5576c']
  });



  // Start animations on mount
  useEffect(() => {
    // Gradient color animation
    const gradientLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(gradientAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(gradientAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false,
        }),
      ]),
    );

    // Sparkle animation
    const sparkleLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(sparkleScale, {
            toValue: 1.2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleOpacity, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(sparkleScale, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleOpacity, {
            toValue: 0.8,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );



    // Suggestion cards animation
    Animated.stagger(100, [
      Animated.timing(suggestionAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    gradientLoop.start();
    sparkleLoop.start();

    return () => {
      gradientLoop.stop();
      sparkleLoop.stop();
    };
  }, []);

  const handleTextFocus = () => {
    setIsTyping(true);
    Animated.timing(borderAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleTextBlur = () => {
    setIsTyping(false);
    Animated.timing(borderAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleSearch = () => {
    if (search.trim()) {
      dispatch(actions.onSearch());
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    dispatch(actions.setSearch(suggestion));
  };

  const handleMediaAttach = (media: Media[]) => {
    dispatch(actions.setMedia(media));
  };

  const handleRemoveMedia = () => {
    dispatch(actions.setMedia([]));
  };

  const handleTextReceived = (text: string) => {
    dispatch(actions.setSearch(text));
  };

  const AnimatedSparkles = () => (
    <Animated.View 
      style={[
        styles.sparklesContainer,
        {
          transform: [{ scale: sparkleScale }],
          opacity: sparkleOpacity,
        }
      ]}
    >
      <Ionicons name="sparkles" size={20} color="#ffffff" />
    </Animated.View>
  );

  return (
    <ThemedSafeAreaView style={[styles.container, { backgroundColor: colors.light.tint }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} />
          <ThemedText style={styles.headerTitle} lightColor="#fff" darkColor="#fff">
            Describe Your Need
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>

        {/* Main Content */}
        <ThemedView style={[styles.content, { backgroundColor }]}>
          <ScrollView keyboardDismissMode='on-drag' showsVerticalScrollIndicator={false}>
            {/* AI Header Section */}
            <View style={styles.aiHeader}>
              <AnimatedLinearGradient
                colors={[animatedColor1, animatedColor2]}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.aiIconContainer}
              >
                <AnimatedSparkles />
              </AnimatedLinearGradient>
              <ThemedText style={styles.aiTitle} lightColor={textColor} darkColor={textColor}>
                Tell us what you need
              </ThemedText>
              <ThemedText style={styles.aiSubtitle} lightColor={secondaryTextColor} darkColor={secondaryTextColor}>
                Describe your issue in detail and our AI will find the perfect service provider for you
              </ThemedText>
            </View>

            {/* Animated Text Area */}
            <Animated.View 
              style={[
                styles.textAreaContainer,
                {
                  borderColor: borderAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [borderColor, tintColor]
                  }),
                  backgroundColor: cardBackgroundColor,
                  borderWidth: borderAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2]
                  }),
                }
              ]}
            >

              
              <AnimatedTextInput
                style={[styles.textArea, { color: textColor }, media.length > 0 && { paddingTop: heightPixel(35) }]}
                placeholder="Example: I need a plumber to fix a leaking pipe in my bathroom. The leak started yesterday and water is dripping from under the sink..."
                placeholderTextColor={secondaryTextColor}
                multiline
                value={search}
                onChangeText={(text) => dispatch(actions.setSearch(text))}
                onFocus={handleTextFocus}
                onBlur={handleTextBlur}
                textAlignVertical="top"
                selectionColor={tintColor}
                cursorColor={tintColor}
                autoFocus={true}
              />
              
              {/* Media and Speech buttons */}
              <View style={styles.attachMediaContainer}>
                <View style={styles.actionButtonsRow}>
                  <AttachMedia onChange={handleMediaAttach} />
                  <SpeechToText onTextReceived={handleTextReceived} />
                </View>
              </View>
              
              {/* Media count */}
              {media.length > 0 && (
                <MediaCountPreview media={media} onRemove={handleRemoveMedia} />
              )}
              
              {/* Character count */}
              <View style={[styles.characterCount, { backgroundColor: characterCountBackgroundColor }]}>
                <ThemedText style={styles.characterCountText} lightColor={secondaryTextColor} darkColor={secondaryTextColor}>
                  {search.length}/500
                </ThemedText>
              </View>
            </Animated.View>

            {/* Search Button */}
            <Button
              label="Find My Service Provider"
              onPress={handleSearch}
              style={[styles.searchButton, { opacity: search.trim() ? 1 : 0.5 }]}
              disabled={!search.trim()}
              icon={<Ionicons name="search" size={20} color="#fff" />}
            />

            {/* Suggestion Section */}
            <View style={styles.suggestionsSection}>
              <ThemedText style={styles.suggestionsTitle} lightColor={textColor} darkColor={textColor}>
                Need inspiration? Try these:
              </ThemedText>
              
              <Animated.View 
                style={[
                  styles.suggestionsContainer,
                  {
                    opacity: suggestionAnimation,
                    transform: [{
                      translateY: suggestionAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }]
                  }
                ]}
              >
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.suggestionCard, { 
                      backgroundColor: suggestionCardBackgroundColor,
                      borderColor: borderColor 
                    }]}
                    onPress={() => handleSuggestionPress(suggestion)}
                    activeOpacity={0.7}
                  >
                    <ThemedText style={styles.suggestionText} lightColor={textColor} darkColor={textColor}>
                      {suggestion}
                    </ThemedText>
                    <Ionicons name="chevron-forward" size={16} color={tintColor} />
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>
          </ScrollView>
        </ThemedView>
      </KeyboardAvoidingView>
      
      {/* Loading Popover */}
      <LoadingPopover 
        visible={isLoading}
        title="Searching..."
        subtitle="Finding the perfect service provider for you"
      />
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: widthPixel(16),
    paddingTop: heightPixel(8),
    paddingBottom: heightPixel(16),
  },
  headerTitle: {
    fontSize: fontPixel(18),
    fontFamily: 'CabinetGrotesk-Medium',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: heightPixel(24),
  },
  aiHeader: {
    alignItems: 'center',
    paddingHorizontal: widthPixel(16),
    marginBottom: heightPixel(32),
  },
  aiIconContainer: {
    width: widthPixel(60),
    height: widthPixel(60),
    borderRadius: widthPixel(30),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: heightPixel(16),
    ...Platform.select({
      ios: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  sparklesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    fontSize: fontPixel(24),
    fontFamily: 'CabinetGrotesk-Bold',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: heightPixel(8),
  },
  aiSubtitle: {
    fontSize: fontPixel(16),
    fontFamily: 'CabinetGrotesk-Regular',
    textAlign: 'center',
    lineHeight: fontPixel(22),
  },
  textAreaContainer: {
    marginHorizontal: widthPixel(16),
    marginBottom: heightPixel(24),
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  textArea: {
    minHeight: heightPixel(150),
    maxHeight: heightPixel(230),
    padding: widthPixel(16),
    paddingBottom: heightPixel(50), // Extra padding for AttachMedia button
    fontSize: fontPixel(16),
    fontFamily: 'CabinetGrotesk-Regular',
    lineHeight: fontPixel(22),
    textAlignVertical: 'top',
  },
  characterCount: {
    position: 'absolute',
    bottom: widthPixel(8),
    right: widthPixel(12),
    paddingHorizontal: widthPixel(8),
    paddingVertical: widthPixel(4),
    borderRadius: 8,
  },
  characterCountText: {
    fontSize: fontPixel(12),
    fontFamily: 'CabinetGrotesk-Regular',
  },
  attachMediaContainer: {
    position: 'absolute',
    bottom: widthPixel(8),
    left: widthPixel(12),
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: widthPixel(8),
  },
  searchButton: {
    marginHorizontal: widthPixel(16),
    marginBottom: heightPixel(32),
    height: heightPixel(56),
  },
  suggestionsSection: {
    paddingHorizontal: widthPixel(16),
    marginBottom: heightPixel(24),
  },
  suggestionsTitle: {
    fontSize: fontPixel(18),
    fontFamily: 'CabinetGrotesk-Medium',
    fontWeight: '600',
    marginBottom: heightPixel(16),
  },
  suggestionsContainer: {
    gap: heightPixel(12),
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: widthPixel(16),
    borderRadius: 12,
    borderWidth: 1,
  },
  suggestionText: {
    flex: 1,
    fontSize: fontPixel(14),
    fontFamily: 'CabinetGrotesk-Regular',
    lineHeight: fontPixel(20),
    marginRight: widthPixel(8),
  },
}); 