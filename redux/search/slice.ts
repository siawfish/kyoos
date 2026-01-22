import { Media } from '@/redux/app/types';
import { SearchState, Summary, Worker } from '@/redux/search/types';
import { 
  AgentResponse, 
  ConversationStatus,
} from '@/redux/search/agent-types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

// The initial state of the GithubRepoForm container
export const initialState: SearchState = {
  isInitializing: false,
  isLoading: false,
  search: '',
  media: [],
  summary: {
    estimatedDuration: 0,
    requiredSkills: [],
    requiredTools: [],
    estimatedPrice: '',
    reasoning: '',
  },
  recommendedWorkers: [],
  closestWorkers: [],
  nearestWorkers: [],
  totalNearbyWorkers: 0,
  searchReferenceId: '',
  isUpdatingLocation: false,
  searchModalVisible: false,
  selectedArtisan: null,
  descriptionModalVisible: false,
  // Agent conversation initial state
  agentConversationVisible: false,
  agentConversation: {
    conversationId: null,
    status: null,
    messages: [],
    currentQuestion: null,
    isLoading: false,
    error: null,
    results: null,
  },
}

interface RehydrateAction {
  type: typeof REHYDRATE;
  key: string;
  payload: {
    search?: SearchState;
  };
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    onInitialize: (state, action: PayloadAction<{lat: number, lng: number}>) => {
      state.isInitializing = true;
    },
    onInitializeCompleted: (state) => {
      state.isInitializing = false;
    },
    setNearestWorkers: (state, action: PayloadAction<{workers: Worker[], total: number}>) => {
      state.nearestWorkers = action.payload.workers;
      state.totalNearbyWorkers = action.payload.total;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.search = action.payload;
    },
    setMedia: (state, action: PayloadAction<Media[]>) => {
      state.media = action.payload;
    },
    setSummary: (state, action: PayloadAction<Summary>) => {
      state.summary = action.payload;
    },
    setRecommendedWorkers: (state, action: PayloadAction<Worker[]>) => {
      state.recommendedWorkers = action.payload;
    },
    setClosestWorkers: (state, action: PayloadAction<Worker[]>) => {
      state.closestWorkers = action.payload;
    },
    setSearchReferenceId: (state, action: PayloadAction<string>) => {
      state.searchReferenceId = action.payload;
    },
    setSearchModalVisible: (state, action: PayloadAction<boolean>) => {
      state.searchModalVisible = action.payload;
    },
    setSelectedArtisan: (state, action: PayloadAction<string | null>) => {
      state.selectedArtisan = action.payload;
    },
    setDescriptionModalVisible: (state, action: PayloadAction<boolean>) => {
      state.descriptionModalVisible = action.payload;
    },
    saveUserLocation: (state) => {
      state.isUpdatingLocation = true;
    },
    resetState: (state) => {
      return {
        ...initialState,
      };
    },
    // Agent conversation actions
    startAgentConversation: (state, _action: PayloadAction<string>) => {
      state.agentConversation.isLoading = true;
      state.agentConversation.error = null;
    },
    continueAgentConversation: (state, _action: PayloadAction<{
      conversationId: string;
      message?: string;
      selectedOptionId?: string;
      selectedOptionIds?: string[];
    }>) => {
      state.agentConversation.isLoading = true;
      state.agentConversation.error = null;
    },
    setAgentConversationResponse: (state, action: PayloadAction<AgentResponse>) => {
      state.agentConversation.conversationId = action.payload.conversationId;
      state.agentConversation.status = action.payload.status;
      state.agentConversation.messages = action.payload.messages;
      state.agentConversation.currentQuestion = action.payload.message.question || null;
      state.agentConversation.results = action.payload.results || null;
      state.agentConversation.isLoading = false;
      state.agentConversation.error = null;
      
      // The unified AISearchModal handles all states (loading, question, error) internally
      // Only close the modals when conversation is completed with results
      if (action.payload.status === ConversationStatus.COMPLETED && action.payload.results) {
        // Close both search and description modals when conversation completes
        state.searchModalVisible = false;
        state.descriptionModalVisible = false;
        state.agentConversationVisible = false;
      }
      
      // Update legacy state if we have results
      if (action.payload.results) {
        state.searchReferenceId = action.payload.results.searchReferenceId;
        state.closestWorkers = action.payload.results.closestWorkers;
        state.recommendedWorkers = action.payload.results.recommendedWorkers;
        state.summary = {
          estimatedDuration: action.payload.results.analysis.estimatedDuration,
          requiredSkills: action.payload.results.analysis.requiredSkills,
          requiredTools: action.payload.results.analysis.requiredTools,
          estimatedPrice: action.payload.results.formattedPrice,
          reasoning: action.payload.results.analysis.reasoning,
        };
      }
    },
    setAgentConversationError: (state, action: PayloadAction<string>) => {
      state.agentConversation.isLoading = false;
      state.agentConversation.error = action.payload;
    },
    setAgentConversationVisible: (state, action: PayloadAction<boolean>) => {
      state.agentConversationVisible = action.payload;
    },
    resetAgentConversation: (state) => {
      state.agentConversation = initialState.agentConversation;
      state.agentConversationVisible = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action: RehydrateAction) => {
      // Handle rehydration explicitly
      if (action.payload?.search) {
        return {
          ...state,
          ...action.payload.search
        };
      }
      return state;
    });
  }
});

export const {actions, reducer, name: sliceKey} = searchSlice;
