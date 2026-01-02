import { FormElement, Media, Theme, User, BookingStatuses } from "@/redux/app/types";

export interface BookingsState {
    bookings: Booking[];
    isLoading: boolean;
}

export interface Booking {
    id: string;
    status: BookingStatuses;
    service: Service;
    client: Client;
    location: string;
    description: string;
}

export interface Service {
    summary: {
        estimatedDuration: string;
        requiredSkills: string[];
        requiredTools: string[];
        estimatedPrice: string;
    };
    artisan: User;
    description: string;
    requiredSkills: string[];
    appointmentDateTime: {
        date: {
            value: string;
            error: string;
        };
        time: {
            value: string;
            error: string;
        };
    };
    serviceLocationType: ServiceLocationType;
    serviceLocation: {
        address: string;
        latitude: number;
        longitude: number;
    };
    media: Media[];
}

export interface Location {
    address: string;
    latitude: number;
    longitude: number;
}

export interface AppointmentDateTime {
    date: FormElement;
    time: FormElement;
}

export enum ServiceLocationType {
    SHOP = 'shop',
    PERSON = 'person'
}

export interface Client {
    id: string;
    name: string;
    email: string;
    avatar: string;
    phoneNumber: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    isActive: boolean;
    sendNotification: boolean;
    theme: Theme;
    language: string;
    currency: string;
    timezone: string;
    isVerified: boolean;
    location: {
        address?: string;
        latitude: number;
        longitude: number;
    }
}

export type ContainerState = BookingsState;

