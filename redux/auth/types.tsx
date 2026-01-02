import { FormElement, LocationForm, User } from '@/redux/app/types';

export interface AuthState {
  loginForm: LoginForm;
  registerForm: RegisterForm;
  referenceId: string;
  credentials: Credentials;
}

export type LoginFormFields = Exclude<keyof ContainerState['loginForm'], 'isLoading'>;
export type RegisterFormFields = Exclude<keyof ContainerState['registerForm'], 'isLoading' | 'location'>;
export interface LoginForm {
  phoneNumber: FormElement;
  otp: FormElement;
  isLoading: boolean;
}

export interface RegisterForm {
  name: FormElement;
  email: FormElement;
  phoneNumber: FormElement;
  avatar: FormElement;
  isLoading: boolean;
  gender: FormElement;
  location: LocationForm;
}

export type ProfileForm = Omit<RegisterForm, 'location'>;
export interface GhanaCardForm {
  number: FormElement;
  front: FormElement;
  back: FormElement;
}

export interface SkillsForm {
  id: string;
  name: FormElement;
  rate: FormElement;
  yearsOfExperience: FormElement;
  icon: string;
}

export interface Credentials {
  token: string;
  user: User | null;
}
export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface VerifyPhoneNumberResponse {
  referenceId: string;
  phoneNumber: string;
}

export interface LoginResponse {
  token?: string;
  user?: User;
  phoneNumber: string;
}

export type ContainerState = AuthState;