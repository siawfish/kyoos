import commentActive from "@/assets/images/comment.png";
import comment from "@/assets/images/comment_grey.png";
import likeActive from "@/assets/images/like.png";
import like from "@/assets/images/like_grey.png";
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectCommentFormIsLoading, selectIsLikingPortfolio } from '@/redux/portfolio/selector';
import { actions } from '@/redux/portfolio/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { Portfolio } from "@/redux/portfolio/types";

const Actions = ({
    portfolio,
    onComment,
}: {
    portfolio: Portfolio;
    onComment?: () => void;
}) => {
    const dispatch = useAppDispatch();
    const isLikingPortfolio = useAppSelector(selectIsLikingPortfolio);
    const isCommentingPortfolio = useAppSelector(selectCommentFormIsLoading);

    const borderTopColor = useThemeColor(
        {
            light: colors.light.black,
            dark: colors.dark.white,
        },
        "text"
    );
    const skillBorderColor = borderTopColor;
    const skillBgColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background');
    const skillTextColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text');
    const labelColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary
    }, 'text');

    const scale = useSharedValue(1);

    useEffect(() => {
        if (isLikingPortfolio) {
            scale.value = withRepeat(
                withTiming(1.2, { 
                    duration: 600, 
                    easing: Easing.inOut(Easing.ease) 
                }),
                -1,
                true
            );
        } else {
            scale.value = withTiming(1, { duration: 200 });
        }
    }, [isLikingPortfolio, scale]);

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handleCommentPress = () => {
        onComment?.();
        router.push(`/(tabs)/(search)/(artisan)/(portfolio)/comment?id=${portfolio.id}`)
    }

    return (
        <>
            <View style={[styles.container, {borderTopColor}]}>
                {portfolio.skills.length > 0 && (
                    <View style={styles.skillsRow}>
                    {
                        portfolio.skills.slice(0, 3).map((skill) => (
                                <View 
                                    key={skill?.id} 
                                    style={[styles.skill, { backgroundColor: skillBgColor, borderColor: skillBorderColor }]}
                                >
                                    <ThemedText 
                                        type='subtitle'
                                            style={[styles.skillText, { color: skillTextColor }]}
                                    >
                                        {skill?.name?.toUpperCase()}
                                    </ThemedText>
                                </View>
                        ))
                    }
                    {portfolio.skills.length > 3 && (
                            <View style={[styles.skill, { backgroundColor: skillBgColor, borderColor: skillBorderColor }]}>
                            <ThemedText 
                                type='subtitle'
                                    style={[styles.skillText, { color: skillTextColor }]}
                            >
                                +{portfolio.skills.length - 3}
                            </ThemedText>
                            </View>
                    )}
                </View>
                )}
                <View style={styles.actionsRow}>
                    <TouchableOpacity 
                        style={styles.actionBtn}
                        disabled={isLikingPortfolio}
                        onPress={() => dispatch(actions.likePortfolio(portfolio.id))}
                    >
                        <Animated.Image 
                            source={portfolio.hasLiked ? likeActive : like} 
                            style={[styles.actionIcon, iconAnimatedStyle]} 
                        />
                        <ThemedText 
                            style={[styles.actionCount, { color: portfolio.hasLiked ? skillTextColor : labelColor }]} 
                            type='subtitle'
                        >
                            {portfolio.likes}
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.actionBtn}
                        disabled={isCommentingPortfolio}
                        onPress={handleCommentPress}
                    >
                        <Animated.Image 
                            source={portfolio.hasCommented ? commentActive : comment} 
                            style={styles.actionIcon} 
                        />
                        <ThemedText 
                            style={[styles.actionCount, { color: portfolio.hasCommented ? skillTextColor : labelColor }]} 
                            type='subtitle'
                        >
                            {portfolio.comments}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
}

export default Actions

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingTop: heightPixel(16),
        marginTop: heightPixel(4),
        borderTopWidth: 0.5,
        gap: heightPixel(12),
    },
    skillsRow: {
        flexDirection: 'row',
        gap: widthPixel(8),
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    skill: {
        paddingHorizontal: widthPixel(12),
        paddingVertical: heightPixel(6),
        borderRadius: 0,
        borderWidth: 0.5,
    },
    skillText: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: widthPixel(24),
        alignItems: 'center',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(6),
    },
    actionIcon: {
        width: widthPixel(18),
        height: widthPixel(18),
        objectFit: 'contain',
    },
    actionCount: {
        fontSize: fontPixel(12),
        fontFamily: 'SemiBold',
        minWidth: widthPixel(16),
    }
})