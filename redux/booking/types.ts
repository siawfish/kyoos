import { FormElement, Media } from "@/redux/app/types";
import { Summary, Worker } from "../search/types";
import { Location } from "../auth/types";

export interface BookingState {
    summary: Summary;
    artisan: Worker | null;
    description: string;
    requiredSkills: string[];
    appointmentDateTime: AppointmentDateTime;
    serviceLocationType: ServiceLocationType;
    serviceLocation: Location;
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