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
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
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

    useEffect(() => {
        if (artisanId) {
            dispatch(actions.setSelectedWorkerId(artisanId));
            dispatch(actions.fetchPortfolios(artisanId));
        }
    }, [artisanId, dispatch]);

    const artisan = useMemo(() => allWorkers.find((worker) => worker.id === artisanId), [allWorkers, artisanId]);

    // Create skeleton data array when loading
    const skeletonData = useMemo(() => {
        if (isLoading) {
            return Array(3).fill(null).map((_, index) => ({ id: `skeleton-${index}`, isSkeleton: true }));
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
                    style={styles.header}
                    accentColor={accentColor}
                    accentSpacing="loose"
                    toolbarBottomGap={heightPixel(8)}
                    onBackPress={() => router.back()}
                    trailing={
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
                    }
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
                        <>
                            <View style={styles.section}>
                                <View style={styles.sectionLabelContainer}>
                                    <Text style={[styles.sectionLabel, { color: labelColor }]}>SKILLS & RATES</Text>
                                </View>
                                <View style={[styles.skillsCard, { backgroundColor: cardBg, borderColor }]}>
                                    <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
                                    <View style={styles.skillsContent}>
                                        {artisan?.skills?.map((skill, index) => (
                                            <View 
                                                key={index} 
                                                style={[
                                                    styles.skillItem, 
                                                    { borderColor },
                                                    index !== (artisan?.skills?.length ?? 0) - 1 && styles.skillItemBorder
                                                ]}
                                            >
                                                <View style={styles.skillInfo}>
                                                    <ThemedText style={[styles.skillName, { color: textColor }]}>
                                                        {skill.name}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.skillLabel, { color: labelColor }]}>
                                                        HOURLY RATE
                                                    </ThemedText>
                                                </View>
                                                <View style={styles.rateContainer}>
                                                    <ThemedText style={[styles.skillRate, { color: textColor }]}>
                                                        GH₵{skill.rate}
                                                    </ThemedText>
                                                    <ThemedText style={[styles.rateUnit, { color: labelColor }]}>
                                                        /hr
                                                    </ThemedText>
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        </>
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
                ListEmptyComponent={!isLoading ? <EmptyList message="No recent works found" /> : null}
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
        marginBottom: heightPixel(24),
    },
    section: {
        marginTop: heightPixel(24),
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
        borderTopWidth: 0,
        overflow: 'hidden',
    },
    topAccent: {
        height: heightPixel(3),
        width: '100%',
    },
    skillsContent: {
        paddingVertical: heightPixel(4),
    },
    skillItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: widthPixel(20),
        paddingVertical: heightPixel(18),
    },
    skillItemBorder: {
        borderBottomWidth: 0.5,
    },
    skillInfo: {
        flex: 1,
        gap: heightPixel(4),
    },
    skillName: {
        fontSize: fontPixel(16),
        fontFamily: 'Medium',
        letterSpacing: -0.3,
    },
    skillLabel: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
    },
    rateContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: widthPixel(2),
    },
    skillRate: {
        fontSize: fontPixel(20),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
    },
    rateUnit: {
        fontSize: fontPixel(12),
        fontFamily: 'Regular',
    },
    chatButton: {
        width: widthPixel(48),
        height: widthPixel(48),
    },
});
