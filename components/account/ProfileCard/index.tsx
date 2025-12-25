import { StyleSheet, View, Image, ViewStyle, StyleProp } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/ui/Themed/ThemedView'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import user from "@/assets/images/individual.png";
import { ThemedText } from '@/components/ui/Themed/ThemedText'
import { AntDesign, SimpleLineIcons } from '@expo/vector-icons'
import Button from '@/components/ui/Button'
import { useThemeColor } from '@/hooks/use-theme-color'
import { Link } from 'expo-router'

interface ProfileCardProps {
    containerStyle?: StyleProp<ViewStyle>;
}

export default function ProfileCard({ containerStyle }: ProfileCardProps) {
    const borderColor = useThemeColor({
        light: colors.light.black,
        dark: colors.dark.white
    }, 'background');
  return (
    <ThemedView
        lightColor={colors.light.white}
        darkColor={colors.dark.black}
        style={[styles.container, containerStyle]}
    >
        <View style={styles.detailsContainer}>
            <Image
                source={user}
                style={styles.img}
            />
            <View style={styles.details}>
                <ThemedText type="subtitle" style={styles.name}>John Doe</ThemedText>
                <ThemedText style={styles.rating} darkColor={colors.dark.text} lightColor={colors.light.text}>
                    93/100 {' '}
                    <AntDesign 
                        name='star' 
                        size={15} 
                        color={colors.light.tint}
                    />
                </ThemedText>
            </View>
        </View>
       
        <Link href={`/(tabs)/(search)/(booking)`} asChild>
            <Button 
                label="Book Now" 
                style={{...styles.bookNowButton, borderColor: borderColor}}
                labelStyle={styles.bookNowLabel}
                lightBackgroundColor={colors.light.black}
                darkBackgroundColor={colors.dark.background}
                icon={<SimpleLineIcons name="calendar" size={16} color={colors.light.white} />}
            />
        </Link>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(16),
        borderRadius: widthPixel(16),
        elevation: 3,
        shadowColor: colors.light.text,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    detailsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(16),
    },
    name: {
        fontSize: fontPixel(16),
        fontWeight: 'bold',
        maxWidth: widthPixel(200),
    },
    email: {
        fontSize: fontPixel(12),
    },
    details: {
        gap: 2,
    },
    iconButton: {
        backgroundColor: 'transparent',
        height: 'auto',
        width: 'auto',
        marginBottom: heightPixel(5)
    },
    ratingLabel: {
        fontSize: fontPixel(12),
    },
    rating: {
        fontSize: fontPixel(14),
    },
    marginTop: {
        marginTop: heightPixel(5),
    },
    img: { 
        width: widthPixel(65), 
        height: widthPixel(65),
        borderRadius: widthPixel(65/2),
    },
    bookNowButton: {
        paddingHorizontal: widthPixel(16),
        marginHorizontal: 0,
        borderRadius: 20,
        height: heightPixel(40),
        borderWidth: 1,
    },
    bookNowLabel: {
        fontSize: fontPixel(14),
    }
})
