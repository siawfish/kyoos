import user from "@/assets/images/individual.png"
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'
import { selectUser } from '@/redux/app/selector'
import { AntDesign, SimpleLineIcons } from '@expo/vector-icons'
import React from 'react'
import { Image, StyleSheet, useColorScheme, View } from 'react-native'
import { useSelector } from 'react-redux'
import IconButton from '../IconButton'
import { ThemedText } from '../Themed/ThemedText'

export default function ProfileCard() {
    const loggedInUser = useSelector(selectUser);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    
    const cardBg = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background');
    const borderColor = isDark ? colors.dark.white : colors.light.black;
    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text');
    const labelColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary
    }, 'text');

    return (
        <View style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
            <View style={[styles.topAccent, { backgroundColor: borderColor }]} />
            <View style={styles.content}>
                <View style={styles.detailsContainer}>
                    <Image
                        source={loggedInUser?.avatar ? { uri: loggedInUser?.avatar } : user}
                        style={styles.img}
                    />
                    <View style={styles.details}>
                        <ThemedText type='title' style={[styles.name, { color: textColor }]}>{loggedInUser?.name}</ThemedText>
                        <ThemedText darkColor={colors.dark.secondary} lightColor={colors.light.secondary} style={[styles.email, { color: labelColor }]}>
                            {loggedInUser?.phoneNumber}
                        </ThemedText>
                        <ThemedText darkColor={colors.dark.secondary} lightColor={colors.light.secondary} style={[styles.email, styles.marginTop, { color: labelColor }]}>
                            {loggedInUser?.email}
                        </ThemedText>
                    </View>
                </View>
                <View style={styles.optionsContainer}>
                    <IconButton
                        style={styles.iconButton}
                    >
                        <SimpleLineIcons 
                            name='options' 
                            size={fontPixel(16)} 
                            color={textColor}
                        />
                    </IconButton>
                    <View style={styles.ratingContainer}>
                        <ThemedText style={[styles.ratingLabel, { color: labelColor }]} darkColor={colors.dark.secondary} lightColor={colors.light.secondary}>
                            RATING
                        </ThemedText>
                        <ThemedText style={[styles.rating, { color: textColor }]} darkColor={colors.dark.text} lightColor={colors.light.text}>
                            {loggedInUser?.rating} {' '}
                            <AntDesign 
                                name='star' 
                                size={fontPixel(14)} 
                                color={textColor}
                            />
                        </ThemedText>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderWidth: 0.5,
        borderTopWidth: 0,
        overflow: 'hidden',
    },
    topAccent: {
        height: heightPixel(3),
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(16),
    },
    detailsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(16),
        flex: 1,
    },
    name: {
        fontSize: fontPixel(18),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
        maxWidth: widthPixel(200),
    },
    email: {
        fontSize: fontPixel(12),
        fontFamily: 'Regular',
    },
    details: {
        gap: heightPixel(2),
    },
    iconButton: {
        backgroundColor: 'transparent',
        height: 'auto',
        width: 'auto',
        marginBottom: heightPixel(5)
    },
    optionsContainer: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: heightPixel(4),
    },
    ratingContainer: {
        alignItems: 'flex-end',
        gap: heightPixel(2),
    },
    ratingLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    rating: {
        fontSize: fontPixel(14),
        fontFamily: 'SemiBold',
    },
    marginTop: {
        marginTop: heightPixel(4),
    },
    img: { 
        width: widthPixel(65), 
        height: widthPixel(65),
        borderRadius: 0,
    }
})

