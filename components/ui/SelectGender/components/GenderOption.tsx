import { StyleSheet, Image, TouchableOpacity, View, ViewStyle } from 'react-native'
import React from 'react'
import { fontPixel, widthPixel } from '@/constants/normalize'
import man from '@/assets/images/man.png';
import woman from '@/assets/images/woman.png';
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'
import { Gender } from '@/redux/app/types';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import RadioButton from '@/components/ui/RadioButton';

interface GenderOptionProps {
    style?: ViewStyle;
    checked?: boolean;
    type?: Gender;
    onPress?: () => void;
}

const GenderOption = ({
    style,
    checked,
    type=Gender.MALE,
    onPress
}:GenderOptionProps) => {
    const borderColor = useThemeColor({
        light: colors.light.grey,
        dark: colors.dark.lightTint
    }, 'text');
    const activeBorderColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint
    }, 'text');
    const backgroundColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background');
    const activeBackgroundColor = useThemeColor({
        light: colors.light.lightTint,
        dark: colors.dark.lightTint
    }, 'lightTint');
  return (
    <TouchableOpacity 
        onPress={onPress} 
        style={[
            styles.card, 
            {
                borderColor: checked ? activeBorderColor : borderColor, 
                backgroundColor: checked ? activeBackgroundColor : backgroundColor
            }
        ]}
    >
        <View style={styles.innerRow}>
            <Image 
                source={type === Gender.MALE ? man : woman}
                style={{
                    width: widthPixel(24),
                    height: widthPixel(24)
                }}
            />
            <View style={styles.textContainer}>
                <ThemedText 
                    style={[styles.businessType]}
                    lightColor={checked ? colors.light.tint : colors.light.text}
                    darkColor={checked ? colors.light.tint : colors.dark.text}
                >
                    {type}
                </ThemedText>
                <ThemedText 
                    style={styles.caption} 
                    type='subtitle'
                    lightColor={colors.light.secondary} 
                    darkColor={colors.dark.secondary}
                >
                    {type === Gender.MALE ? 'Create an account as a male' : 'Create an account as a female'}
                </ThemedText>                    
            </View>
            <RadioButton checked={checked} />
        </View>
    </TouchableOpacity>
  )
}

export default GenderOption

const styles = StyleSheet.create({
    innerRow: {
        flexDirection: 'row',
        gap: widthPixel(5),
        paddingEnd: widthPixel(16),
    },
    card: {
        padding: widthPixel(10),
        borderRadius: widthPixel(10),
        backgroundColor: '#f5f5f5',
        flex: 1,
        borderWidth: 1,
    },
    businessType: {
        fontSize: fontPixel(16),
        textTransform: 'capitalize'
    },
    caption: {
        fontSize: fontPixel(12),
        fontFamily: 'Regular',
        color: colors.light.secondary,
    },
    textContainer: {
        flexDirection: 'column',
        gap: widthPixel(5),
        width: '70%'
    }
})