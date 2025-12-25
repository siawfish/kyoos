import { FormElement, Media } from "@/redux/app/types";

export interface BookingState {
    summary: {
        estimatedDuration: string;
        requiredSkills: string[];
        requiredTools: string[];
        estimatedPrice: string;
    };
    artisan: any;
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
    isLoading: boolean;
    isSuccess: boolean;
}

export interface AppointmentDateTime {
    date: FormElement;
    time: FormElement;
}

export enum ServiceLocationType {
    SHOP = 'shop',
    PERSON = 'person'
}


export type ContainerState = BookingState;