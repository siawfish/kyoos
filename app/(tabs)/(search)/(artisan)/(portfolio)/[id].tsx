import CommentItem from '@/components/portfolio/CommentItem';
import CommentItemSkeletonLoader from '@/components/portfolio/Loaders/CommentItemSkeletonLoader';
import Portfolio from '@/components/portfolio/Portfolio';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import EmptyList from '@/components/ui/EmptyList';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectCommentFormIsLoading, selectComments, selectCommentsIsLoading, selectPortfolios } from '@/redux/portfolio/selector';
import { actions } from '@/redux/portfolio/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function PortfolioDetails() {
  const { id } = useLocalSearchParams();
  const portfolios = useAppSelector(selectPortfolios);
  const comments = useAppSelector(selectComments);
  const isLoading = useAppSelector(selectCommentsIsLoading);
  const isSubmittingComment = useAppSelector(selectCommentFormIsLoading);
  const dispatch = useAppDispatch();
  const portfolio = portfolios.find((portfolio) => portfolio.id === id);
  const colorScheme = useAppTheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');
  const accentColor = isDark ? colors.dark.white : colors.light.black;
  const labelColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary
  }, 'text');
  const textColor = useThemeColor({
    light: colors.light.text,
    dark: colors.dark.text
  }, 'text');

  useEffect(()=>{
    if(!id) return;
    dispatch(actions.fetchComments(id as string));
  },[id, dispatch])

  const renderEmptyList = () => {
    if (isLoading || isSubmittingComment) return;
    return (
      <EmptyList
        containerStyle={styles.emptyList}
        message="No comments yet. Be the first to comment."
      >
        <Button
          onPress={() => router.push(`/(tabs)/(portfolio)/addComment?id=${id}`)}
          label="ADD COMMENT"
          labelStyle={styles.buttonLabel}
          style={styles.addCommentButton}
        />
      </EmptyList>
    )
  }

  const renderHeader = useCallback(() => {
    return (
      <View>
        <Portfolio 
          portfolio={portfolio!}
          clickable={false}
        />
        <View style={styles.commentsSection}>
          <View>
            <View style={[styles.commentsAccentBar, { backgroundColor: accentColor }]} />
            <ThemedText type="title" style={[styles.commentsTitle, { color: textColor }]}>
              COMMENTS
            </ThemedText>
          </View>

          {
            (isLoading || isSubmittingComment) && (
              <CommentItemSkeletonLoader />
            )
          }
        </View>
      </View>
    )
  }, [portfolio, accentColor, textColor, isLoading, isSubmittingComment]);
  return (
    <ThemedSafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerSection}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} iconName="arrow-left" />
        </View>
        <Text style={[styles.label, { color: labelColor }]}>PORTFOLIO DETAILS</Text>
      </View>
      {
        portfolio ? (
          <FlashList
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            data={comments}
            renderItem={({ item }) => <CommentItem item={item} />}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyList}
            contentContainerStyle={styles.scrollView}
          />
        ) : (
          <EmptyList
            containerStyle={styles.emptyList}
            message="The portfolio you are looking for does not exist."
          />
        )
      }
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: heightPixel(200),
    paddingHorizontal: widthPixel(20),
  },
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(32),
    paddingBottom: heightPixel(20),
  },
  accentBar: {
    width: widthPixel(40),
    height: heightPixel(4),
    marginBottom: heightPixel(20),
  },
  header: {
    marginBottom: heightPixel(8),
  },
  label: {
    fontSize: fontPixel(10),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
  },
  scrollView: {
    paddingHorizontal: widthPixel(20),
    paddingBottom: heightPixel(100),
  },
  commentsSection: {
    marginTop: heightPixel(24),
    paddingBottom: heightPixel(20),
  },
  commentsAccentBar: {
    width: widthPixel(40),
    height: heightPixel(4),
    marginBottom: heightPixel(12),
  },
  commentsTitle: {
    fontSize: fontPixel(14),
    fontFamily: 'Bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  addCommentButton: {
    minWidth: widthPixel(160),
    height: heightPixel(48),
    borderRadius: 0,
  },
  buttonLabel: {
    fontSize: fontPixel(12),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
  },
}); 