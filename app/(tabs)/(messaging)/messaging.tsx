import { FlashList } from '@shopify/flash-list';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import EmptyList from '@/components/ui/EmptyList';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectIsLoading, selectConversations, selectIsRefreshing } from '@/redux/messaging/selector';
import { actions } from '@/redux/messaging/slice';
import { Conversation } from '@/redux/messaging/types';
import ConversationItem from '@/components/messaging/ConversationItem';
import ConversationItemSkeleton from '@/components/messaging/ConversationItemSkeleton';
import { useFocusEffect } from 'expo-router';

export default function MessagingScreen() {
  const dispatch = useDispatch();
  const conversations = useSelector(selectConversations);
  const isLoading = useSelector(selectIsLoading);
  const isRefreshing = useSelector(selectIsRefreshing);
  const theme = useAppTheme();
  const isDark = theme === 'dark';

  useFocusEffect(() => {
    dispatch(actions.fetchConversations());
  });

  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');
  const accentColor = isDark ? colors.dark.white : colors.light.black;
  const labelColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary
  }, 'text');

  const renderEmptyList = () => {
    return (
      <EmptyList
        containerStyle={styles.emptyList}
        message="No messages yet. Start a conversation to get started."
      />
    );
  };

  // Generate skeleton data array when loading on initial load
  const skeletonData = useMemo(() => {
    if (isLoading) {
      return Array(3).fill(null).map((_, i) => ({ id: `skeleton-${i}`, isSkeleton: true }));
    }
    return [];
  }, [isLoading]);

  // Determine which data to show
  const listData = isLoading ? skeletonData : conversations;

  const renderItem = ({ item }: { item: Conversation | { id: string; isSkeleton: boolean } }) => {
    if ('isSkeleton' in item && item.isSkeleton) {
      return <ConversationItemSkeleton />;
    }
    return <ConversationItem item={item as Conversation} />;
  };

  // Render skeleton as header when refreshing (only if there are conversations)
  const renderListHeader = () => {
    if (isRefreshing && conversations.length > 0) {
      return <ConversationItemSkeleton />;
    }
    return null;
  };

  return (
    <ThemedSafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerSection}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <ThemedText style={[styles.label, { color: labelColor }]}>MESSAGES</ThemedText>
      </View>
      <FlashList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item) => {
          if ('isSkeleton' in item && item.isSkeleton) {
            return item.id;
          }
          return (item as Conversation).id;
        }}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={isLoading || isRefreshing ? null : renderEmptyList}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onRefresh={() => dispatch(actions.refreshConversations())}
      />
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingBottom: heightPixel(20),
    paddingHorizontal: widthPixel(16),
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
  listContainer: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: heightPixel(100),
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: heightPixel(200),
  }
});
