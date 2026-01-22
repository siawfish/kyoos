import { AcceptedTerms, Media, Settings, UserTypes } from "@/redux/app/types";
import { Location } from "@/redux/auth/types";
import { Pagination } from "@/services/types";
import { 
    ConversationId, 
    ConversationStatus, 
    ConversationMessage, 
    AgentQuestion, 
    AgentSearchResults 
} from "./agent-types";

export interface SearchState {
    isInitializing: boolean;
    search: string;
    isLoading: boolean;
    media: Media[];
    summary: Summary;
    recommendedWorkers: Worker[];
    closestWorkers: Worker[];
    nearestWorkers: Worker[];
    totalNearbyWorkers: number;
    isUpdatingLocation: boolean;
    searchReferenceId: string;
    searchModalVisible: boolean;
    selectedArtisan: string | null;
    descriptionModalVisible: boolean;
    // Agent conversation state
    agentConversationVisible: boolean;
    agentConversation: {
        conversationId: ConversationId | null;
        status: ConversationStatus | null;
        messages: ConversationMessage[];
        currentQuestion: AgentQuestion | null;
        isLoading: boolean;
        error: string | null;
        results: AgentSearchResults | null;
    };
}

export interface Summary {
    estimatedDuration: number;
    requiredSkills: Skill[];
    requiredTools: string[];
    estimatedPrice: string | number;
    reasoning: string;
}
  
export interface SearchResponse {
    reasoning: string;
    estimatedDuration: number;
    estimatedPrice: string;
    requiredSkills: Skill[];
    requiredTools: string[];
    closestWorkers: Worker[];
    recommendedWorkers: Worker[];
    searchReferenceId: string;
}

export interface Skill {
    id: string;
    name: string;
    icon?: string; // Optional in some contexts (e.g., inside Worker.skills)
    workerId?: string;
    skillId?: string;
    rate?: number;
    yearsOfExperience?: number;
    updatedAt?: string;
}

export interface Worker {
    id: string;
    name: string;
    email: string;
    gender: string;
    phoneNumber: string;
    location: Location;
    coordinates: [number, number];
    workingHours: Record<Weekday, WorkingDay>;
    ghanaCard: GhanaCard;
    skills: Skill[];
    settings: Settings;
    avatar: string;
    createdAt: string;
    updatedAt: string;
    accountStatus: number;
    userType: UserTypes.WORKER;
    acceptedTerms: AcceptedTerms;
    userId: string;
    rating: number;
}

export type Weekday = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface WorkingDay {
    from: string;
    to: string;
    opened: boolean;
}

export interface GhanaCard {
    front: string;
    back: string;
    number: string;
    isVerified: boolean;
}

export interface InitializeResponse {
    workers: Worker[];
    pagination: Pagination;
}

export type ContainerState = SearchState;
