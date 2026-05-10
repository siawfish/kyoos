import { ConfirmActionSheet } from '@/components/ui/ConfirmActionSheet';
import ReportSheet from '@/components/ui/ReportSheet';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import Thumbnails from '@/components/ui/Thumbnails';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { actions } from '@/redux/portfolio/slice';
import { Portfolio } from '@/redux/portfolio/types';
import { useAppDispatch } from '@/store/hooks';
import { Link, router } from 'expo-router';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Options } from '../Options';
import User from '../User';
import Actions from './Actions';
import { useSharing } from '@/hooks/use-sharing';
import { OptionIcons, Options as OptionsType } from '@/redux/app/types';

interface PortfolioProps {
  portfolio: Portfolio;
  clickable?: boolean;
  hideHeader?: boolean;
}

const PortfolioItem = ({ portfolio, clickable = true, hideHeader = false }: PortfolioProps) => {
    const dispatch = useAppDispatch();
    const { share } = useSharing();
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const [showReportSheet, setShowReportSheet] = useState(false);
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

    const handleShare = useCallback(() => {
        share(`${process.env.EXPO_PUBLIC_API_URL}/portfolio/${portfolio.id}`);
    }, [share, portfolio.id]);

    const handleAddComment = useCallback(() => {
        router.push(`/(tabs)/(search)/(artisan)/(portfolio)/comment?id=${portfolio.id}`);
    }, [portfolio.id]);

    const handleOpenReport = useCallback(() => {
        setShowReportSheet(true);
    }, []);

    const handleCloseReport = useCallback(() => {
        setShowReportSheet(false);
    }, []);

    const handleConfirmReport = useCallback(
        (reason: string, comment: string) => {
            setShowReportSheet(false);
            dispatch(
                actions.reportPortfolio({
                    portfolioId: portfolio.id,
                    reason,
                    comment,
                })
            );
        },
        [dispatch, portfolio.id]
    );

    console.log('portfolio.hasReported', portfolio);

    const options = useMemo(() => {
        const items: OptionsType[] = [
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
        ];
        if (!portfolio.hasReported) {
            items.push({
                label: 'Report',
                icon: OptionIcons.FLAG,
                onPress: handleOpenReport,
                isDanger: true,
            });
        }
        return items;
    }, [handleAddComment, handleOpenReport, handleShare, portfolio.hasReported]);

    const portfolioContent = () => {
        return (
            <View style={styles.content}>
                {!hideHeader && (
                    <View style={styles.header}>
                        <User
                            name={portfolio.createdBy?.name}
                            avatar={portfolio.createdBy?.avatar}
                            createdAt={portfolio.createdAt}
                        />
                        <Options
                            options={options}
                        />
                    </View>
                )}
                {
                    portfolio?.assets?.length > 0 &&
                    <Thumbnails
                        portfolio={portfolio}
                        autoplayVideos={!clickable}
                    />
                }
                <View style={styles.footer}>
                    {portfolio.description ? (
                        <ThemedText
                            darkColor={colors.dark.text}
                            lightColor={colors.light.text}
                            style={[styles.description, { color: textColor }]}
                        >
                            {portfolio.description}
                        </ThemedText>
                    ) : null}
                    <View style={[styles.engagement, { borderTopColor: borderColor }]}>
                        <Actions
                            portfolio={portfolio}
                        />
                    </View>
                </View>
            </View>
        )
    }

    return (
        <>
            {
                clickable ? (
                    <Link href={`/(tabs)/(search)/(artisan)/(portfolio)/${portfolio.id}`} asChild>
                        <Pressable
                            style={StyleSheet.flatten([
                                styles.container,
                                { backgroundColor: cardBg, borderColor },
                            ])}
                        >
                            {portfolioContent()}
                        </Pressable>
                    </Link>
                ) : (
                    <View style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
                        {portfolioContent()}
                    </View>
                )
            }
            {isDeleteConfirmationOpen && (
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
            )}
            {showReportSheet && (
                <ReportSheet
                    isOpen={showReportSheet}
                    onClose={handleCloseReport}
                    onConfirm={handleConfirmReport}
                    subject="portfolio"
                    userName={portfolio.createdBy?.name}
                />
            )}
        </>
    )
}

const arePropsEqual = (prev: PortfolioProps, next: PortfolioProps) => {
    if (prev.clickable !== next.clickable) return false;
    if (prev.hideHeader !== next.hideHeader) return false;
    const a = prev.portfolio;
    const b = next.portfolio;
    if (a === b) return true;
    if (!a || !b) return false;
    return (
        a.id === b.id &&
        a.description === b.description &&
        a.likes === b.likes &&
        a.comments === b.comments &&
        a.hasLiked === b.hasLiked &&
        a.hasCommented === b.hasCommented &&
        a.hasReported === b.hasReported &&
        a.createdAt === b.createdAt &&
        a.assets?.length === b.assets?.length &&
        a.skills?.length === b.skills?.length &&
        a.createdBy?.id === b.createdBy?.id &&
        a.createdBy?.name === b.createdBy?.name &&
        a.createdBy?.avatar === b.createdBy?.avatar
    );
};

export default memo(PortfolioItem, arePropsEqual);

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: "auto",
        marginHorizontal: 0,
        paddingBottom: heightPixel(16),
        marginBottom: heightPixel(16),
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    content: {
        flex: 1,
        gap: heightPixel(12),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    footer: {
        gap: heightPixel(10),
    },
    engagement: {
        paddingTop: heightPixel(10),
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    description: {
        fontFamily: 'Regular',
        fontSize: fontPixel(15),
        lineHeight: fontPixel(22),
    },
    icon: {
        width: widthPixel(60),
        height: widthPixel(60),
    }
})
