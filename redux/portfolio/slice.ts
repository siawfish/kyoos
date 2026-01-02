import { KeyValue, Media } from '@/redux/app/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import { Comment, ContainerState, Portfolio, PortfolioPayload } from './types';

export const initialState: ContainerState = {
  portfolios: [],
  comments: [],
  commentForm: {
    comment: '',
    isLoading: false,
  },
  isLikingPortfolio: false,
  isLoadingComments: false,
  portfolioForm: {
    description: {
      value: '',
      error: '',
    },
    skills: [],
    files: [],
    isLoading: false,
  },
  isLoading: false,
  error: null,
};

interface RehydrateAction {
  type: typeof REHYDRATE;
  key: string;
  payload: {
    portfolio?: ContainerState;
  };
}

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    fetchPortfolios: (state) => {
      state.isLoading = true;
      state.error = null;
      state.portfolioForm = initialState.portfolioForm;
    },
    fetchPortfoliosSilently: (state) => {},
    setPortfolios: (state, action: PayloadAction<Portfolio[]>) => {
      state.portfolios = action.payload;
      state.comments = []
      state.isLoading = false;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setPortfolioFormValue: (state, action: PayloadAction<KeyValue<'description'>>) => {
      state.portfolioForm[action.payload.key].value = action.payload.value;
      state.portfolioForm[action.payload.key].error = '';
    },
    setPortfolioFormErrors: (state, action: PayloadAction<KeyValue<'description'>>) => {
      state.portfolioForm[action.payload.key].error = action.payload.value;
    },
    addPortfolioFiles: (state, action: PayloadAction<Media[]>) => {
      state.portfolioForm.files = [...state.portfolioForm.files, ...action.payload];
    },
    setPortfolioFiles: (state, action: PayloadAction<Media[]>) => {
      state.portfolioForm.files = action.payload;
    },
    removePortfolioFile: (state, action: PayloadAction<string>) => {
      state.portfolioForm.files = state.portfolioForm.files.filter(
        (file) => file.id !== action.payload
      );
    },
    addPortfolioSkills: (state, action: PayloadAction<string[]>) => {
      state.portfolioForm.skills = [...action.payload];
    },
    removePortfolioSkill: (state, action: PayloadAction<string>) => {
      state.portfolioForm.skills = state.portfolioForm.skills.filter(
        (skill) => skill !== action.payload
      );
    },
    submitPortfolioForm: (state, action: PayloadAction<PortfolioPayload>) => {
      state.portfolioForm.isLoading = true;
    },
    updatePortfolio: (state, action: PayloadAction<PortfolioPayload>) => {
      state.portfolioForm.isLoading = true;
    },
    resetPortfolioForm: (state) => {
      state.portfolioForm = initialState.portfolioForm;
    },
    setPortfolioFormIsLoading: (state, action: PayloadAction<boolean>) => {
      state.portfolioForm.isLoading = action.payload;
    },
    deletePortfolio: (state, action: PayloadAction<string>) => {
      state.isLoading = true;
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
    }
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