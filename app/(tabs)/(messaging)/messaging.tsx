import { FlashList } from '@shopify/flash-list';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AccentScreenHeader } from '@/components/ui/AccentScreenHeader';
import EmptyList from '@/components/ui/EmptyList';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP } from '@/constants/navigation/tabRootScrollPadding';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
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
  useFocusEffect(() => {
    dispatch(actions.fetchConversations());
  });

  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background
  }, 'background');
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
    <ScreenLayout style={[styles.container, { backgroundColor }]}>
      <AccentScreenHeader
        style={{ paddingHorizontal: widthPixel(16), paddingBottom: heightPixel(20) }}
        title="MESSAGES"
        titleStyle={{
          fontSize: fontPixel(10),
          fontFamily: 'SemiBold',
          letterSpacing: 1.5,
        }}
      />
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
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: widthPixel(16),
    paddingBottom: TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: heightPixel(200),
  }
});
