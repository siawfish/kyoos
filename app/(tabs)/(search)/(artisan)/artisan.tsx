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
import { selectUserCurrency } from "@/redux/app/selector";
import { formatPrice } from "@/constants/helpers";
import { selectConversations } from "@/redux/messaging/selector";
import { actions as messagingActions } from "@/redux/messaging/slice";
import { selectIsLoading, selectPortfolios } from "@/redux/portfolio/selector";
import { actions } from "@/redux/portfolio/slice";
import type { Portfolio as PortfolioType } from "@/redux/portfolio/types";
import { selectAllWorkers } from "@/redux/search/selector";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Ionicons } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import PortfolioSkeleton from "@/components/portfolio/Loaders/PortfolioSkeleton";

type DockRow = { id: "__dock__"; kind: "dock" };
type EmptyRow = { id: "__empty__"; kind: "empty" };
type SkeletonRow = { id: string; isSkeleton: true };
type ArtisanListRow = DockRow | EmptyRow | SkeletonRow | PortfolioType;

const DOCK_ROW: DockRow = { id: "__dock__", kind: "dock" };
const EMPTY_ROW: EmptyRow = { id: "__empty__", kind: "empty" };

export default function ArtisanScreen() {
    const router = useRouter();
    const { artisanId } = useLocalSearchParams<{ artisanId: string }>();
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const allWorkers = useAppSelector(selectAllWorkers);
    const conversations = useAppSelector(selectConversations);
    const portfolios = useAppSelector(selectPortfolios);
    const isLoading = useAppSelector(selectIsLoading);
    const currency = useAppSelector(selectUserCurrency);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (artisanId) {
            dispatch(actions.setSelectedWorkerId(artisanId));
            dispatch(actions.fetchPortfolios(artisanId));
        }
    }, [artisanId, dispatch]);

    const artisan = useMemo(() => allWorkers.find((worker) => worker.id === artisanId), [allWorkers, artisanId]);

    // Create skeleton data array when loading
    const skeletonData = useMemo((): SkeletonRow[] => {
        if (isLoading) {
            return new Array(3).fill(null).map((_, index) => ({ id: `skeleton-${index}`, isSkeleton: true }));
        }
        return [];
    }, [isLoading]);

    const listData = useMemo((): ArtisanListRow[] => {
        if (isLoading) {
            return [DOCK_ROW, ...skeletonData];
        }
        if (portfolios.length > 0) {
            return [DOCK_ROW, ...portfolios];
        }
        return [DOCK_ROW, EMPTY_ROW];
    }, [isLoading, portfolios, skeletonData]);

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

    const handleChatPress = () => {
        const conversation = conversations.find((item) => item.workerId === artisan.id);

        if (conversation?.id) {
            dispatch(messagingActions.markConversationAsRead(conversation.id));
            router.push(`/(tabs)/(messaging)/${conversation.id}`);
            return;
        }

        // Refresh the list and route to conversations instead of using worker id as conversation id.
        dispatch(messagingActions.fetchConversations());
        router.push("/(tabs)/(messaging)/messaging");
    };

    const renderHeader = () => {
        return (
            <>
                <AccentScreenHeader
                    containerStyle={styles.header}
                    onBackPress={() => router.back()}
                    renderRight={() => (
                        <IconButton 
                            style={styles.chatButton}
                            lightColor={colors.light.black}
                            darkColor={colors.dark.white}
                            onPress={handleChatPress}
                        >
                            <Ionicons 
                                name="chatbox-ellipses-outline" 
                                size={24} 
                                color={isDark ? colors.dark.black : colors.light.white} 
                            />
                        </IconButton>
                    )}
                    title="WORKER"
                    titleStyle={{
                        fontSize: fontPixel(10),
                        fontFamily: 'SemiBold',
                        letterSpacing: 1.5,
                    }}
                />

                {/* Skills & Rate Section */}
                {
                    artisan?.skills?.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionLabelContainer}>
                                <Text style={[styles.sectionLabel, { color: labelColor }]}>SKILLS & RATES</Text>
                            </View>
                            <View style={styles.skillsList}>
                                {artisan.skills.map((skill, index) => (
                                    <View
                                        key={`${skill.skillId ?? skill.id ?? skill.name}-${index}`}
                                        style={[
                                            styles.skillRow,
                                            index !== artisan.skills.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: borderColor },
                                        ]}
                                    >
                                        <ThemedText style={[styles.skillName, { color: textColor }]} numberOfLines={1}>
                                            {skill.name}
                                        </ThemedText>
                                        <ThemedText style={[styles.skillRate, { color: textColor }]}>
                                            {formatPrice(skill.rate ?? 0, currency)}
                                            <Text style={[styles.rateUnit, { color: labelColor }]}>/hr</Text>
                                        </ThemedText>
                                    </View>
                                ))}
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

    const renderItem = ({ item }: { item: ArtisanListRow }) => {
        if ("kind" in item) {
            if (item.kind === "dock") {
                return (
                    <View style={[styles.dockBlock, { backgroundColor: cardBg }]}>
                        <ProfileCard worker={artisan} />
                    </View>
                );
            }
            if (item.kind === "empty") {
                return <EmptyList message="No recent works found" />;
            }
        }
        if ("isSkeleton" in item && item.isSkeleton) {
            return <PortfolioSkeleton />;
        }
        return <Portfolio portfolio={item as PortfolioType} hideHeader />;
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
                stickyHeaderIndices={[0]}
                ListEmptyComponent={null}
                keyExtractor={(item) => {
                    if ("kind" in item) {
                        return item.id;
                    }
                    if ("isSkeleton" in item && item.isSkeleton) {
                        return item.id;
                    }
                    return item.id;
                }}
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
        paddingBottom: heightPixel(0),
    },
    dockBlock: {
        paddingBottom: heightPixel(8),
    },
    section: {
        marginTop: heightPixel(16),
    },
    sectionLabelContainer: {
        marginBottom: heightPixel(12),
    },
    sectionLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
    },
    skillsList: {
        width: '100%',
    },
    skillRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: heightPixel(10),
        gap: widthPixel(12),
    },
    skillName: {
        flex: 1,
        fontSize: fontPixel(13),
        fontFamily: 'SemiBold',
        letterSpacing: -0.1,
    },
    skillRate: {
        fontSize: fontPixel(13),
        fontFamily: 'Bold',
        letterSpacing: -0.1,
    },
    rateUnit: {
        fontSize: fontPixel(11),
        fontFamily: 'Regular',
    },
    chatButton: {
        width: widthPixel(48),
        height: widthPixel(48),
    },
});
