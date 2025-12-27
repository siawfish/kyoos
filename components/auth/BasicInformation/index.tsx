import BackButton from '@/components/ui/BackButton'
import SelectGender from '@/components/ui/SelectGender'
import InputField from '@/components/ui/TextInput'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'
import { FormElement } from '@/redux/app/types'
import { selectRegisterFormEmail, selectRegisterFormGender, selectRegisterFormName } from '@/redux/auth/selector'
import { actions } from '@/redux/auth/slice'
import { RootState } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Gender } from '@/redux/app/types'
import React from 'react'
import { ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native'

interface BasicInformationProps {
    mode?: 'auth' | 'account';
    selectors?: {
        name: (state: RootState) => FormElement;
        email: (state: RootState) => FormElement;
        gender?: (state: RootState) => FormElement;
    };
    actions?: {
        setName: (value: string) => any;
        setEmail: (value: string) => any;
        setGender?: (value: Gender) => any;
    };
    headerConfig?: {
        stepLabel?: string;
        title: string;
        subtitle: string;
    };
    showBackButton?: boolean;
    onBack?: () => void;
    emailEditable?: boolean;
    contentBottomPadding?: number;
}

export default function BasicInformation({
    mode = 'auth',
    selectors,
    actions: propActions,
    headerConfig,
    showBackButton = false,
    onBack,
    emailEditable = true,
    contentBottomPadding,
}: BasicInformationProps = {}) {
    const dispatch = useAppDispatch();
    
    // Use provided selectors or default to auth selectors (backward compatibility)
    const nameSelector = selectors?.name || selectRegisterFormName;
    const emailSelector = selectors?.email || selectRegisterFormEmail;
    const genderSelector = selectors?.gender || selectRegisterFormGender;
    
    const name = useAppSelector(nameSelector);
    const email = useAppSelector(emailSelector);
    const gender = useAppSelector(genderSelector);
    
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const textColor = isDark ? colors.dark.text : colors.light.text;
    const subtitleColor = isDark ? colors.dark.secondary : colors.light.secondary;
    const accentColor = isDark ? colors.dark.white : colors.light.black;
    const inputBackground = useThemeColor({light: colors.light.white, dark: colors.dark.black}, 'background');

    // Use provided actions or default to auth actions (backward compatibility)
    const handleNameChange = (text: string) => {
        if (propActions?.setName) {
            propActions.setName(text);
        } else {
            dispatch(actions.setRegisterFormValue({key: 'name', value: text}));
        }
    };

    const handleEmailChange = (text: string) => {
        if (propActions?.setEmail) {
            propActions.setEmail(text?.toLowerCase());
        } else {
            dispatch(actions.setRegisterFormValue({key: 'email', value: text?.toLowerCase()}));
        }
    };

    const handleGenderChange = (genderValue: Gender) => {
        if (propActions?.setGender) {
            propActions.setGender(genderValue);
        } else {
            dispatch(actions.setRegisterFormValue({key: 'gender', value: genderValue}));
        }
    };

    // Default header config for auth mode
    const defaultHeaderConfig = {
        stepLabel: 'STEP 1',
        title: 'Basic\nInformation',
        subtitle: 'Please provide the following information to create your account',
    };

    const finalHeaderConfig = headerConfig || defaultHeaderConfig;

    return (
        <>
            {showBackButton && (
                <View style={styles.header}>
                    <BackButton 
                        iconName='arrow-left'
                        onPress={onBack}
                    />
                </View>
            )}
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={contentBottomPadding ? { paddingBottom: contentBottomPadding } : undefined}
            >
                <View style={styles.contentContainer}>
                    <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                    {finalHeaderConfig.stepLabel && (
                        <Text style={[styles.label, { color: subtitleColor }]}>
                            {finalHeaderConfig.stepLabel}
                        </Text>
                    )}
                    <Text style={[styles.title, { color: textColor }]}>
                        {finalHeaderConfig.title}
                    </Text>
                    <Text style={[styles.subtitle, { color: subtitleColor }]}>
                        {finalHeaderConfig.subtitle}
                    </Text>
                </View>

                <View style={styles.gap}>
                    <SelectGender 
                        gender={gender}
                        onGenderChange={handleGenderChange}
                    />

                    <InputField 
                        label='FULL NAME'
                        placeholder='Enter your full name'
                        value={name.value}
                        style={{ backgroundColor: inputBackground }}
                        onChangeText={handleNameChange}
                        error={name.error}
                    />

                    <InputField 
                        label='EMAIL'
                        placeholder='Enter your email address'
                        value={email.value}
                        editable={emailEditable}
                        style={{ backgroundColor: inputBackground }}
                        onChangeText={handleEmailChange}
                        error={email.error}
                    />
                </View>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(16),
        marginBottom: heightPixel(8),
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
    label: {
        fontSize: fontPixel(11),
        fontFamily: 'SemiBold',
        letterSpacing: 2,
        marginBottom: heightPixel(8),
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
        gap: heightPixel(8),
        paddingHorizontal: widthPixel(4),
    }
})

