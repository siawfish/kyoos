import { Media } from "@/types";

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  read: boolean;
  attachments: Media[];
}

export interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string | null;
  }[];
  messages: Message[];
  unreadCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface MessageForm {
  content: string;
  attachments: Media[];
  isLoading?: boolean;
}

export interface MessagingState {
  messages: Conversation[];
  messageForm: MessageForm;
  isLoading: boolean;
  error: string | null;
}

export type ContainerState = MessagingState; 