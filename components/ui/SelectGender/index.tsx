import { fontPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { selectRegisterFormGender } from '@/redux/auth/selector'
import { actions } from '@/redux/auth/slice'
import { FormElement } from '@/redux/app/types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Gender } from '@/redux/app/types'
import React from 'react'
import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import GenderOption from './components/GenderOption'

interface SelectGenderProps {
    gender?: FormElement;
    onGenderChange?: (gender: Gender) => void;
}

export default function SelectGender({ gender: propGender, onGenderChange }: SelectGenderProps = {}) {
    const reduxGender = useAppSelector(selectRegisterFormGender);
    const dispatch = useAppDispatch();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const labelColor = isDark ? colors.dark.secondary : colors.light.secondary;

    // Use prop gender if provided, otherwise use Redux (backward compatibility)
    const gender = propGender || reduxGender;

    const handleGenderChange = (gender: Gender) => {
        if (onGenderChange) {
            onGenderChange(gender);
        } else {
            // Default to Redux action (backward compatibility)
            dispatch(actions.setRegisterFormValue({key: 'gender', value: gender}));
        }
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: labelColor }]}>
                SELECT GENDER
            </Text>
            <View style={styles.row}>
                <GenderOption 
                    type={Gender.MALE}
                    checked={gender?.value === Gender.MALE}
                    onPress={() => handleGenderChange(Gender.MALE)}
                />
                <GenderOption 
                    type={Gender.FEMALE}
                    checked={gender?.value === Gender.FEMALE}
                    onPress={() => handleGenderChange(Gender.FEMALE)}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        gap: widthPixel(10),
        paddingHorizontal: widthPixel(16)
    },
    label: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
    },
    row: {
        flexDirection: 'row',
        gap: widthPixel(12),
        alignItems: 'center',
    },
})
