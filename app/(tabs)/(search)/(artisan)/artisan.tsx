import BackButton from "@/components/ui/BackButton";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { fontPixel, widthPixel, heightPixel } from "@/constants/normalize";
import { Link, useRouter } from "expo-router";
import { View, StyleSheet, ScrollView, Text } from "react-native";
import { colors } from "@/constants/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import Portfolio from "@/components/portfolio/Portfolio";
import ProfileCard from "@/components/account/ProfileCard";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAppTheme } from "@/hooks/use-app-theme";
import IconButton from "@/components/ui/IconButton";
import { Worker } from "@/redux/search/types";
import { UserTypes } from "@/redux/app/types";

// Dummy artisan data
const dummyArtisan: Partial<Worker> = {
    id: "123",
    name: "John Smith",
    rating: 4.8,
    avatar: "https://via.placeholder.com/150",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
    accountStatus: 1,
    userType: UserTypes.WORKER,
    ghanaCard: {
        number: "1234567890",
        front: "https://via.placeholder.com/150",
        back: "https://via.placeholder.com/150",
        isVerified: true,
    },
    skills: [
        { name: "Carpenter", rate: 30, id: "1" },
        { name: "Furniture Maker", rate: 35, id: "2" },
        { name: "Wood Finishing", rate: 25, id: "3" },
        { name: "Custom Design", rate: 40, id: "4" },
    ],
};

export default function ArtisanScreen({
    artisan=dummyArtisan
}: {
    artisan: Partial<Worker>
}) {
    const router = useRouter();
    const theme = useAppTheme();
    const isDark = theme === 'dark';

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

    const portfolio = {
        id: '1',
        title: 'Portfolio 1',
        description: 'Description 1',
        assets: [],
        skills: [],
        likes: 0,
        comments: 0,
        hasLiked: false,
        hasCommented: false,
        createdAt: '2021-01-01',
        updatedAt: '2021-01-01',
        createdBy: '1',
    };

    return (
        <ThemedSafeAreaView style={styles.container}>
            <View style={styles.backButtonContainer}>
                <BackButton
                    iconName="arrow-left"
                    onPress={() => router.back()}
                />
                <Link asChild href={`/(tabs)/(messaging)/${artisan.id}`}>
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
            </View>
            
            <ScrollView 
                style={styles.content} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                    <Text style={[styles.label, { color: labelColor }]}>ARTISAN</Text>
                </View>

                {/* Basic Info Section */}
                <ProfileCard />

                {/* Skills & Rate Section */}
                <View style={styles.section}>
                    <View style={styles.sectionLabelContainer}>
                        <Text style={[styles.sectionLabel, { color: labelColor }]}>SKILLS & RATES</Text>
                    </View>
                    <View style={[styles.skillsCard, { backgroundColor: cardBg, borderColor }]}>
                        <View style={[styles.topAccent, { backgroundColor: accentColor }]} />
                        <View style={styles.skillsContent}>
                            {artisan.skills?.map((skill, index) => (
                                <View 
                                    key={index} 
                                    style={[
                                        styles.skillItem, 
                                        { borderColor },
                                        index !== (artisan.skills?.length ?? 0) - 1 && styles.skillItemBorder
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

                {/* Portfolio Section */}
                <View style={styles.section}>
                    <View style={styles.sectionLabelContainer}>
                        <Text style={[styles.sectionLabel, { color: labelColor }]}>RECENT WORKS</Text>
                    </View>
                    <Portfolio portfolio={portfolio} />
                </View>
            </ScrollView>
        </ThemedSafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButtonContainer: {
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(16),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: widthPixel(16),
        paddingBottom: heightPixel(100),
    },
    header: {
        marginBottom: heightPixel(24),
    },
    accentBar: {
        width: widthPixel(40),
        height: heightPixel(4),
        marginBottom: heightPixel(20),
    },
    label: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
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
