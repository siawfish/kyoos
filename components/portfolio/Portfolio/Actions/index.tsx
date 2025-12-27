import commentActive from "@/assets/images/comment.png";
import comment from "@/assets/images/comment_grey.png";
import likeActive from "@/assets/images/like.png";
import like from "@/assets/images/like_grey.png";
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectIsLikingPortfolio } from '@/redux/portfolio/selector';
import { actions } from '@/redux/portfolio/slice';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Image, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';

const Actions = ({
    likes,
    comments,
    hasLiked,
    hasCommented,
    id,
    skillIds
}: {
    likes: number;
    comments: number;
    hasLiked: boolean;
    hasCommented: boolean;
    id: string;
    skillIds: string[];
}) => {
    const dispatch = useDispatch();
    const isLikingPortfolio = useSelector(selectIsLikingPortfolio);
    // const skills = useSelector(selectSkills);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // const skillsObj = useMemo(() => {
    //     return skills.filter((skill) => skillIds.includes(skill.id));
    // }, [skills, skillIds]);

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

    return (
        <>
            <View style={[styles.container, {borderTopColor}]}>
                {/* {skillsObj.length > 0 && (
                    <View style={styles.skillsRow}>
                    {
                        skillsObj.slice(0, 3).map((skill) => (
                                <View 
                                key={skill.id} 
                                    style={[styles.skill, { backgroundColor: skillBgColor, borderColor: skillBorderColor }]}
                            >
                                <ThemedText 
                                    type='subtitle'
                                        style={[styles.skillText, { color: skillTextColor }]}
                                >
                                        {skill.name.toUpperCase()}
                                </ThemedText>
                                </View>
                        ))
                    }
                    {skillsObj.length > 3 && (
                            <View style={[styles.skill, { backgroundColor: skillBgColor, borderColor: skillBorderColor }]}>
                            <ThemedText 
                                type='subtitle'
                                    style={[styles.skillText, { color: skillTextColor }]}
                            >
                                +{skillsObj.length - 3}
                            </ThemedText>
                            </View>
                    )}
                </View>
                )} */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity 
                        style={styles.actionBtn}
                        disabled={isLikingPortfolio}
                        onPress={() => dispatch(actions.likePortfolio(id))}
                    >
                        <Image 
                            source={hasLiked ? likeActive : like} 
                            style={styles.actionIcon} 
                        />
                        <ThemedText 
                            style={[styles.actionCount, { color: hasLiked ? skillTextColor : labelColor }]} 
                            type='subtitle'
                        >
                                    {likes}
                                </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => router.push(`/(tabs)/(portfolio)/addComment?id=${id}`)}
                    >
                        <Image 
                            source={hasCommented ? commentActive : comment} 
                            style={styles.actionIcon} 
                        />
                        <ThemedText 
                            style={[styles.actionCount, { color: hasCommented ? skillTextColor : labelColor }]} 
                            type='subtitle'
                        >
                                    {comments}
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
