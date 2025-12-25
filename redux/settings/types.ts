import { RegisterForm } from "@/redux/auth/types";

export interface SettingsState {
    profileForm: RegisterForm;
}

export type ContainerState = SettingsState;

