import { useEffect, useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { usePathname } from 'expo-router';
import { ThemedView } from '@/components/ui/Themed/ThemedView';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import Button from '@/components/ui/Button';
import InputField from '@/components/ui/TextInput';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { widthPixel, heightPixel } from '@/constants/normalize';
import SelectGender from '@/components/ui/SelectGender';
import UploadProfilePhoto from '@/components/ui/UploadProfilePhoto';
import { validateBasicInformation } from '@/constants/helpers/validations';
import { RegisterForm, RegisterFormFields } from '@/redux/auth/types';
import { Gender } from '@/redux/app/types';

export default function ProfileForm({
    registerForm,
    isLoading,
    onSetFormValues,
    onSetFormErrors,
    onSubmit,
    submitOnBlur=false
}: {
    registerForm: RegisterForm;
    isLoading: boolean;
    onSetFormValues: (key: RegisterFormFields, value: string) => void;
    onSetFormErrors: (key: RegisterFormFields, value: string) => void;
    onSubmit: () => void;
    submitOnBlur?: boolean;
}) {
    const pathname = usePathname();
    const [isDisabled, setIsDisabled] = useState(false);

    const inputBackgroundColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black
    }, 'white');

    useEffect(() => {
        if (!submitOnBlur) return;
        handleSave();
    }, [submitOnBlur, registerForm.avatar.value, registerForm.gender.value]);

    const handleSave = () => {
        const errors = validateBasicInformation(registerForm);
        if (errors.length > 0) {
            errors.forEach((error) => {
                onSetFormErrors(error.key, error.value);
            });
            return;
        }
        onSubmit();
    }

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.mainContainer}
        >
            <ScrollView 
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <ThemedView style={styles.container}>
                    
                    <View style={styles.mainStyle}>
                        <ThemedText type="title" style={styles.title}>
                            Profile info
                        </ThemedText>
                        
                        <UploadProfilePhoto 
                            url={registerForm.avatar.value}
                            onChange={(url) => onSetFormValues('avatar', url)}
                            setDisabled={setIsDisabled}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <InputField
                            label="Name"
                            placeholder="Enter your name"
                            value={registerForm.name.value}
                            error={registerForm.name.error}
                            onChangeText={(text) => onSetFormValues('name', text)}
                            onBlur={() => submitOnBlur && handleSave()}
                            keyboardType="default"
                            textContentType="name"
                            maxLength={50}
                            style={{backgroundColor: inputBackgroundColor}}
                        />

                        <InputField
                            label="Email (optional)"
                            placeholder="Enter your email"
                            value={registerForm.email.value}
                            onChangeText={(text) => onSetFormValues('email', text)}
                            onBlur={() => submitOnBlur && handleSave()}
                            keyboardType="email-address"
                            textContentType="emailAddress"
                            autoCapitalize="none"
                            style={{backgroundColor: inputBackgroundColor}}
                        />

                        <SelectGender 
                            gender={registerForm.gender.value as Gender}
                            error={registerForm.gender.error}
                            onChange={(gender) => onSetFormValues('gender', gender)}
                        />
                        {
                            pathname === '/register' && (
                                <Button
                                    label="Save"
                                    isLoading={isLoading}
                                    disabled={isDisabled}
                                    onPress={handleSave}
                                    style={styles.button}
                                />
                            )
                        }
                    </View>
                </ThemedView>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        marginTop: heightPixel(16),
    },
    container: {
        flex: 1,
        paddingBottom: heightPixel(16),
    },
    mainStyle: {
        paddingHorizontal: widthPixel(16),
    },
    title: {
        marginBottom: heightPixel(8),
    },
    inputContainer: {
        flex: 1,
        gap: heightPixel(16),
    },
    button: {
        marginTop: 'auto',
    },
});
