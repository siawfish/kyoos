import { Asset, FormElement, Media, Skill, User } from "@/redux/app/types";
import { Pagination } from "@/services/types";
export interface Portfolio {
  id: string;
  description: string;
  assets: Media[];
  skills: Skill[];
  likes: number;
  comments: number;
  hasLiked: boolean;
  hasCommented: boolean;
  /** True if the current user has already reported this portfolio (from API or after submit). */
  hasReported?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
}

export interface PortfolioPayload {
  id?: string;
  description: string;
  skills?: string[];
  assets?: Asset[];
}

export interface PortfoliosResponse {
  portfolios: Portfolio[];
  pagination: Pagination;
}

export interface PortfolioForm {
  description: FormElement;
  files: Media[];
  skills: string[];
  isLoading: boolean;
}

export interface Comment {
  id: string;
  portfolioId: string;
  authorId: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface PortfolioState {
  portfolios: Portfolio[];
  selectedWorkerId: string;
  comments: Comment[];
  isLoadingComments: boolean;
  commentForm: CommentForm;
  isLikingPortfolio: boolean;
  isReportingPortfolio: boolean;
  isLoading: boolean;
  error: string | null;
  pagination: Pagination;
  /** Home screen explore feed (popular portfolios) — separate from artisan profile lists */
  homePopularPortfolios: Portfolio[];
  homePopularPagination: Pagination;
  isLoadingHomePopular: boolean;
  isAppendingHomePopular: boolean;
  /** Portfolio opened from a detail screen. Fetched by id to support deep-links and cache-miss navigation. */
  selectedPortfolio: Portfolio | null;
  isLoadingSelectedPortfolio: boolean;
  selectedPortfolioError: string | null;
}

export interface CommentForm {
  comment: string;
  isLoading: boolean;
}

export type ContainerState = PortfolioState;