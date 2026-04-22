import { heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useAppTheme } from '@/hooks/use-app-theme'
import { AntDesign, MaterialIcons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, View } from 'react-native'

interface RatingProps {
    /** 1–5 */
    readonly rating?: number
    /** Star size in logical pixels; defaults to a comfortable read-only size. */
    readonly size?: number
}

const DEFAULT_SIZE = 20

const Rating = ({ rating = 0, size = DEFAULT_SIZE }: RatingProps) => {
    const theme = useAppTheme()
    const isDark = theme === 'dark'
    const filledColor = isDark ? colors.dark.white : colors.light.black
    const emptyColor = isDark ? colors.dark.secondary : colors.light.secondary

    return (
        <View style={styles.container} accessibilityLabel={`${rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((value) => (
                <View key={value} style={styles.starWrap}>
                    {value <= rating ? (
                        <AntDesign name="star" size={size} color={filledColor} />
                    ) : (
                        <MaterialIcons
                            name="star-outline"
                            size={size}
                            color={emptyColor}
                        />
                    )}
                </View>
            ))}
        </View>
    )
}

export default Rating

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(4),
        paddingVertical: heightPixel(2),
    },
    starWrap: {
        minWidth: widthPixel(24),
        alignItems: 'center',
    },
})
