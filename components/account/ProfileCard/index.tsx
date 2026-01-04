import user from "@/assets/images/individual.png";
import Button from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Worker } from '@/redux/search/types';
import { AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface ProfileCardProps {
    containerStyle?: StyleProp<ViewStyle>;
    worker: Worker;
}

export default function ProfileCard({ worker, containerStyle }: ProfileCardProps) {
    const theme = useAppTheme();
    const isDark = theme === 'dark';

    const cardBg = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background');

    const borderColor = useThemeColor({
        light: colors.light.black,
        dark: colors.dark.white
    }, 'background');

    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text');

    const labelColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary
    }, 'text');

    const accentColor = useThemeColor({
        light: colors.light.black,
        dark: colors.dark.white
    }, 'background');

    return (
        <View style={[styles.container, { backgroundColor: cardBg, borderColor }, containerStyle]}>
            <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
            <View style={styles.content}>
                <View style={styles.detailsContainer}>
                    <Image
                        source={user}
                        style={styles.img}
                    />
                    <View style={styles.details}>
                        <ThemedText 
                            type="subtitle" 
                            style={[styles.name, { color: textColor }]}
                        >
                            {worker.name}
                        </ThemedText>
                        <View style={styles.ratingContainer}>
                            <ThemedText 
                                style={[styles.ratingLabel, { color: labelColor }]} 
                                darkColor={colors.dark.secondary} 
                                lightColor={colors.light.secondary}
                            >
                                RATING
                            </ThemedText>
                            <ThemedText 
                                style={[styles.rating, { color: textColor }]} 
                                darkColor={colors.dark.text} 
                                lightColor={colors.light.text}
                            >
                                {worker.rating}{' '}
                                <AntDesign 
                                    name='star' 
                                    size={14} 
                                    color={textColor}
                                />
                            </ThemedText>
                        </View>
                    </View>
                </View>
               
                <Link href={`/(tabs)/(search)/(booking)/booking?artisanId=${worker.id}`} asChild>
                    <Button 
                        label="BOOK NOW" 
                        style={styles.bookNowButton}
                        labelStyle={styles.bookNowLabel}
                        lightBackgroundColor={colors.light.black}
                        darkBackgroundColor={colors.dark.white}
                        icon={
                            <SimpleLineIcons 
                                name="calendar" 
                                size={14} 
                                color={isDark ? colors.dark.black : colors.light.white} 
                            />
                        }
                    />
                </Link>
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
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(16),
    },
    details: {
        gap: heightPixel(4),
    },
    name: {
        fontSize: fontPixel(18),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
        maxWidth: widthPixel(140),
    },
    ratingContainer: {
        gap: heightPixel(2),
    },
    ratingLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
    },
    rating: {
        fontSize: fontPixel(14),
        fontFamily: 'SemiBold',
    },
    img: { 
        width: widthPixel(60), 
        height: widthPixel(60),
        borderRadius: 0,
    },
    bookNowButton: {
        paddingHorizontal: widthPixel(20),
        marginHorizontal: 0,
        height: heightPixel(44),
        minWidth: widthPixel(120),
    },
    bookNowLabel: {
        fontSize: fontPixel(11),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
    }
})
