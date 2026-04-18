import CommentItem from '@/components/portfolio/CommentItem';
import CommentItemSkeletonLoader from '@/components/portfolio/Loaders/CommentItemSkeletonLoader';
import PortfolioSkeleton from '@/components/portfolio/Loaders/PortfolioSkeleton';
import Portfolio from '@/components/portfolio/Portfolio';
import { AccentBar, AccentScreenHeader } from '@/components/ui/AccentScreenHeader';
import Button from '@/components/ui/Button';
import EmptyList from '@/components/ui/EmptyList';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP } from '@/constants/navigation/tabRootScrollPadding';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  selectCommentFormIsLoading,
  selectComments,
  selectCommentsIsLoading,
  selectHomePopularPortfolios,
  selectIsLoadingSelectedPortfolio,
  selectPortfolios,
  selectSelectedPortfolio,
} from '@/redux/portfolio/selector';
import { actions } from '@/redux/portfolio/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function PortfolioDetails() {
  const { id } = useLocalSearchParams();
  const portfolioId = Array.isArray(id) ? id[0] : id;
  const portfolios = useAppSelector(selectPortfolios);
  const homePopularPortfolios = useAppSelector(selectHomePopularPortfolios);
  const selectedPortfolio = useAppSelector(selectSelectedPortfolio);
  const isLoadingSelectedPortfolio = useAppSelector(selectIsLoadingSelectedPortfolio);
  const comments = useAppSelector(selectComments);
  const isLoading = useAppSelector(selectCommentsIsLoading);
  const isSubmittingComment = useAppSelector(selectCommentFormIsLoading);
  const dispatch = useAppDispatch();

  const portfolio = useMemo(() => {
    if (!portfolioId) return undefined;
    if (selectedPortfolio?.id === portfolioId) return selectedPortfolio;
    return (
      portfolios.find((p) => p.id === portfolioId) ??
      homePopularPortfolios.find((p) => p.id === portfolioId)
    );
  }, [portfolioId, selectedPortfolio, portfolios, homePopularPortfolios]);

  const colorScheme = useAppTheme();
  const isDark = colorScheme === 'dark';

  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');
  const accentColor = isDark ? colors.dark.white : colors.light.black;
  const textColor = useThemeColor({
    light: colors.light.text,
    dark: colors.dark.text
  }, 'text');

  useEffect(() => {
    if (!portfolioId) return;
    dispatch(actions.fetchPortfolioById(portfolioId));
    dispatch(actions.fetchComments(portfolioId));
    return () => {
      dispatch(actions.clearSelectedPortfolio());
    };
  }, [portfolioId, dispatch]);

  const renderEmptyList = () => {
    if (isLoading || isSubmittingComment) return;
    return (
      <EmptyList
        containerStyle={styles.emptyList}
        message="No comments yet. Be the first to comment."
      >
        <Button
          onPress={() => router.push(`/(tabs)/(search)/(artisan)/(portfolio)/comment?id=${portfolioId}`)}
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
          <View style={styles.commentsHeader}>
            <AccentBar />
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
  }, [portfolio, textColor, isLoading, isSubmittingComment]);

  const renderBody = () => {
    if (portfolio) {
      return (
        <FlashList
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          data={comments}
          renderItem={({ item }) => <CommentItem item={item} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.scrollView}
        />
      );
    }
    if (isLoadingSelectedPortfolio) {
      return (
        <View style={styles.scrollView}>
          <PortfolioSkeleton />
        </View>
      );
    }
    return (
      <EmptyList
        containerStyle={styles.emptyList}
        message="The portfolio you are looking for does not exist."
      />
    );
  };

  return (
    <ScreenLayout style={[styles.container, { backgroundColor }]}>
      <AccentScreenHeader
        onBackPress={() => router.back()}
        title="PORTFOLIO DETAILS"
        titleStyle={{
          fontSize: fontPixel(10),
          fontFamily: 'SemiBold',
          letterSpacing: 1.5,
        }}
      />
      {renderBody()}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  commentsHeader: {
    gap: widthPixel(8),
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: heightPixel(200),
    paddingHorizontal: widthPixel(16),
  },
  container: {
    flex: 1,
  },
  scrollView: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP,
  },
  commentsSection: {
    marginTop: heightPixel(8),
    paddingBottom: heightPixel(20),
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