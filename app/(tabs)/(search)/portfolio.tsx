import { StyleSheet, View, ScrollView, Image, Text, useColorScheme } from 'react-native';
import React from 'react';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { heightPixel, widthPixel, fontPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import Portfolio from '@/components/portfolio/Portfolio';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import user from "@/assets/images/individual.png";
import BackButton from '@/components/ui/BackButton';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';

// Mock comments data
const COMMENTS = [
  {
    id: '1',
    user: 'Jane Smith',
    comment: 'Amazing work! The attention to detail is impressive.',
    createdAt: '2 hours ago'
  },
  {
    id: '2',
    user: 'Mike Johnson',
    comment: 'Great job! Would love to work with you.',
    createdAt: '5 hours ago'
  }
];

interface CommentItemProps {
  item: typeof COMMENTS[0];
  borderColor: string;
  cardBg: string;
  textColor: string;
  labelColor: string;
}

const CommentItem = ({ item, borderColor, cardBg, textColor, labelColor }: CommentItemProps) => (
  <View style={[styles.commentContainer, { backgroundColor: cardBg, borderColor }]}>
    <View style={[styles.topAccent, { backgroundColor: borderColor }]} />
    <View style={styles.commentContent}>
      <View style={styles.commentHeader}>
        <Image source={user} style={styles.commentAvatar} />
        <View>
          <ThemedText 
            type="defaultSemiBold" 
            style={[styles.authorName, { color: textColor }]}
          >
            {item.user}
          </ThemedText>
          <ThemedText 
            type="subtitle" 
            style={[styles.timestamp, { color: labelColor }]}
            darkColor={colors.dark.secondary}
            lightColor={colors.light.secondary}
          >
            {item.createdAt}
          </ThemedText>
        </View>
      </View>
      <ThemedText 
        style={[styles.commentText, { color: textColor }]}
        darkColor={colors.dark.text}
        lightColor={colors.light.text}
      >
        {item.comment}
      </ThemedText>
    </View>
  </View>
);

export default function PortfolioDetails() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const textColor = useThemeColor({
    light: colors.light.text,
    dark: colors.dark.text
  }, 'text');

  const labelColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary
  }, 'text');

  const accentColor = isDark ? colors.dark.white : colors.light.black;
  const borderColor = accentColor;

  const cardBg = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');

  const portfolio = {
    id: '1',
    title: 'Portfolio 1',
    description: 'Description 1',
    assets: [],
    skills: [],
    likes: 0,
    comments: 0,
    hasLiked: false,
    hasCommented: false,
    createdAt: '2021-01-01',
    updatedAt: '2021-01-01',
    createdBy: '1',
  };

  return (
    <ThemedSafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <BackButton onPress={() => router.back()} iconName="arrow-left" />
      </View>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
          <Text style={[styles.label, { color: labelColor }]}>PORTFOLIO</Text>
        </View>

        <Portfolio portfolio={portfolio} />
        
        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.sectionLabelContainer}>
            <Text style={[styles.sectionLabel, { color: labelColor }]}>COMMENTS</Text>
          </View>
          
          {COMMENTS.length > 0 ? (
            COMMENTS.map(comment => (
              <CommentItem 
                key={comment.id} 
                item={comment} 
                borderColor={borderColor}
                cardBg={cardBg}
                textColor={textColor}
                labelColor={labelColor}
              />
            ))
          ) : (
            <View style={[styles.emptyCard, { borderColor, backgroundColor: cardBg }]}>
              <View style={[styles.emptyAccent, { backgroundColor: borderColor }]} />
              <View style={styles.emptyInner}>
                <Text style={[styles.emptyText, { color: labelColor }]}>
                  No comments yet
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: widthPixel(16),
    paddingVertical: heightPixel(8),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(100),
  },
  header: {
    marginBottom: heightPixel(24),
  },
  accentBar: {
    width: widthPixel(40),
    height: heightPixel(4),
    marginBottom: heightPixel(20),
  },
  label: {
    fontSize: fontPixel(10),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
  },
  commentsSection: {
    marginTop: heightPixel(16),
  },
  sectionLabelContainer: {
    marginBottom: heightPixel(16),
  },
  sectionLabel: {
    fontSize: fontPixel(10),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
  },
  commentContainer: {
    marginBottom: heightPixel(12),
    borderWidth: 0.5,
    borderTopWidth: 0,
    overflow: 'hidden',
  },
  topAccent: {
    height: heightPixel(3),
    width: '100%',
  },
  commentContent: {
    padding: widthPixel(16),
    gap: heightPixel(12),
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(12),
  },
  commentAvatar: {
    width: widthPixel(36),
    height: widthPixel(36),
    borderRadius: 0,
  },
  authorName: {
    fontSize: fontPixel(15),
    fontFamily: 'Bold',
    letterSpacing: -0.3,
  },
  timestamp: {
    fontSize: fontPixel(12),
    fontFamily: 'Regular',
    marginTop: heightPixel(2),
  },
  commentText: {
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
    lineHeight: fontPixel(20),
  },
  emptyCard: {
    borderWidth: 0.5,
    borderTopWidth: 0,
    overflow: 'hidden',
  },
  emptyAccent: {
    height: heightPixel(3),
    width: '100%',
  },
  emptyInner: {
    alignItems: 'center',
    paddingVertical: heightPixel(32),
    paddingHorizontal: widthPixel(24),
  },
  emptyText: {
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
  },
});
