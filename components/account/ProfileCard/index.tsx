import Button from '@/components/ui/Button';
import BookingDescriptionModal from '@/components/ui/BookingDescriptionModal';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectSearchReferenceId } from '@/redux/search/selector';
import { actions } from '@/redux/search/slice';
import { Worker } from '@/redux/search/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface ProfileCardProps {
    containerStyle?: StyleProp<ViewStyle>;
    worker: Worker;
}

export default function ProfileCard({ worker, containerStyle }: ProfileCardProps) {
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const router = useRouter();
    const searchReferenceId = useAppSelector(selectSearchReferenceId);
    const dispatch = useAppDispatch();

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

    const miscColor = useThemeColor({
        light: colors.light.misc,
        dark: colors.dark.grey
    }, 'background');

    const labelColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary
    }, 'text');

    const accentColor = useThemeColor({
        light: colors.light.black,
        dark: colors.dark.white
    }, 'background');

    const handleBookNow = () => {
        // Check if searchReferenceId is empty - if so, show description modal
        if (searchReferenceId === '') {
            dispatch(actions.setSelectedArtisan(worker.id));
            dispatch(actions.setDescriptionModalVisible(true));
        } else {
            // If searchReferenceId exists, navigate directly to booking screen
            router.push({
                pathname: '/(tabs)/(search)/(booking)/booking',
                params: {
                    artisanId: worker.id
                }
            });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: cardBg, borderColor }, containerStyle]}>
            <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
            <View style={styles.content}>
                <View style={styles.detailsContainer}>
                    <Image
                        source={{ uri: worker.avatar }}
                        style={[styles.img, { backgroundColor: miscColor }]}
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
               
                <Button 
                    label="BOOK NOW" 
                    onPress={handleBookNow}
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
            </View>
            <BookingDescriptionModal artisan={worker} />
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
        borderRadius: 0
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
