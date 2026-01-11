import { Location } from '@/redux/auth/types';

export enum UserTypes {
  WORKER = "WORKER",
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
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

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
}

export enum MediaType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
}

export interface Options {
    label: string;
    icon: OptionIcons;
    onPress: () => void;
    isDisabled?: boolean;
    isDanger?: boolean;
}

export enum OptionIcons {
    COMMENT = 'speech',
    SHARE = 'share',
    FLAG = 'flag',
    EDIT = 'pencil',
    DELETE = 'trash',
}


export enum MimeType {
    JPEG = 'image/jpeg',
    HEIC = 'image/heic',
    HEIF = 'image/heif',
    JPG = 'image/jpg',
    PNG = 'image/png',
    WEBP = 'image/webp',
    GIF = 'image/gif',
    MP4 = 'video/mp4',
    MOV = 'video/mov',
    QUICKTIME = 'video/quicktime',
    M4V = 'video/x-m4v',
    MPEG = 'video/mpeg',
    AVI = 'video/avi',
    X_MSVIDEO = 'video/x-msvideo',
    WMV = 'video/wmv',
    X_MS_WMV = 'video/x-ms-wmv',
    WEBM = 'video/webm',
    THREE_GPP = 'video/3gpp',
    THREE_GPP2 = 'video/3gpp2',
    X_MATROSKA = 'video/x-matroska',
    PDF = 'application/pdf',
    OCTET_STREAM = 'application/octet-stream',
}

export enum PermissionType {
    CAMERA = 'CAMERA',
    MEDIA_LIBRARY = 'MEDIA_LIBRARY',
    LOCATION = 'LOCATION',
    PUSH_NOTIFICATION = 'PUSH_NOTIFICATION',
}
export interface Media {
    id?: string;
    url: string;
    width?: number;
    height?: number;
    type?: MimeType;
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
    isUpdatingTheme: boolean;
    isUpdatingNotifications: boolean;
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
        pushToken: string[];
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
