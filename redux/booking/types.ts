import { BookingStatuses, FormElement, Media } from "@/redux/app/types";
import { Location } from "../auth/types";
import { Skill, Summary, Worker } from "../search/types";

export interface BookingState {
    bookingId: string;
    searchHistoryId: string;
    summary: Summary;
    artisan: Worker | null;
    description: string;
    requiredSkills: string[];
    appointmentDateTime: AppointmentDateTime;
    serviceLocationType: ServiceLocationType;
    serviceLocation: Location;
    media: Media[];
    availableSlots: AvailableSlot[];
    isGettingAvailableSlots: boolean;
    isLoading: boolean;
    isSuccess: boolean;
    isMapPickerOpen: boolean;
    error: string;
}

export interface AvailableSlot {
    date: string;
    time: string;
    dateTime: string;
}

export interface AppointmentDateTime {
    date: FormElement;
    time: FormElement;
}

export enum ServiceLocationType {
    SHOP = 'shop',
    PERSON = 'person'
}

export interface GetAvailableTimesResponse {
    workerId: string;
    dateRange: {
        startDate: string;
        endDate: string;
    };
    availableSlots: AvailableSlot[];
}

export interface Booking {
    id: string;
    searchId: string;
    estimatedDuration: number;
    estimatedPrice: number;
    requiredSkills: Skill[];
    requiredTools: string[];
    status: BookingStatuses;
    workerId: string;
    worker: Worker;
    userId: string;
    createdAt: string;
    updatedAt: string;
    location: Location;
    description: string;
    date: string;
    startTime: string;
    estimatedEndTime: string;
    media: Media[];
    serviceType: ServiceLocationType;
}


export type ContainerState = BookingState;