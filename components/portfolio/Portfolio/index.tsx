import { ConfirmActionSheet } from '@/components/ui/ConfirmActionSheet';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import Thumbnails from '@/components/ui/Thumbnails';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectUser } from '@/redux/app/selector';
import { actions } from '@/redux/portfolio/slice';
import { Portfolio } from '@/redux/portfolio/types';
import { useDispatch, useSelector } from 'react-redux';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, useColorScheme, View } from 'react-native';
import { Options } from '../Options';
import User from '../User';
import Actions from './Actions';

interface PortfolioProps {
  portfolio: Portfolio;
  clickable?: boolean;
}

const PortfolioItem = ({ portfolio, clickable = true }: PortfolioProps) => {
    const dispatch = useDispatch();
    const loggedInUser = useSelector(selectUser);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const cardBg = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background');
    const borderColor = isDark ? colors.dark.white : colors.light.black;
    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text');

    const portfolioContent = () => {
        return (
            <>
                <View style={[styles.leftAccent, { backgroundColor: borderColor }]} />
                    <View style={styles.content}>
                        <View style={styles.topContent}>
                            <User
                                name={loggedInUser?.name as string}
                                avatar={loggedInUser?.avatar as string}
                                createdAt={portfolio.createdAt}
                            />
                            <Options 
                        onEdit={() => router.push(`/(tabs)/(portfolio)/add?id=${portfolio.id}`)}
                                onDelete={() => setIsDeleteConfirmationOpen(true)}
                            />
                        </View>
                        {
                            portfolio?.assets?.length > 0 &&
                            <Thumbnails 
                                data={portfolio?.assets}
                            />
                        }
                    <View>
                    <ThemedText 
                        darkColor={colors.dark.text} 
                        lightColor={colors.light.text} 
                        style={[styles.description, { color: textColor }]}
                    >
                        {portfolio.description}
                    </ThemedText>
                    </View>
                    <Actions 
                        likes={portfolio.likes}
                        comments={portfolio.comments}
                        hasLiked={portfolio.hasLiked}
                        hasCommented={portfolio.hasCommented}
                        id={portfolio.id}
                        skillIds={portfolio.skills}
                    />
                </View>
            </>
        )
    }

    return (
        <>
            {
                clickable ? (
                    <Link href={`/(tabs)/(portfolio)/${portfolio.id}`} asChild>
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
                onConfirm={() => dispatch(actions.deletePortfolio(portfolio.id))}
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
        borderWidth: 0.5,
        borderLeftWidth: 0,
        overflow: 'hidden',
    },
    leftAccent: {
        width: widthPixel(4),
    },
    content: {
        flex: 1,
        padding: widthPixel(16),
        gap: heightPixel(12),
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
