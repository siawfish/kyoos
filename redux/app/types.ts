import { Location } from '@/redux/auth/types';

export enum UserTypes {
  WORKER = "WORKER",
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
}

export enum MediaType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
}

export enum MimeType {
    JPEG = 'image/jpeg',
    JPG = 'image/jpg',
    PNG = 'image/png',
    MP4 = 'video/mp4',
    MOV = 'video/mov',
    PDF = 'application/pdf',
}

export enum PermissionType {
    CAMERA = 'CAMERA',
    MEDIA_LIBRARY = 'MEDIA_LIBRARY',
    LOCATION = 'LOCATION',
}
export interface Media {
    id?: string;
    uri: string;
    width?: number;
    height?: number;
    type?: MediaType | MimeType;
}

export enum BookingStatuses {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    DECLINED = "DECLINED",
    ONGOING = "ONGOING",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED",
    PAUSED = "PAUSED",
}

export interface StatusColors {
    color: string;
    backgroundColor: string;
}

export interface AppState {
    isLoading: boolean;
    token: string | null;
    user: User | null;
    hasSeenOnboarding: boolean;
    location: LocationForm;
}

export interface LocationForm extends Location {
    error: string;
    isLoading: boolean;
    isMapPickerOpen: boolean;
}

export enum StoreName {
    SEARCH = 'SEARCH',
    REGISTER = 'REGISTER',
    LOCATION = 'LOCATION',
}
export interface Asset {
    id: string;
    url: string;
    type: MimeType;
    success?: boolean;
    error?: string;
}

export enum AssetModule {
    PORTFOLIO = 'PORTFOLIO',
    PROFILE = 'PROFILE',
    BOOKING = 'BOOKING',
    DOCUMENTS = 'DOCUMENTS',
}
export interface User {
    id: string;
    acceptedTerms: AcceptedTerms;
    accountStatus: number;
    avatar: string;
    createdAt: string;
    deletedAt: string | null;
    email: string;
    gender: Gender;
    isVerified: boolean;
    location: Location;
    name: string;
    phoneNumber: string;
    rating: number;
    settings: Settings;
    updatedAt: string;
    userType: UserTypes;
}

export interface AcceptedTerms {
    status: boolean;
    acceptedAt: string;
}

export interface Settings {
    currency: string;
    language: string
    notifications: {
        sms: boolean;
        email: boolean;
        pushToken: string;
        pushNotification: boolean;
    };
    theme: Theme;
    timezone: string;
}

export enum Theme {
    SYSTEM = 'system',
    LIGHT = 'light',
    DARK = 'dark',
}

export interface FormElement {
    value: string;
    error: string;
}

export interface KeyValue<T> {
    key: T;
    value: string;
}

export type ContainerState = AppState;
