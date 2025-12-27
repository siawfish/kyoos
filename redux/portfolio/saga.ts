import { request } from '@/services/api';
import { ApiResponse } from '@/services/types';
import { PayloadAction } from '@reduxjs/toolkit';
import Toast from 'react-native-toast-message';
import { call, delay, put, select, takeLatest } from 'redux-saga/effects';
import { selectCommentForm } from './selector';
import { actions } from './slice';
import { Comment, CommentForm, Portfolio, PortfolioPayload } from './types';
import { MimeType } from '@/redux/app/types';

// Mock portfolio data
const MOCK_PORTFOLIOS: Portfolio[] = [
  {
    id: '1',
    description: 'Professional house cleaning service completed for a 3-bedroom apartment in East Legon. Deep cleaning of all rooms including kitchen and bathrooms.',
    assets: [
      {
        id: 'img1',
        uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
        width: 800,
        height: 600,
        type: MimeType.JPEG,
      },
      {
        id: 'img2',
        uri: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800',
        width: 800,
        height: 600,
        type: MimeType.JPEG,
      },
    ],
    skills: ['Cleaning', 'Organization', 'Deep Cleaning'],
    likes: 24,
    comments: 5,
    hasLiked: false,
    hasCommented: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user1',
  },
  {
    id: '2',
    description: 'Electrical installation project: Installed ceiling fans in living room and bedroom. All wiring completed according to safety standards.',
    assets: [
      {
        id: 'img3',
        uri: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800',
        width: 800,
        height: 600,
        type: MimeType.JPEG,
      },
      {
        id: 'img4',
        uri: 'https://images.unsplash.com/photo-1622122247344-9f0d1e9b2e5a?w=800',
        width: 800,
        height: 600,
        type: MimeType.JPEG,
      },
      {
        id: 'img5',
        uri: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800',
        width: 800,
        height: 600,
        type: MimeType.JPEG,
      },
    ],
    skills: ['Electrical', 'Wiring', 'Installation'],
    likes: 42,
    comments: 8,
    hasLiked: true,
    hasCommented: true,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user1',
  },
  {
    id: '3',
    description: 'Plumbing repair and maintenance work. Fixed leaking pipes and installed new faucets in kitchen and bathroom.',
    assets: [
      {
        id: 'img6',
        uri: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800',
        width: 800,
        height: 600,
        type: MimeType.JPEG,
      },
    ],
    skills: ['Plumbing', 'Repair', 'Maintenance'],
    likes: 18,
    comments: 3,
    hasLiked: false,
    hasCommented: false,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user1',
  },
  {
    id: '4',
    description: 'Complete kitchen cabinet installation project. Custom-built cabinets with modern design and quality materials.',
    assets: [
      {
        id: 'img7',
        uri: 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800',
        width: 800,
        height: 600,
        type: MimeType.JPEG,
      },
      {
        id: 'img8',
        uri: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
        width: 800,
        height: 600,
        type: MimeType.JPEG,
      },
    ],
    skills: ['Carpentry', 'Installation', 'Custom Work'],
    likes: 56,
    comments: 12,
    hasLiked: true,
    hasCommented: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user1',
  },
  {
    id: '5',
    description: 'Painting service for entire apartment interior. 3 bedrooms, living room, and kitchen. Used premium paint with excellent finish.',
    assets: [
      {
        id: 'img9',
        uri: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800',
        width: 800,
        height: 600,
        type: MimeType.JPEG,
      },
      {
        id: 'img10',
        uri: 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
        width: 800,
        height: 600,
        type: MimeType.JPEG,
      },
    ],
    skills: ['Painting', 'Interior Design', 'Color Consultation'],
    likes: 31,
    comments: 7,
    hasLiked: false,
    hasCommented: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'user1',
  },
];

