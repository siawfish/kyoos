import { KeyValue } from "@/redux/app/types";
import { RegisterForm, RegisterFormFields, Location } from "@/redux/auth/types";
import { Booking } from "@/redux/booking/types";



export const validateGhanaianPhoneNumber = (phoneNumber: string): string | null => {
    if (phoneNumber.startsWith('0') && phoneNumber.length === 10) {
        return null;
    }
    return 'Invalid phone number';
}

export const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
        return null;
    }
    return 'Invalid email address';
}

export const validateBasicInformation = (values: Partial<RegisterForm>) => {
    const errors: KeyValue<RegisterFormFields>[] = [];
    if (!values.name?.value) {
        errors.push({key: 'name', value: 'Name is required'});
    }
    if (!values.gender?.value) {
        errors.push({key: 'gender', value: 'Gender is required'});
    }
    return errors;
}

export const validateAvatar = (url: string) => {
    if (!url) {
        return 'This field is required';
    }
    return null;
}

export const validateLocation = (location: Location) => {
    if (!location.lat || !location.lng || !location.address) {
        return 'Location is required';
    }
    return null;
}
