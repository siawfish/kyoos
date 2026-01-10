import { ConfirmActionSheet } from '@/components/ui/ConfirmActionSheet';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import Thumbnails from '@/components/ui/Thumbnails';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Portfolio } from '@/redux/portfolio/types';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Options } from '../Options';
import User from '../User';
import Actions from './Actions';
import { useSharing } from '@/hooks/use-sharing';
import { OptionIcons } from '@/redux/app/types';

interface PortfolioProps {
  portfolio: Portfolio;
  clickable?: boolean;
}

const PortfolioItem = ({ portfolio, clickable = true }: PortfolioProps) => {
    const { share } = useSharing();
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const theme = useAppTheme();
    const isDark = theme === 'dark';

    const cardBg = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background');
    const borderColor = isDark ? colors.dark.white : colors.light.black;
    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text');

    const handleReport = () => {
        console.log('report');
    };

    const handleShare = () => {
        share(`${process.env.EXPO_PUBLIC_API_URL}/portfolio/${portfolio.id}`);
    };

    const handleAddComment = () => {
        router.push(`/(tabs)/(search)/(artisan)/(portfolio)/comment?id=${portfolio.id}`);
    };

    const options = [
        {
            label: 'Add comment',
            icon: OptionIcons.COMMENT,
            onPress: handleAddComment,
        },
        {
            label: 'Share',
            icon: OptionIcons.SHARE,
            onPress: handleShare,
        },
        {
            label: 'Report',
            icon: OptionIcons.FLAG,
            onPress: handleReport,
            isDanger: true,
        },
    ];

    const portfolioContent = () => {
        return (
            <>
                <View style={[styles.content, { borderColor }]}>
                    <View style={styles.topContent}>
                        <User
                            name={portfolio.createdBy?.name}
                            avatar={portfolio.createdBy?.avatar}
                            createdAt={portfolio.createdAt}
                        />
                        <Options 
                            options={options}
                        />
                    </View>
                    {
                        portfolio?.assets?.length > 0 &&
                        <Thumbnails 
                            portfolio={portfolio}
                        />
                    }
                    <ThemedText 
                        darkColor={colors.dark.text} 
                        lightColor={colors.light.text} 
                        style={[styles.description, { color: textColor }]}
                    >
                        {portfolio.description}
                    </ThemedText>
                    <Actions 
                        portfolio={portfolio}
                    />
                </View>
            </>
        )
    }

    return (
        <>
            {
                clickable ? (
                    <Link href={`/(tabs)/(search)/(artisan)/(portfolio)/${portfolio.id}`} asChild>
                        <Pressable style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
                            {portfolioContent()}
                        </Pressable>
                    </Link>
                ) : (
                    <View style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
                        {portfolioContent()}
                    </View>
                )
            }
            <ConfirmActionSheet
                isOpen={isDeleteConfirmationOpen}
                isOpenChange={setIsDeleteConfirmationOpen}
                title="Delete Portfolio"
                description="Are you sure you want to delete this portfolio? This action cannot be undone."
                onConfirm={() => {}}
                icon={<Image source={require('@/assets/images/danger.png')} style={styles.icon} />}
                onCancel={() => setIsDeleteConfirmationOpen(false)}
                confirmButtonStyle={{
                    backgroundColor: colors.light.danger,
                }}
                confirmText='Yes, Delete'
            />
        </>
    )
}

export default PortfolioItem;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: "auto",
        flexDirection: 'row',
        marginHorizontal: 0,
        marginBottom: heightPixel(16),
        overflow: 'hidden',
    },
    leftAccent: {
        width: widthPixel(4),
    },
    content: {
        flex: 1,
        padding: widthPixel(16),
        gap: heightPixel(12),
        borderWidth: 0.5,
    },
    topContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    description: {
        fontFamily: 'Regular',
        fontSize: fontPixel(15),
        lineHeight: fontPixel(22),
        marginTop: heightPixel(4),
    },
    icon: {
        width: widthPixel(60),
        height: widthPixel(60),
    }
})
