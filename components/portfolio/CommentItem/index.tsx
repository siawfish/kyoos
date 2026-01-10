import user from "@/assets/images/individual.png";
import { ConfirmActionSheet } from "@/components/ui/ConfirmActionSheet";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { actions } from "@/redux/portfolio/slice";
import { Comment } from "@/redux/portfolio/types";
import { formatDistanceToNow } from "date-fns";
import React, { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Options } from "../Options";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { OptionIcons } from "@/redux/app/types";
import { selectUser } from "@/redux/app/selector";
import { router } from "expo-router";

const CommentItem = ({ item }: { item: Comment }) => {
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);  
  const loggedInUser = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const colorScheme = useAppTheme();
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
  const labelColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary
  }, 'text');

  const handleEdit = () => {
    router.push(`/(tabs)/(search)/(artisan)/(portfolio)/comment?id=${item.portfolioId}&commentId=${item.id}`);
  };

  const handleDelete = () => {
    setIsDeleteConfirmationOpen(true);
  };

  const options = [
    {
      label: 'Edit',
      icon: OptionIcons.EDIT,
      onPress: handleEdit,
    },
    {
      label: 'Delete',
      icon: OptionIcons.DELETE,
      onPress: handleDelete,
      isDanger: true,
    },
  ];

  return (
    <>
      <View style={[styles.commentContainer, { backgroundColor: cardBg, borderColor }]}>
        <View style={[styles.topAccent, { backgroundColor: borderColor }]} />
        <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.commentHeader}>
            <Image source={item.author.avatar ? { uri: item.author.avatar } : user} style={styles.commentAvatar} />
            <View>
                <ThemedText type="defaultSemiBold" style={[styles.authorName, { color: textColor }]}>
                  {item.author.name}
                </ThemedText>
              <ThemedText 
                type="subtitle" 
                  style={[styles.timestamp, { color: labelColor }]}
                darkColor={colors.dark.secondary}
                lightColor={colors.light.secondary}
              >
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </ThemedText>
            </View>
          </View>
          {
            loggedInUser?.id === item.authorId && (
              <Options
                options={options}
                snapPoints={['35%']}
              />
            )
          }
        </View>
        <ThemedText 
            style={[styles.commentText, { color: textColor }]}
          darkColor={colors.dark.text}
          lightColor={colors.light.text}
        >
          {item.comment}
        </ThemedText>
        </View>
      </View>
      <ConfirmActionSheet
        isOpen={isDeleteConfirmationOpen}
        isOpenChange={setIsDeleteConfirmationOpen}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={() => dispatch(actions.deleteComment({
          commentId: item.id,
          portfolioId: item.portfolioId,
        }))}
        icon={<Image source={require('@/assets/images/danger.png')} style={styles.icon} />}
        onCancel={() => setIsDeleteConfirmationOpen(false)}
        confirmButtonStyle={{
            backgroundColor: colors.light.danger,
        }}
        confirmText='Yes, Delete'
      />
    </>
  );
}

export default CommentItem;

const styles = StyleSheet.create({
    commentContainer: {
        marginBottom: heightPixel(12),
        borderWidth: 0.5,
        borderTopWidth: 0,
        overflow: 'hidden',
    },
    topAccent: {
        height: heightPixel(3),
        width: '100%',
    },
    content: {
        padding: widthPixel(16),
        gap: heightPixel(12),
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      },
      commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(12),
        flex: 1,
      },
      commentAvatar: {
        width: widthPixel(36),
        height: widthPixel(36),
        borderRadius: 0,
    },
    authorName: {
        fontSize: fontPixel(15),
        fontFamily: 'Bold',
        letterSpacing: -0.3,
      },
      timestamp: {
        fontSize: fontPixel(12),
        fontFamily: 'Regular',
        marginTop: heightPixel(2),
      },
      commentText: {
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
        lineHeight: fontPixel(20),
      },
      icon: {
        width: widthPixel(60),
        height: widthPixel(60),
      }
});

