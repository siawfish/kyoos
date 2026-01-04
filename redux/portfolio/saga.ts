import { request } from '@/services/api';
import { ApiResponse } from '@/services/types';
import { PayloadAction } from '@reduxjs/toolkit';
import Toast from 'react-native-toast-message';
import { call, delay, put, select, takeLatest } from 'redux-saga/effects';
import { selectCommentForm } from './selector';
import { actions } from './slice';
import { Comment, CommentForm, Portfolio, PortfoliosResponse } from './types';

export function* fetchPortfolios(action: PayloadAction<string>) {
  try {
    const response: ApiResponse<PortfoliosResponse> = yield call(request, {
      method: 'GET',
      url: `/api/users/portfolio/worker/${action.payload}`,
    })
    if (response.error || !response.data) {
      throw new Error(response.message || response.error || 'An error occurred while fetching portfolios');
    }
    yield put(actions.setPortfolios({
      portfolios: response.data.portfolios,
      pagination: response.data.pagination,
    }));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch portfolios';
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
    const response: ApiResponse<Portfolio> = yield call(request, {
      method: 'POST',
      url: `/api/workers/portfolio/${action.payload}/like`,
    })
    if (response.error) {
      throw new Error(response.message || response.error || 'An error occurred while liking portfolio');
    }
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
  yield takeLatest(actions.fetchPortfolios.type, fetchPortfolios);
  yield takeLatest(actions.fetchComments, fetchComments);
  yield takeLatest(actions.submitComment, submitComment);
  yield takeLatest(actions.likePortfolio, likePortfolio);
  yield takeLatest(actions.updateComment, updateComment);
  yield takeLatest(actions.deleteComment, deleteComment);
} 