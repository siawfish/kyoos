import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { actions as bookingActions } from '@/redux/booking/slice';
import { selectSearchReferenceId } from '@/redux/search/selector';
import { actions } from '@/redux/search/slice';
import { Worker } from '@/redux/search/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { memo, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface ProfileCardProps {
    readonly containerStyle?: StyleProp<ViewStyle>;
    readonly worker: Worker;
}

function ProfileCard({ worker, containerStyle }: ProfileCardProps) {
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

    const averageRate = useMemo(() => {
        const rates = worker.skills
            .map((skill) => skill.rate ?? 0)
            .filter((rate) => rate > 0);

        if (rates.length === 0) return 0;
        return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length);
    }, [worker.skills]);

    const handleBookNow = () => {
        // Check if searchReferenceId is empty - if so, show description modal
        if (searchReferenceId === '') {
            dispatch(actions.setSelectedArtisan(worker.id));
            dispatch(actions.setAiSearchBookingWorker(worker));
            router.push({
                pathname: '/(tabs)/(search)/ai-search',
                params: { mode: 'booking' },
            });
        } else {
            // If searchReferenceId exists, navigate directly to booking screen
            dispatch(bookingActions.initializeBooking(worker.id));
            router.push({
                pathname: '/(tabs)/(search)/(booking)/booking'
            });
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: cardBg, borderColor }, containerStyle]}>
            <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
            <View style={styles.content}>
                <View style={styles.profileRow}>
                    <Image
                        source={{ uri: worker.avatar }}
                        cachePolicy="memory-disk"
                        contentFit="cover"
                        transition={0}
                        style={[styles.img, { backgroundColor: miscColor }]}
                    />
                    <View style={styles.details}>
                        <ThemedText
                            type="subtitle"
                            style={[styles.name, { color: textColor }]}
                            numberOfLines={1}
                        >
                            {worker.name}
                        </ThemedText>
                        <View style={styles.ratingRow}>
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
                                {worker.rating}
                            </ThemedText>
                            <AntDesign
                                name="star"
                                size={12}
                                color={textColor}
                            />
                        </View>
                        <ThemedText
                            style={[styles.location, { color: labelColor }]}
                            numberOfLines={1}
                        >
                            {worker.location?.address || 'Location not set'}
                        </ThemedText>
                    </View>

                    <IconButton  
                        onPress={handleBookNow}
                        style={styles.bookNowButton}
                    >
                        <SimpleLineIcons 
                            name="calendar" 
                            size={fontPixel(14)} 
                            color={textColor}
                        />
                    </IconButton>
                </View>
            </View>
        </View>
    )
}

const MemoizedProfileCard = memo(ProfileCard, (prevProps, nextProps) => {
    return (
        prevProps.worker.id === nextProps.worker.id &&
        prevProps.worker.avatar === nextProps.worker.avatar &&
        prevProps.containerStyle === nextProps.containerStyle
    );
});

export default MemoizedProfileCard;

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
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(16),
        gap: heightPixel(14),
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: widthPixel(12),
    },
    details: {
        flex: 1,
        gap: heightPixel(4),
    },
    name: {
        fontSize: fontPixel(16),
        fontFamily: 'Bold',
        letterSpacing: -0.6,
    },
    metaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: widthPixel(8),
    },
    metaBadge: {
        borderWidth: 0.5,
        paddingHorizontal: widthPixel(8),
        paddingVertical: heightPixel(4),
    },
    metaBadgeText: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.1,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(6),
    },
    ratingLabel: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
    },
    rating: {
        fontSize: fontPixel(14),
        fontFamily: 'Bold',
        letterSpacing: -0.2,
    },
    location: {
        fontSize: fontPixel(11),
        fontFamily: 'Medium',
    },
    img: { 
        width: widthPixel(50), 
        height: widthPixel(50),
        borderRadius: 0
    },
    bookNowButton: {
        width: widthPixel(48),
        height: widthPixel(48),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    }
})