export function* fetchPortfolios() {
  try {
    // Simulate API call delay
    yield delay(500);
    
    // Use mock data instead of API call
    yield put(actions.setPortfolios(MOCK_PORTFOLIOS));
    
    // Uncomment below to use actual API call instead of mock data
    // const response: ApiResponse<Portfolio[]> = yield call(request, {
    //   method: 'GET',
    //   url: `/api/workers/portfolio`,
    // })
    // if (response.error || !response.data) {
    //   throw new Error(response.message || response.error || 'An error occurred while fetching portfolios');
    // }
    // yield put(actions.setPortfolios(response.data));
  } catch (error: any) {
    const errorMessage = error?.error || error?.message || 'Failed to fetch portfolios';
    yield put(actions.setError(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  }
}

export function* onSubmitPortfolio(action: PayloadAction<PortfolioPayload>) {
  try {
    yield delay(500);
    const response: ApiResponse<Portfolio> = yield call(request, {
      method: 'POST',
      url: `/api/workers/portfolio`,
      data: action.payload,
    })
    if (response.error || !response.data) {
      throw new Error(response.message || response.error || 'An error occurred while submitting portfolio');
    }
    yield put(actions.resetPortfolioForm());
    yield put(actions.fetchPortfolios());
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Portfolio item created successfully',
    });
  } catch (error: any) {
    const errorMessage = error?.error || error?.message || 'Failed to submit portfolio';
    yield put(actions.setError(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  } finally {
    yield put(actions.setPortfolioFormIsLoading(false));
  }
}

export function* deletePortfolio(action: PayloadAction<string>) {
  try {
    yield delay(500);
    const response: ApiResponse<Portfolio> = yield call(request, {
      method: 'DELETE',
      url: `/api/workers/portfolio/${action.payload}`,
    })
    if (response.error) {
      throw new Error(response.message || response.error || 'An error occurred while deleting portfolio');
    }
    yield put(actions.fetchPortfolios());
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Portfolio deleted successfully',
    });
  } catch (error: any) {
    const errorMessage = error?.error || error?.message || 'Failed to delete portfolio';
    yield put(actions.setError(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  }
}

export function* fetchComments(action: PayloadAction<string>) {
  try {
    yield delay(500);
    const response: ApiResponse<Comment[]> = yield call(request, {
      method: 'GET',
      url: `/api/workers/portfolio/${action.payload}/comments`,
    })
    if (response.error || !response.data) {
      throw new Error(response.message || response.error || 'An error occurred while fetching comments');
    }
    yield put(actions.setComments(response.data));
  } catch (error: any) {
    const errorMessage = error?.error || error?.message || 'Failed to fetch comments';
    yield put(actions.setError(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  } finally {
    yield put(actions.setCommentsIsLoading(false));
  }
}

export function* submitComment(action: PayloadAction<string>) {
  try {
    yield delay(500);
    const commentForm: CommentForm = yield select(selectCommentForm);
    const response: ApiResponse<Comment> = yield call(request, {
      method: 'POST',
      url: `/api/workers/portfolio/${action.payload}/comment`,
      data: {
        comment: commentForm.comment,
      },
    })
    if (response.error) {
      throw new Error(response.message || response.error || 'An error occurred while submitting comment');
    }
    yield put(actions.resetCommentForm());
    yield put(actions.fetchComments(action.payload));
    yield put(actions.fetchPortfoliosSilently());
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Comment submitted successfully',
    });
  } catch (error: any) {
    const errorMessage = error?.error || error?.message || 'Failed to submit comment';
    yield put(actions.setError(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  } finally {
    yield put(actions.setCommentFormIsLoading(false));
  }
}

export function* likePortfolio(action: PayloadAction<string>) {
  try {
    yield delay(500);
    const response: ApiResponse<Portfolio> = yield call(request, {
      method: 'POST',
      url: `/api/workers/portfolio/${action.payload}/like`,
    })
    if (response.error) {
      throw new Error(response.message || response.error || 'An error occurred while liking portfolio');
    }
    yield put(actions.fetchPortfoliosSilently());
  } catch (error: any) {
    const errorMessage = error?.error || error?.message || 'Failed to like portfolio';
    yield put(actions.setError(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  } finally {
    yield put(actions.setIsLikingPortfolio(false));
  }
}

export function* updatePortfolio(action: PayloadAction<PortfolioPayload>) {
  try {
    yield delay(500);
    const response: ApiResponse<Portfolio> = yield call(request, {
      method: 'PUT',
      url: `/api/workers/portfolio/${action.payload.id}`,
      data: action.payload,
    })
    if (response.error || !response.data) {
      throw new Error(response.message || response.error || 'An error occurred while updating portfolio');
    }
    yield put(actions.resetPortfolioForm());
    yield put(actions.fetchPortfolios());
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Portfolio updated successfully',
    });
  } catch (error: any) {
    const errorMessage = error?.error || error?.message || 'Failed to update portfolio';
    yield put(actions.setError(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  } finally {
    yield put(actions.setPortfolioFormIsLoading(false));
  }
}

export function* updateComment(action: PayloadAction<{
  portfolioId: string;
  commentId: string;
}>) {
  try {
    yield delay(500);
    const commentForm: CommentForm = yield select(selectCommentForm);
    const response: ApiResponse<Comment> = yield call(request, {
      method: 'PUT',
      url: `/api/workers/portfolio/comment/${action.payload.commentId}`,
      data: {
        comment: commentForm.comment,
      },
    })
    if (response.error || !response.data) {
      throw new Error(response.message || response.error || 'An error occurred while updating comment');
    }
    yield put(actions.resetCommentForm());
    yield put(actions.fetchComments(action.payload.portfolioId));
  } catch (error: any) {
    const errorMessage = error?.error || error?.message || 'Failed to update comment';
    yield put(actions.setError(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  }
}

export function* deleteComment(action: PayloadAction<{
  portfolioId: string;
  commentId: string;
}>) {
  try {
    yield delay(500);
    const response: ApiResponse<Comment> = yield call(request, {
      method: 'DELETE',
      url: `/api/workers/portfolio/comment/${action.payload.commentId}`,
    })
    if (response.error) {
      throw new Error(response.message || response.error || 'An error occurred while deleting comment');
    }
    yield put(actions.fetchComments(action.payload.portfolioId));
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Comment deleted successfully',
    });
  } catch (error: any) {
    const errorMessage = error?.error || error?.message || 'Failed to delete comment';
    yield put(actions.setError(errorMessage));
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  }
}
export function* portfolioSaga() {
  yield takeLatest(actions.fetchPortfolios, fetchPortfolios);
  yield takeLatest(actions.fetchPortfoliosSilently, fetchPortfolios);
  yield takeLatest(actions.submitPortfolioForm, onSubmitPortfolio);
  yield takeLatest(actions.deletePortfolio, deletePortfolio);
  yield takeLatest(actions.fetchComments, fetchComments);
  yield takeLatest(actions.submitComment, submitComment);
  yield takeLatest(actions.likePortfolio, likePortfolio);
  yield takeLatest(actions.updatePortfolio, updatePortfolio);
  yield takeLatest(actions.updateComment, updateComment);
  yield takeLatest(actions.deleteComment, deleteComment);
} 