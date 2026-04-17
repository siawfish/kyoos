import User from '@/components/portfolio/User';
import { AccentScreenHeader } from '@/components/ui/AccentScreenHeader';
import Button from '@/components/ui/Button';
import SmartTextArea from '@/components/ui/SmartTextArea';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import Thumbnails from '@/components/ui/Thumbnails';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectCommentForm, selectCommentFormIsLoading, selectComments, selectPortfolios } from '@/redux/portfolio/selector';
import { actions } from '@/redux/portfolio/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { FontAwesome } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/use-app-theme';
import { TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP } from '@/constants/navigation/tabRootScrollPadding';

const Comment = () => {
    const dispatch = useAppDispatch();
    const { id, commentId } = useLocalSearchParams();
    const commentForm = useAppSelector(selectCommentForm);
    const isLoading = useAppSelector(selectCommentFormIsLoading);
    const portfolios = useAppSelector(selectPortfolios);
    const comments = useAppSelector(selectComments);
    const portfolio = useMemo(() => portfolios.find((portfolio) => portfolio.id === id), [id, portfolios]);
    const comment = useMemo(() => comments.find((comment) => comment.id === commentId), [commentId, comments]);
    const colorScheme = useAppTheme();
    const isDark = colorScheme === 'dark';

    const borderColor = useThemeColor(
        { light: colors.light.grey, dark: colors.dark.grey },
        'grey'
    );
    const backgroundColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background');
    const accentColor = isDark ? colors.dark.white : colors.light.black;
    const labelColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary
    }, 'text');
    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text
    }, 'text');
    const buttonIconColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black,
    }, 'text');
    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'text');

    useEffect(() => {
        if (!comment) return;
        dispatch(actions.setCommentFormValue(comment.comment));
    }, [comment, dispatch]);

    const handleSubmit = useCallback(() => {
        if (commentForm.comment.length === 0) return;
        router.back();
        dispatch(actions.submitComment(id as string));
    }, [dispatch, id, commentForm.comment]);

    const handleUpdate = useCallback(() => {
        if (commentForm.comment.length === 0 || !comment || !id) return;
        router.back();
        dispatch(actions.updateComment({
            portfolioId: id as string,
            commentId: comment?.id,
        }));
    }, [dispatch, id, commentForm.comment, comment]);

    return (
        <ScreenLayout style={[styles.containerStyle, { backgroundColor }]}>
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <AccentScreenHeader
                    style={styles.headerSection}
                    onBackPress={() => router.back()}
                    title={comment ? 'EDIT COMMENT' : 'ADD COMMENT'}
                    titleStyle={{
                        fontSize: fontPixel(10),
                        fontFamily: 'SemiBold',
                        letterSpacing: 1.5,
                    }}
                    accentSpacing='tight'
                    trailing={
                        <Button 
                            style={styles.btn} 
                            label={comment ? "UPDATE" : "POST"}
                            labelStyle={styles.buttonLabel}
                            disabled={commentForm.comment.length === 0 || isLoading}
                            onPress={comment ? handleUpdate : handleSubmit}
                            lightBackgroundColor={colors.light.tint}
                            darkBackgroundColor={colors.dark.tint}
                            icon={<FontAwesome name="send" size={fontPixel(16)} color={buttonIconColor} />}
                        />
                    }
                />

                <View style={[styles.previewContainer, { backgroundColor }]}>
                    <User
                        name={portfolio?.createdBy?.name as string}
                        avatar={portfolio?.createdBy?.avatar as string}
                        createdAt={portfolio?.createdAt as string}
                        imageStyle={styles.userImage}
                    />
                    <View style={styles.portfolioContainer}>
                        <View style={styles.portfolioImage}>
                            <View style={[styles.portfolioImageLine, { backgroundColor: accentColor }]} />
                        </View>
                        <View style={styles.portfolioDesc}>
                            <ThemedText style={{ color: textColor }}>
                                {portfolio?.description}
                            </ThemedText>
                        </View>
                        <View style={styles.portfolioThumbnails}>
                            {
                                portfolio && portfolio?.assets?.length > 0 &&
                                <Thumbnails 
                                    portfolio={portfolio}
                                    containerStyle={styles.portfolioThumbnailsImgs}
                                />
                            }
                        </View>
                    </View>
                </View>

                <View style={styles.commentContainer}>
                    <ThemedText style={[styles.commentText, { color: textColor }]}>
                        {comment ? 'Editing comment' : 'Commenting'} on <Text style={[styles.commentTextName, { color: tintColor }]}>{portfolio?.createdBy?.name?.split(' ')[0]}&apos;s</Text> portfolio
                    </ThemedText>
                </View>

                <SmartTextArea
                    placeholder="Write your comment here..."
                    value={commentForm.comment}
                    onChangeText={(text) => dispatch(actions.setCommentFormValue(text))}
                    autoFocus
                    editable={!isLoading}
                    density="searchSimple"
                    minHeight={heightPixel(120)}
                    maxHeight={heightPixel(220)}
                    borderColor={borderColor}
                    tintColor={tintColor}
                    textColor={textColor}
                    placeholderTextColor={`${labelColor}80`}
                    selectionColor={tintColor}
                    containerStyle={styles.smartTextArea}
                />
            </ScrollView>
        </ScreenLayout>
    )
};

export default Comment;

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP,
  },
  headerSection: {
    paddingHorizontal: widthPixel(16),
    marginBottom: heightPixel(8),
  },
  btn: {
    minWidth: widthPixel(100),
    paddingHorizontal: widthPixel(16),
    height: heightPixel(48),
    borderRadius: 0,
    marginHorizontal: 0,
  },
  buttonLabel: {
    fontSize: fontPixel(12),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
  },
  previewContainer: {
    paddingHorizontal: widthPixel(16),
    paddingVertical: heightPixel(16),
    marginBottom: heightPixel(20),
  },
  userImage: {
    width: widthPixel(48),
    height: widthPixel(48),
    borderRadius: 0,
  },
  portfolioImage: {
    width: widthPixel(48),
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: heightPixel(10),
  },
  portfolioImageLine: {
    width: widthPixel(2),
    flex: 1,
    borderRadius: 0,
  },
  portfolioContainer: {
    flexDirection: 'row',
    gap: widthPixel(12),
    marginTop: heightPixel(12),
  },
  portfolioDesc: {
    flex: 1,
  },
  portfolioThumbnails: {
    maxWidth: "30%",
  },
  portfolioThumbnailsImgs: {
    height: heightPixel(70),
  },
  commentContainer: {
    paddingHorizontal: widthPixel(16),
    marginBottom: heightPixel(12),
  },
  commentText: {
    fontSize: fontPixel(14),
    fontFamily: 'Bold',
    letterSpacing: -0.3,
  },
  commentTextName: {
    fontSize: fontPixel(14),
    fontFamily: 'Bold',
  },
  smartTextArea: {
    marginHorizontal: widthPixel(16),
  },
})