import BackButton from "@/components/ui/BackButton";
import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { fontPixel, widthPixel, heightPixel } from "@/constants/normalize";
import { Link, useRouter } from "expo-router";
import { View, StyleSheet, ScrollView } from "react-native";
import { colors } from "@/constants/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import Portfolio from "@/components/portfolio/Portfolio";
import ProfileCard from "@/components/account/ProfileCard";
import { useThemeColor } from "@/hooks/use-theme-color";
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
    const backgroundColor = useThemeColor({ light: colors.light.white, dark: colors.dark.black }, 'background');

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
                    <IconButton style={styles.chatButton}>
                        <Ionicons name="chatbox-ellipses-outline" size={24} color={colors.light.white} />
                    </IconButton>
                </Link>
            </View>
            
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Basic Info Section */}
                <ProfileCard />

                {/* Skills & Rate Section */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Skills & Rates</ThemedText>
                    <View style={styles.skillsContainer}>
                        {artisan.skills?.map((skill, index) => (
                            <View key={index} style={[styles.skillBadge, { backgroundColor }]}>
                                <ThemedText style={styles.skillText}>
                                    {skill.name} • {skill.rate}
                                </ThemedText>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Portfolio Section */}
                <View style={styles.section}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Works</ThemedText>
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
        paddingHorizontal: widthPixel(16),
    },
    card: {
        backgroundColor: colors.light.white,
        borderRadius: widthPixel(16),
        padding: widthPixel(16),
        marginTop: heightPixel(16),
        shadowColor: colors.light.text,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    basicInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(10),
    },
    avatar: {
        width: widthPixel(80),
        height: widthPixel(80),
        borderRadius: widthPixel(40),
    },
    bioContainer: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    nameContainer: {
        flexDirection: 'row',
        gap: widthPixel(10),
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    name: {
        fontSize: fontPixel(18),
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: heightPixel(4),
    },
    infoText: {
        marginLeft: widthPixel(8),
        fontSize: fontPixel(14),
    },
    section: {
        marginTop: heightPixel(16),
    },
    sectionTitle: {
        fontSize: fontPixel(16),
        marginBottom: heightPixel(8),
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: widthPixel(12),
    },
    skillBadge: {
        backgroundColor: colors.light.white,
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(8),
        borderRadius: widthPixel(20),
        borderWidth: 1,
        borderColor: colors.light.tint,
    },
    skillText: {
        color: colors.light.tint,
        fontSize: fontPixel(14),
        fontFamily: 'Medium',
    },
    chatButton: {
        backgroundColor: colors.light.tint,
        borderRadius: widthPixel(20),
        padding: widthPixel(10),
    },
})