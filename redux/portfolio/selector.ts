import { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';
import { initialState } from './slice';

const selectDomain = (state: RootState) => state?.portfolio || initialState;

export const selectPortfolios = createSelector(
  [selectDomain],
  (portfolio) => portfolio.portfolios
);

export const selectIsLoading = createSelector(
  [selectDomain],
  (portfolio) => portfolio.isLoading
);

export const selectError = createSelector(
  [selectDomain],
  (portfolio) => portfolio.error
);

export const selectComments = createSelector(
  [selectDomain],
  (portfolio) => portfolio.comments
);

export const selectCommentForm = createSelector(
  [selectDomain],
  (portfolio) => portfolio.commentForm
);

export const selectCommentFormIsLoading = createSelector(
  [selectDomain],
  (portfolio) => portfolio.commentForm.isLoading
);

export const selectCommentsIsLoading = createSelector(
  [selectDomain],
  (portfolio) => portfolio.isLoadingComments
);

export const selectIsLikingPortfolio = createSelector(
  [selectDomain],
  (portfolio) => portfolio.isLikingPortfolio
);

export const selectPagination = createSelector(
  [selectDomain],
  (portfolio) => portfolio.pagination
);

export const selectSelectedWorkerId = createSelector(
  [selectDomain],
  (portfolio) => portfolio.selectedWorkerId
);

export const selectHomePopularPortfolios = createSelector(
  [selectDomain],
  (portfolio) => portfolio.homePopularPortfolios ?? initialState.homePopularPortfolios,
);

export const selectHomePopularPagination = createSelector(
  [selectDomain],
  (portfolio) => portfolio.homePopularPagination ?? initialState.homePopularPagination,
);

export const selectIsLoadingHomePopular = createSelector(
  [selectDomain],
  (portfolio) => portfolio.isLoadingHomePopular ?? false,
);

export const selectIsAppendingHomePopular = createSelector(
  [selectDomain],
  (portfolio) => portfolio.isAppendingHomePopular ?? false,
);

export const selectSelectedPortfolio = createSelector(
  [selectDomain],
  (portfolio) => portfolio.selectedPortfolio ?? null,
);

export const selectIsLoadingSelectedPortfolio = createSelector(
  [selectDomain],
  (portfolio) => portfolio.isLoadingSelectedPortfolio ?? false,
);

export const selectSelectedPortfolioError = createSelector(
  [selectDomain],
  (portfolio) => portfolio.selectedPortfolioError ?? null,
);