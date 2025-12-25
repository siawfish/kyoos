import { StyleSheet, View, Image } from 'react-native'
import React, { useRef } from 'react'
import { ThemedView } from '@/components/ui/Themed/ThemedView'
import { ThemedText } from '@/components/ui/Themed/ThemedText'
import { colors } from '@/constants/theme/colors'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import GenderOption from './components/GenderOption'
import { Gender } from '@/redux/app/types'

export default function SelectGender({
    gender,
    error,
    onChange,
}: {
    gender: Gender;
    error: string;
    onChange: (gender: Gender) => void;
}) {
    return (
        <ThemedView
            style={styles.container}
        >
            <ThemedText
                type='default'
                lightColor={colors.light.secondary} 
                darkColor={colors.dark.secondary} 
                style={[styles.label]}
            >
                Select Gender
            </ThemedText>
            <View style={styles.row}>
                <GenderOption 
                    type={Gender.MALE}
                    checked={gender === Gender.MALE}
                    onPress={() => onChange(Gender.MALE)}
                    style={{
                        borderColor: error ? colors.light.danger : undefined,
                    }}
                />
                <GenderOption 
                    type={Gender.FEMALE}
                    checked={gender === Gender.FEMALE}
                    onPress={() => onChange(Gender.FEMALE)}
                    style={{
                        borderColor: error ? colors.light.danger : undefined,
                    }}
                />
            </View>
            
            {
                error && (
                    <ThemedText
                        type='default'
                        lightColor={colors.light.error}
                        darkColor={colors.dark.error}
                        style={styles.error}
                    >
                        <Image source={require('@/assets/images/warning.png')} style={styles.errorIcon} />
                        {" "}
                        {error}
                    </ThemedText>
                )
            }
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        gap: widthPixel(10),
        paddingHorizontal: widthPixel(16)
    },
    label: {
        fontSize: fontPixel(14),
        fontFamily: 'SemiBold',
    },
    row: {
        flexDirection: 'row',
        gap: widthPixel(10),
        alignItems: 'center',
        justifyContent: 'space-evenly'
    },
    errorIcon: {
        width: widthPixel(10),
        height: widthPixel(10),
        marginRight: widthPixel(4)
    },
    error: {
        fontSize: fontPixel(12),
        marginTop: heightPixel(-4)
    }
})