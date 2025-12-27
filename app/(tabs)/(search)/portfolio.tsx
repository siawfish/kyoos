import { StyleSheet, View, ScrollView, Image } from 'react-native';
import React from 'react';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { heightPixel, widthPixel, fontPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import Portfolio from '@/components/portfolio/Portfolio';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import user from "@/assets/images/individual.png";
import { ThemedView } from '@/components/ui/Themed/ThemedView';
import BackButton from '@/components/ui/BackButton';
import { router } from 'expo-router';

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

const CommentItem = ({ item }: { item: typeof COMMENTS[0] }) => (
  <ThemedView 
    style={styles.commentContainer}
  >
    <View style={styles.commentHeader}>
      <Image source={user} style={styles.commentAvatar} />
      <View>
        <ThemedText type="defaultSemiBold">{item.user}</ThemedText>
        <ThemedText 
          type="subtitle" 
          style={styles.timestamp}
        >
          {item.createdAt}
        </ThemedText>
      </View>
    </View>
    <ThemedText 
      style={styles.commentText}
      darkColor={colors.dark.text}
      lightColor={colors.light.text}
    >
      {item.comment}
    </ThemedText>
  </ThemedView>
);

export default function PortfolioDetails() {
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
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} iconName="arrow-left" />
      </View>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Portfolio portfolio={portfolio} />
        
        <View style={styles.commentsSection}>
          <ThemedText type="title" style={styles.commentsTitle}>
            Comments
          </ThemedText>
          
          {COMMENTS.map(comment => (
            <CommentItem key={comment.id} item={comment} />
          ))}
        </View>
      </ScrollView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: widthPixel(16),
    paddingVertical: heightPixel(8),
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: widthPixel(16),
  },
  commentsSection: {
    marginTop: heightPixel(8),
    paddingBottom: heightPixel(100),
  },
  commentsTitle: {
    marginBottom: heightPixel(16),
    fontSize: fontPixel(18),
  },
  commentContainer: {
    marginBottom: heightPixel(16),
    padding: widthPixel(12),
    borderRadius: widthPixel(8),
    elevation: 1,
    shadowColor: colors.light.text,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: heightPixel(8),
    gap: widthPixel(8),
  },
  commentAvatar: {
    width: widthPixel(32),
    height: widthPixel(32),
    borderRadius: widthPixel(16),
  },
  timestamp: {
    fontSize: fontPixel(12),
  },
  commentText: {
    fontSize: fontPixel(14),
  },
}); 