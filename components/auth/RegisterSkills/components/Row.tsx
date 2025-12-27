import { ThemedText } from '@/components/ui/Themed/ThemedText'
import { fontPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'
import React from 'react'
import { StyleSheet, View } from 'react-native'

interface RowProps {
    title: string
    measure: string
    rate: string
}

const Row = ({
    title,
    measure,
    rate
}:RowProps) => {
    const backgroundColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background');
    const color = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text');
    const borderColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint
    }, 'tint');
    return (
        <View style={[styles.header, {backgroundColor}]}>
            <View style={[styles.headerTextContainer, styles.longCol]}>
                <ThemedText style={[styles.headerText, {color}]}>{title}</ThemedText>
            </View>
            <View style={[styles.headerTextContainer, styles.border, { borderColor }]}>
                <ThemedText style={[styles.headerText, {color}]}>{measure}</ThemedText>
            </View>
            <View style={styles.headerTextContainer}>
                <ThemedText style={[styles.headerText, {color}]}>{rate}</ThemedText>
            </View>
        </View>
    )
}

export default Row

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    headerText: {
        fontSize: fontPixel(14),
        padding: widthPixel(8),
        paddingLeft: widthPixel(16),
    },
    headerTextContainer: {
        flex: 1,
    },
    border: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
    },
    longCol: {
        minWidth: widthPixel(120),
    }
})

