import { Asset, FormElement, Media } from "@/redux/app/types";
import { Pagination } from "@/services/types";
export interface Portfolio {
  id: string;
  description: string;
  assets: Media[];
  skills: string[];
  likes: number;
  comments: number;
  hasLiked: boolean;
  hasCommented: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
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
  comments: Comment[];
  isLoadingComments: boolean;
  commentForm: CommentForm;
  isLikingPortfolio: boolean;
  isLoading: boolean;
  error: string | null;
  pagination: Pagination; 
}

export interface CommentForm {
  comment: string;
  isLoading: boolean;
}

export type ContainerState = PortfolioState;