import { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, ScrollView, Platform, Text, useColorScheme } from 'react-native';
import { ThemedView } from '@/components/ui/Themed/ThemedView';
import InputField from '@/components/ui/TextInput';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { widthPixel, heightPixel, fontPixel } from '@/constants/normalize';
import SelectGender from '@/components/ui/SelectGender';
import UploadProfilePhoto from '@/components/ui/UploadProfilePhoto';
import { validateBasicInformation } from '@/constants/helpers/validations';
import { ProfileForm as ProfileFormType, RegisterForm, RegisterFormFields } from '@/redux/auth/types';

export default function ProfileForm({
    registerForm,
    onSetFormValues,
    onSetFormErrors,
    onSubmit,
    submitOnBlur=false
}: {
    registerForm: RegisterForm | ProfileFormType;
    onSetFormValues: (key: RegisterFormFields, value: string) => void;
    onSetFormErrors: (key: RegisterFormFields, value: string) => void;
    onSubmit: () => void;
    submitOnBlur?: boolean;
}) {
    const [, setIsDisabled] = useState(false);

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const textColor = isDark ? colors.dark.text : colors.light.text;
    const subtitleColor = isDark ? colors.dark.secondary : colors.light.secondary;
    const accentColor = isDark ? colors.dark.white : colors.light.black;
    const inputBackground = useThemeColor({light: colors.light.white, dark: colors.dark.black}, 'background');

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
                    <View style={styles.contentContainer}>
                        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                        <Text style={[styles.label, { color: subtitleColor }]}>
                            REGISTER
                        </Text>
                        <Text style={[styles.title, { color: textColor }]}>
                            Profile info
                        </Text>
                        <Text style={[styles.subtitle, { color: subtitleColor }]}>
                            Please provide your name and an optional profile photo
                        </Text>
                    </View>

                    <View style={styles.gap}>
                        <UploadProfilePhoto 
                            url={registerForm.avatar.value}
                            onChange={(url) => onSetFormValues('avatar', url)}
                            setDisabled={setIsDisabled}
                        />

                        <SelectGender 
                            gender={registerForm.gender}
                            onGenderChange={(gender) => onSetFormValues('gender', gender)}
                        />

                        <InputField
                            label="FULL NAME"
                            placeholder="Enter your full name"
                            value={registerForm.name.value}
                            error={registerForm.name.error}
                            onChangeText={(text) => onSetFormValues('name', text)}
                            onBlur={() => submitOnBlur && handleSave()}
                            keyboardType="default"
                            textContentType="name"
                            maxLength={50}
                            style={{backgroundColor: inputBackground}}
                        />

                        <InputField
                            label="EMAIL (OPTIONAL)"
                            placeholder="Enter your email"
                            value={registerForm.email.value}
                            onChangeText={(text) => onSetFormValues('email', text)}
                            onBlur={() => submitOnBlur && handleSave()}
                            keyboardType="email-address"
                            textContentType="emailAddress"
                            autoCapitalize="none"
                            style={{backgroundColor: inputBackground}}
                        />
                    </View>
                </ThemedView>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingBottom: heightPixel(16),
    },
    contentContainer: {
        paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(24),
        marginBottom: heightPixel(24),
    },
    accentBar: {
        width: widthPixel(40),
        height: heightPixel(4),
        marginBottom: heightPixel(20),
    },
    title: {
        fontSize: fontPixel(32),
        fontFamily: 'Bold',
        lineHeight: fontPixel(38),
        letterSpacing: -1,
        marginBottom: heightPixel(12),
    },
    subtitle: {
        fontSize: fontPixel(15),
        fontFamily: 'Regular',
        lineHeight: fontPixel(22),
    },
    gap: {
        flexDirection: 'column',
        gap: heightPixel(16),
        paddingHorizontal: widthPixel(4),
        paddingBottom: heightPixel(88),
    },
    stepContainer: {
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(8),
        backgroundColor: colors.light.grey,
        borderRadius: widthPixel(16),
        marginBottom: heightPixel(12),
    },
    label: {
        fontSize: fontPixel(11),
        fontFamily: 'SemiBold',
        letterSpacing: 2,
        marginBottom: heightPixel(8),
    },
});
