import { Pagination } from '@/services/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { Comment, Portfolio, PortfolioState } from './types';

export const initialState: PortfolioState = {
  portfolios: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },
  comments: [],
  commentForm: {
    comment: '',
    isLoading: false,
  },
  isLikingPortfolio: false,
  isLoadingComments: false,
  isLoading: false,
  error: null,
};

interface RehydrateAction {
  type: typeof REHYDRATE;
  key: string;
  payload: {
    portfolio?: PortfolioState;
  };
}

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    fetchPortfolios: (state, action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
      state.pagination = initialState.pagination;  
    },
    setPortfolios: (state, action: PayloadAction<{ portfolios: Portfolio[], pagination: Pagination }>) => {
      state.portfolios = action.payload.portfolios;
      state.pagination = action.payload.pagination;
      state.comments = []
      state.isLoading = false;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    likePortfolio: (state, action: PayloadAction<string>) => {
      state.isLikingPortfolio = true;
      state.portfolios = state.portfolios.map((portfolio) => {
        if (portfolio.id === action.payload) {
          return { ...portfolio, hasLiked: !portfolio.hasLiked };
        }
        return portfolio;
      });
    },
    setIsLikingPortfolio: (state, action: PayloadAction<boolean>) => {
      state.isLikingPortfolio = action.payload;
    },
    fetchComments: (state, action: PayloadAction<string>) => {
      state.isLoadingComments = true;
    },
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.comments = action.payload;
      state.isLoadingComments = false;
    },
    setCommentsIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoadingComments = action.payload;
    },
    submitComment: (state, action: PayloadAction<string>) => {
      state.commentForm.isLoading = true;
    },
    updateComment: (state, action: PayloadAction<{
      portfolioId: string;
      commentId: string;
    }>) => {
      state.commentForm.isLoading = true;
    },
    deleteComment: (state, action: PayloadAction<{
      commentId: string;
      portfolioId: string;
    }>) => {
      state.commentForm.isLoading = false;
    },
    resetCommentForm: (state) => {
      state.commentForm = initialState.commentForm;
    },
    setCommentFormIsLoading: (state, action: PayloadAction<boolean>) => {
      state.commentForm.isLoading = action.payload;
    },
    setCommentFormValue: (state, action: PayloadAction<string>) => {
      state.commentForm.comment = action.payload;
    },
    resetState: (state) => {
      return {
        ...initialState,
      };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action: RehydrateAction) => {
      if (action.payload?.portfolio) {
        return {
          ...state,
          ...action.payload.portfolio,
        };
      }
      return state;
    });
  },
});

export const { actions, reducer, name: sliceKey } = portfolioSlice; 