import { StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { EvilIcons } from '@expo/vector-icons'
import { colors } from '@/constants/theme/colors'
import { widthPixel } from '@/constants/normalize'
import { useThemeColor } from '@/hooks/use-theme-color'

const Thumbnail = () => {
    const backgroundColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint
    }, 'background');
    return (
        <TouchableOpacity style={[styles.thumbnail, {backgroundColor}]}>
            <EvilIcons name="camera" size={40} color={colors.light.text} />
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    thumbnail: {
        width: widthPixel(80),
        height: widthPixel(80),
        borderRadius: widthPixel(10),
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default Thumbnail;