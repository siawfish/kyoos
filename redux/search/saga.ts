import { Location } from '@/redux/auth/types';
import { actions as bookingActions } from '@/redux/booking/slice';
import { actions as portfolioActions } from '@/redux/portfolio/slice';
import { selectSelectedArtisan } from '@/redux/search/selector';
import { actions } from '@/redux/search/slice';
import { InitializeResponse } from '@/redux/search/types';
import { AgentResponse, ConversationStatus } from '@/redux/search/agent-types';
import { request } from '@/services/api';
import { ApiResponse } from '@/services/types';
import { PayloadAction } from '@reduxjs/toolkit';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { selectUserLocation } from '../app/selector';
import {
    MAP_SEARCH_PAGE_LIMIT,
    MAP_SEARCH_RADIUS_METERS,
} from '@/constants/mapSearch';

export function* onInitialize(action: PayloadAction<{lat: number, lng: number}>) {
    try {
        yield put(bookingActions.resetState());
        yield put(actions.resetForInitialize());
        const { data, error, message } : ApiResponse<InitializeResponse> = yield call(request, {
            method: 'GET',
            url: '/api/users/search',
            params: {
                lat: action.payload.lat,
                lng: action.payload.lng,
                limit: MAP_SEARCH_PAGE_LIMIT,
                radiusMeters: MAP_SEARCH_RADIUS_METERS,
            },
        });
        if (error || !data) {
            throw new Error(error || message || 'An error occurred while initializing');
        }
        yield put(actions.setNearestWorkers({
            workers: data.workers,
        }));
    } catch (error:unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred while initializing';
        Toast.show({
            type: 'error',
            text1: 'Initialization failed',
            text2: errorMessage,
        });
    } finally {
        yield put(actions.onInitializeCompleted());
    }
}

export function* fetchMapRegionWorkersSaga(action: PayloadAction<{ lat: number; lng: number }>) {
    try {
        const { data, error, message }: ApiResponse<InitializeResponse> = yield call(request, {
            method: 'GET',
            url: '/api/users/search',
            params: {
                lat: action.payload.lat,
                lng: action.payload.lng,
                limit: MAP_SEARCH_PAGE_LIMIT,
                page: 1,
                radiusMeters: MAP_SEARCH_RADIUS_METERS,
                // Query string must be "false" — axios may omit boolean false from params
                saveHistory: 'false',
            },
        });
        if (error || !data) {
            return;
        }
        yield put(
            actions.appendNearestWorkers({
                workers: data.workers,
            }),
        );
    } catch {
        // Map exploration: avoid toasts on transient failures
    }
}

export function* resetState() {
    yield put(portfolioActions.resetState());
    yield put(bookingActions.resetState());
}

/**
 * Helper to handle navigation after agent completes
 */
function* handleAgentComplete(data: AgentResponse) {
    const selectedArtisan: string | null = yield select(selectSelectedArtisan);

    if (selectedArtisan && data.results) {
        yield put(actions.setDescriptionModalVisible(false));
        yield put(actions.setAiSearchBookingWorker(null));
        yield put(bookingActions.initializeBooking(selectedArtisan));
        yield put(actions.setSelectedArtisan(null));
        router.replace('/(tabs)/(search)/(booking)/booking');
    } else {
        router.replace('/(tabs)/(search)/results');
    }
    yield put(actions.resetAgentConversation());
}

/**
 * Start a new agent conversation
 */
export function* startAgentConversation(action: PayloadAction<string>) {
    try {
        const query = action.payload;
        const location: Location = yield select(selectUserLocation);
        
        console.log('[Agent] Starting conversation with query:', query);
        
        const { data, error, message }: ApiResponse<AgentResponse> = yield call(request, {
            method: 'POST',
            url: '/api/users/agent/start',
            data: {
                query,
                location: location ? {
                    lat: location.lat,
                    lng: location.lng,
                    address: location.address,
                } : undefined,
            },
        });

        console.log('[Agent] Response received:', { status: data?.status, hasResults: !!data?.results, hasQuestion: !!data?.message?.question, error });

        if (error || !data) {
            throw new Error(error || message || 'An error occurred while starting conversation');
        }

        yield put(actions.setAgentConversationResponse(data));
        
        // If conversation completed immediately, handle navigation
        if (data.status === ConversationStatus.COMPLETED && data.results) {
            console.log('[Agent] Conversation completed, navigating to results');
            yield* handleAgentComplete(data);
        } else if (data.status === ConversationStatus.COMPLETED && !data.results) {
            // Non-service task - show message to user
            console.log('[Agent] Non-service task detected');
            const responseMessage = data.message?.content || "I can only help you find skilled workers for home services. Please describe a service you need.";
            
            Toast.show({
                type: 'error',
                text1: 'Agent Error',
                text2: responseMessage,
            });
        } else if (data.status === ConversationStatus.IN_PROGRESS && data.message?.question) {
            console.log('[Agent] Agent has a question, showing bottom sheet');
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        console.log('[Agent] Error:', errorMessage);
        yield put(actions.setAgentConversationError(errorMessage));
        Toast.show({
            type: 'error',
            text1: 'Agent Error',
            text2: errorMessage,
        });
    }
}

/**
 * Continue an existing agent conversation
 */
export function* continueAgentConversation(action: PayloadAction<{
    conversationId: string;
    message?: string;
    selectedOptionId?: string;
    selectedOptionIds?: string[];
}>) {
    try {
        const { conversationId, message, selectedOptionId, selectedOptionIds } = action.payload;
        
        const { data, error, message: errorMsg }: ApiResponse<AgentResponse> = yield call(request, {
            method: 'POST',
            url: '/api/users/agent/continue',
            data: {
                conversationId,
                message,
                selectedOptionId,
                selectedOptionIds,
            },
        });

        if (error || !data) {
            throw new Error(error || errorMsg || 'An error occurred while continuing conversation');
        }

        yield put(actions.setAgentConversationResponse(data));
        
        // If conversation completed, handle navigation
        if (data.status === ConversationStatus.COMPLETED && data.results) {
            yield* handleAgentComplete(data);
        } else if (data.status === ConversationStatus.IN_PROGRESS && data.message?.question) {
            console.log('[Agent] Follow-up question after continue');
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        yield put(actions.setAgentConversationError(errorMessage));
        Toast.show({
            type: 'error',
            text1: 'Agent Error',
            text2: errorMessage,
        });
    }
}

export function* searchSaga() {
    yield takeLatest(actions.onInitialize, onInitialize);
    yield takeLatest(actions.fetchMapRegionWorkers, fetchMapRegionWorkersSaga);
    yield takeLatest(actions.resetState, resetState);
    yield takeLatest(actions.startAgentConversation, startAgentConversation);
    yield takeLatest(actions.continueAgentConversation, continueAgentConversation);
}
