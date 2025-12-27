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

export const selectPortfolioForm = createSelector(
  [selectDomain],
  (portfolio) => portfolio.portfolioForm
);

export const selectPortfolioFormDescription = createSelector(
  [selectDomain],
  (portfolio) => portfolio.portfolioForm.description
);

export const selectPortfolioFormFiles = createSelector(
  [selectDomain],
  (portfolio) => portfolio.portfolioForm.files
);

export const selectPortfolioFormSkills = createSelector(
  [selectDomain],
  (portfolio) => portfolio.portfolioForm.skills
);

export const selectPortfolioFormIsLoading = createSelector(
  [selectDomain],
  (portfolio) => portfolio.portfolioForm.isLoading
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
