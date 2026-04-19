import ProfileCard from "@/components/account/ProfileCard";
import Portfolio from "@/components/portfolio/Portfolio";
import KyoosNotFoundScreen from "@/components/search/KyoosNotFoundScreen";
import { AccentScreenHeader } from "@/components/ui/AccentScreenHeader";
import EmptyList from "@/components/ui/EmptyList";
import IconButton from "@/components/ui/IconButton";
import { ScreenLayout } from "@/components/layout/ScreenLayout";
import { TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP } from "@/constants/navigation/tabRootScrollPadding";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { selectIsLoading, selectPortfolios } from "@/redux/portfolio/selector";
import { actions } from "@/redux/portfolio/slice";
import { selectAllWorkers } from "@/redux/search/selector";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import PortfolioSkeleton from "@/components/portfolio/Loaders/PortfolioSkeleton";

export default function ArtisanScreen() {
    const router = useRouter();
    const { artisanId } = useLocalSearchParams<{ artisanId: string }>();
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const allWorkers = useAppSelector(selectAllWorkers);
    const portfolios = useAppSelector(selectPortfolios);
    const isLoading = useAppSelector(selectIsLoading);
    const dispatch = useAppDispatch();
    const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);

    useEffect(() => {
        if (artisanId) {
            dispatch(actions.setSelectedWorkerId(artisanId));
            dispatch(actions.fetchPortfolios(artisanId));
        }
    }, [artisanId, dispatch]);

    const artisan = useMemo(() => allWorkers.find((worker) => worker.id === artisanId), [allWorkers, artisanId]);

    const skillsSummary = useMemo(() => {
        const skills = artisan?.skills ?? [];
        if (skills.length === 0) {
            return "No skills added";
        }

        const rates = skills
            .map((skill) => skill.rate ?? 0)
            .filter((rate) => rate > 0);

        if (rates.length === 0) {
            return `${skills.length} skills`;
        }

        const minRate = Math.min(...rates);
        const maxRate = Math.max(...rates);
        const rateLabel = minRate === maxRate
            ? `GH₵${minRate}/hr`
            : `GH₵${minRate}-${maxRate}/hr`;

        return `${skills.length} skills • ${rateLabel}`;
    }, [artisan?.skills]);

    useEffect(() => {
        setIsSkillsExpanded(false);
    }, [artisanId]);

    // Create skeleton data array when loading
    const skeletonData = useMemo(() => {
        if (isLoading) {
            return new Array(3).fill(null).map((_, index) => ({ id: `skeleton-${index}`, isSkeleton: true }));
        }
        return [];
    }, [isLoading]);

    // Determine which data to show
    const listData = isLoading ? skeletonData : portfolios;

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

    const borderColor = accentColor;

    const cardBg = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background');

    if (!artisan) {
        return (
            <KyoosNotFoundScreen />
        )
    }

    const renderHeader = () => {
        return (
            <>
                <AccentScreenHeader
                    containerStyle={styles.header}
                    onBackPress={() => router.back()}
                    renderRight={() => (
                        <Link asChild href={`/(tabs)/(messaging)/${artisan?.id}`}>
                            <IconButton 
                                style={styles.chatButton}
                                lightColor={colors.light.black}
                                darkColor={colors.dark.white}
                            >
                                <Ionicons 
                                    name="chatbox-ellipses-outline" 
                                    size={24} 
                                    color={isDark ? colors.dark.black : colors.light.white} 
                                />
                            </IconButton>
                        </Link>
                    )}
                    title="WORKER"
                    titleStyle={{
                        fontSize: fontPixel(10),
                        fontFamily: 'SemiBold',
                        letterSpacing: 1.5,
                    }}
                />

                {/* Basic Info Section */}
                <ProfileCard worker={artisan!} />

                {/* Skills & Rate Section */}
                {
                    artisan?.skills?.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionLabelContainer}>
                                <Text style={[styles.sectionLabel, { color: labelColor }]}>SKILLS & RATES</Text>
                            </View>
                            <View style={[styles.skillsCard, { backgroundColor: cardBg, borderColor }]}>
                                <Pressable
                                    style={[styles.skillsSummaryRow, { borderColor }]}
                                    onPress={() => setIsSkillsExpanded((prev) => !prev)}
                                >
                                    <View style={styles.skillsSummaryContent}>
                                        <ThemedText style={[styles.skillsSummaryTitle, { color: textColor }]}>
                                            {skillsSummary}
                                        </ThemedText>
                                        <ThemedText style={[styles.skillsSummaryHint, { color: labelColor }]}>
                                            {isSkillsExpanded ? "Tap to collapse details" : "Tap to expand details"}
                                        </ThemedText>
                                    </View>
                                    <Ionicons
                                        name={isSkillsExpanded ? "chevron-up-outline" : "chevron-down-outline"}
                                        size={16}
                                        color={textColor}
                                    />
                                </Pressable>

                                {isSkillsExpanded && (
                                    <>
                                        <View style={[styles.skillsHeader, { borderColor }]}>
                                            <ThemedText style={[styles.skillsHeaderText, { color: labelColor }]}>
                                                SKILL
                                            </ThemedText>
                                            <ThemedText style={[styles.skillsHeaderText, { color: labelColor }]}>
                                                RATE / HOUR
                                            </ThemedText>
                                        </View>
                                        {artisan?.skills?.map((skill, index) => (
                                            <View
                                                key={`${skill.skillId ?? skill.id ?? skill.name}-${index}`}
                                                style={[
                                                    styles.skillItem,
                                                    { borderColor },
                                                    index !== (artisan?.skills?.length ?? 0) - 1 && styles.skillItemBorder,
                                                ]}
                                            >
                                                <View style={styles.skillInfo}>
                                                    <ThemedText style={[styles.skillName, { color: textColor }]}>
                                                        {skill.name}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.skillLabel, { color: labelColor }]}>
                                                        SERVICE
                                                    </ThemedText>
                                                </View>
                                                <View style={[styles.rateBadge]}>
                                                    <ThemedText style={[styles.skillRate, { color: textColor }]}>
                                                        GH₵{skill.rate ?? 0}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.rateUnit, { color: labelColor }]}>
                                                        /hr
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        ))}
                                    </>
                                )}
                            </View>
                        </View>
                    )
                }
                <View style={styles.section}>
                    <View style={styles.sectionLabelContainer}>
                        <Text style={[styles.sectionLabel, { color: labelColor }]}>RECENT WORKS</Text>
                    </View>
                </View>
            </>
        )
    }

    const renderItem = ({ item }: { item: any }) => {
        if (item?.isSkeleton) {
            return <PortfolioSkeleton />;
        }
        return <Portfolio portfolio={item} />;
    };

    return (
        <ScreenLayout style={styles.container}>
            <FlashList 
                style={styles.content} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
                data={listData}
                renderItem={renderItem}
                ListEmptyComponent={isLoading ? null : <EmptyList message="No recent works found" />}
                keyExtractor={(item) => item.id}
            />
        </ScreenLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: widthPixel(16),
        paddingBottom: TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP,
    },
    header: {
        paddingHorizontal: widthPixel(0),
    },
    section: {
        marginTop: heightPixel(20),
    },
    sectionLabelContainer: {
        marginBottom: heightPixel(12),
    },
    sectionLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
    },
    skillsCard: {
        borderWidth: 0.5,
        borderTopWidth: 0.5,
        width: '100%',
        overflow: 'hidden',
    },
    skillsSummaryRow: {
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(12),
        borderBottomWidth: 0.5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: widthPixel(12),
    },
    skillsSummaryContent: {
        flex: 1,
        gap: heightPixel(4),
    },
    skillsSummaryTitle: {
        fontSize: fontPixel(13),
        fontFamily: 'SemiBold',
        letterSpacing: -0.1,
    },
    skillsSummaryHint: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.05,
    },
    skillsHeader: {
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(10),
        borderBottomWidth: 0.5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skillsHeaderText: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.1,
    },
    skillItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(14),
        gap: widthPixel(12),
    },
    skillItemBorder: {
        borderBottomWidth: 0.5,
    },
    skillInfo: {
        flex: 1,
        gap: heightPixel(4),
    },
    skillName: {
        fontSize: fontPixel(15),
        fontFamily: 'SemiBold',
        letterSpacing: -0.2,
    },
    skillLabel: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.1,
    },
    rateBadge: {
        borderWidth: 0.5,
        alignItems: 'flex-end',
        justifyContent: 'center',
        minWidth: widthPixel(92),
    },
    skillRate: {
        fontSize: fontPixel(17),
        fontFamily: 'Bold',
        letterSpacing: -0.3,
    },
    rateUnit: {
        fontSize: fontPixel(10),
        fontFamily: 'Regular',
    },
    chatButton: {
        width: widthPixel(48),
        height: widthPixel(48),
    },
});
