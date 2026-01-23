import { BookingStatuses, Media } from "@/redux/app/types";

export enum MessageStatus {
  SENT = "SENT",
  DELIVERED = "DELIVERED",
  READ = "READ",
}

export interface Asset {
  id: string;
  type: string;
  url: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content?: string;
  media?: Asset[];
  status: MessageStatus;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  editedAt?: string;
  deletedAt?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export interface Conversation {
  id: string;
  bookingId: string;
  clientId: string;
  workerId: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    avatar: string;
  };
  worker: {
    id: string;
    name: string;
    avatar: string;
  };
  booking: {
    id: string;
    description: string;
    date: string;
    startTime: string;
    estimatedEndTime: string;
    status: BookingStatuses;
  };
  unreadCount?: number;
  messages?: Message[];
}

export interface MessageForm {
  content: string;
  attachments: Media[];
  isLoading?: boolean;
}

export interface MessagingState {
  conversations: Conversation[];
  currentConversationMessages: Message[];
  messageForm: MessageForm;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  fetchingConversation: boolean;
  typingUsers: { [conversationId: string]: string[] };
}

export type ContainerState = MessagingState; 