import BookingStatus from '@/components/bookings/BookingDetails/Status';
import EmptyList from '@/components/ui/EmptyList';
import { parseCompletedActualInterval } from '@/constants/helpers';
import { TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP } from '@/constants/navigation/tabRootScrollPadding';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useBookingStatus } from '@/hooks/useBookingStatus';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Booking } from '@/redux/booking/types';
import { router } from 'expo-router';
import { format } from 'date-fns';
import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { OptionIcons, BookingStatuses, Options } from '@/redux/app/types';
import { Options as OptionsComponent } from '@/components/portfolio/Options';

/** Fixed width for start/end times — keeps cards full width on the right. */
const TIME_RAIL_WIDTH = widthPixel(58);
const ROW_GAP = heightPixel(14);
const SKELETON_ROWS = [0, 1, 2] as const;

export type ParsedBooking = {
  booking: Booking;
  startMs: number;
  endMs: number;
};

/** Same start/end semantics as useBookingStatus; fallbacks if end missing. */
export function parseBookingInterval(booking: Booking): ParsedBooking | null {
  const actualInterval = parseCompletedActualInterval(booking);
  if (actualInterval) {
    return {
      booking,
      startMs: actualInterval.startMs,
      endMs: actualInterval.endMs,
    };
  }

  try {
    const startMs = new Date(booking.date).setTime(
      new Date(booking.startTime).getTime()
    );
    if (Number.isNaN(startMs)) return null;

    let endMs: number;
    if (booking.estimatedEndTime) {
      endMs = new Date(booking.date).setTime(
        new Date(booking.estimatedEndTime).getTime()
      );
    } else if (
      booking.estimatedDuration != null &&
      booking.estimatedDuration > 0
    ) {
      endMs = startMs + booking.estimatedDuration;
    } else {
      endMs = startMs + 60 * 60 * 1000;
    }

    if (Number.isNaN(endMs) || endMs <= startMs) {
      endMs = startMs + 60 * 60 * 1000;
    }

    return { booking, startMs, endMs };
  } catch {
    return null;
  }
}

function formatDurationMs(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.round((ms % 3600000) / 60000);
  if (h <= 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

type AgendaRowProps = {
  parsed: ParsedBooking;
  borderColor: string;
  textColor: string;
  labelColor: string;
  cardBg: string;
  onChatWorker: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onRebook: (booking: Booking) => void;
  onReport: (booking: Booking) => void;
  onRateWorker: (booking: Booking) => void;
};

function AgendaBookingRow({
  parsed,
  borderColor,
  textColor,
  labelColor,
  cardBg,
  onChatWorker,
  onReschedule,
  onCancel,
  onRebook,
  onReport,
  onRateWorker,
}: Readonly<AgendaRowProps>) {
  const { booking, startMs, endMs } = parsed;
  const { statusColor, isPassed } = useBookingStatus(booking);
  const durationMs = endMs - startMs;
  const durationLabel = formatDurationMs(durationMs);
  
  const getBookingOptions = (): Options[] => {
    const isPending = booking.status === BookingStatuses.PENDING;
    const isCancelled = booking.status === BookingStatuses.CANCELLED;
    const isOngoing = booking.status === BookingStatuses.ONGOING;
    const isCompleted = booking.status === BookingStatuses.COMPLETED;
    const isDeclined = booking.status === BookingStatuses.DECLINED;
    const isAccepted = booking.status === BookingStatuses.ACCEPTED;
    if (isPending) {
      if(isPassed) {
        return [
          { label: 'Reschedule', icon: OptionIcons.CALENDAR, onPress: () => onReschedule(booking) },
        ];
      }
      return [
        { label: 'Reschedule', icon: OptionIcons.CALENDAR, onPress: () => onReschedule(booking) },
        { label: 'Cancel Booking', icon: OptionIcons.CLOSE, onPress: () => onCancel(booking), isDanger: true },
      ];
    }

    if (isAccepted) {
      if(isPassed) {
        return [
          { label: 'Reschedule', icon: OptionIcons.CALENDAR, onPress: () => onReschedule(booking) },
          { label: 'Report Booking', icon: OptionIcons.FLAG, onPress: () => onReport(booking), isDanger: true },
        ];
      }
      return [
        { label: 'Reschedule', icon: OptionIcons.CALENDAR, onPress: () => onReschedule(booking) },
        { label: 'Chat Worker', icon: OptionIcons.CHAT, onPress: () => onChatWorker(booking) },
        { label: 'Cancel Booking', icon: OptionIcons.CLOSE, onPress: () => onCancel(booking), isDanger: true },
      ];
    }

    if (isDeclined) {
      return [];
    }

    if (isCancelled) {
      return [
        { label: 'Report Booking', icon: OptionIcons.FLAG, onPress: () => onReport(booking), isDanger: true },
      ];
    }

    if (isOngoing) {
      return [
        { label: 'Chat Worker', icon: OptionIcons.CHAT, onPress: () => onChatWorker(booking) },
        { label: 'Cancel Booking', icon: OptionIcons.CLOSE, onPress: () => onCancel(booking), isDanger: true },
      ];
    }

    if (isCompleted) {
      return [
        { label: 'Book Again', icon: OptionIcons.CALENDAR, onPress: () => onRebook(booking) },
        ...(booking.rating
          ? []
          : [{ label: 'Rate Worker', icon: OptionIcons.RATE, onPress: () => onRateWorker(booking) }]),
        { label: 'Report Booking', icon: OptionIcons.FLAG, onPress: () => onReport(booking), isDanger: true },
      ];
    }
    
    return [];
  };

  const renderSnapPoints = () => {
    const options = getBookingOptions();
    return options.length > 2 ? ['42%'] : options.length > 1 ? ['35%'] : ['30%'];
  }

  return (
    <View style={styles.agendaRow}>
      <View style={[styles.timeRail, { width: TIME_RAIL_WIDTH }]}>
        <Text style={[styles.timeStart, { color: textColor }]}>
          {format(new Date(startMs), 'h:mm a')}
        </Text>
        <Text style={[styles.timeEnd, { color: labelColor }]}>
          {format(new Date(endMs), 'h:mm a')}
        </Text>
        <Text style={[styles.timeMeta, { color: labelColor }]}>
          {durationLabel}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => router.push(`/(tabs)/(bookings)/${booking.id}`, { withAnchor: true })}
        activeOpacity={0.7}
        style={[
          styles.card,
          {
            backgroundColor: cardBg,
            borderColor,
          },
        ]}
      >
        <View style={[styles.cardAccent, { backgroundColor: statusColor }]} />
        <View style={styles.cardBody}>
          <View style={styles.cardHeaderRow}>
            <BookingStatus booking={booking} />

            {getBookingOptions().length > 0 && (
              <View>
                <OptionsComponent
                  options={getBookingOptions()}
                  title="Booking Actions"
                  snapPoints={renderSnapPoints()}
                />
              </View>
            )}
          </View>
          <Text style={[styles.cardTitle, { color: textColor }]}>
            {booking.description}
          </Text>
          {booking.worker?.name ? (
            <Text style={[styles.cardWorker, { color: labelColor }]}>
              {booking.worker.name}
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>
    </View>
  );
}

function AgendaRowSkeleton({
  borderColor,
  cardBg,
  skeletonColor,
  accentColor,
}: {
  borderColor: string;
  cardBg: string;
  skeletonColor: string;
  accentColor: string;
}) {
  return (
    <View style={styles.agendaRow}>
      <View style={[styles.timeRail, { width: TIME_RAIL_WIDTH }]}>
        <View style={[styles.skelTime, { backgroundColor: skeletonColor }]} />
        <View
          style={[
            styles.skelTimeShort,
            { backgroundColor: skeletonColor, marginTop: heightPixel(6) },
          ]}
        />
      </View>
      <View style={[styles.card, { borderColor, backgroundColor: cardBg }]}>
        <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
        <View style={styles.cardBody}>
          <View style={[styles.skelLine, { backgroundColor: skeletonColor }]} />
          <View
            style={[
              styles.skelLineShort,
              { backgroundColor: skeletonColor, marginTop: heightPixel(10) },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

type PageHeaderRow = { kind: 'pageHeader' };
type CalendarRow = { kind: 'calendar' };
type ListRow = PageHeaderRow | CalendarRow | ParsedBooking | { skeleton: number };

const PAGE_HEADER_ROW: PageHeaderRow = { kind: 'pageHeader' };
const CALENDAR_ROW: CalendarRow = { kind: 'calendar' };

export type BookingDayTimelineProps = {
  bookings: Booking[];
  selectedDate: Date;
  isLoading: boolean;
  /** Title block — first list row (scrolls away). */
  pageHeader: React.ReactNode;
  /** Week strip — second list row, sticky at top. */
  calendar: React.ReactNode;
  refreshing: boolean;
  onRefresh: () => void;
  onChatWorker: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onRebook: (booking: Booking) => void;
  onReport: (booking: Booking) => void;
  onRateWorker: (booking: Booking) => void;
};

export default function BookingDayTimeline({
  bookings,
  selectedDate: _selectedDate,
  isLoading,
  pageHeader,
  calendar,
  refreshing,
  onRefresh,
  onChatWorker,
  onReschedule,
  onCancel,
  onRebook,
  onReport,
  onRateWorker,
}: Readonly<BookingDayTimelineProps>) {
  const isDark = useAppTheme() === 'dark';
  const borderColor = isDark ? colors.dark.white : colors.light.black;
  const textColor = isDark ? colors.dark.text : colors.light.text;
  const labelColor = isDark ? colors.dark.secondary : colors.light.secondary;
  const cardBg = isDark ? 'transparent' : colors.light.background;
  const skeletonColor = useThemeColor(
    { light: colors.light.misc, dark: colors.dark.misc },
    'text'
  );
  const accentColor = isDark ? colors.dark.white : colors.light.black;

  const parsedList = useMemo(() => {
    return bookings
      .map(parseBookingInterval)
      .filter((p): p is ParsedBooking => p != null)
      .sort((a, b) => a.startMs - b.startMs);
  }, [bookings]);

  const listData: ListRow[] = useMemo(() => {
    if (isLoading) {
      return [
        PAGE_HEADER_ROW,
        CALENDAR_ROW,
        ...SKELETON_ROWS.map((i) => ({ skeleton: i })),
      ];
    }
    return [PAGE_HEADER_ROW, CALENDAR_ROW, ...parsedList];
  }, [isLoading, parsedList]);

  const keyExtractor = useCallback((item: ListRow) => {
    if ('kind' in item && item.kind === 'pageHeader') {
      return '__page_header__';
    }
    if ('kind' in item && item.kind === 'calendar') {
      return '__week_calendar__';
    }
    if ('skeleton' in item) {
      return `sk-${item.skeleton}`;
    }
    if ('booking' in item) {
      return item.booking.id;
    }
    return '__row__';
  }, []);

  const renderItem: ListRenderItem<ListRow> = useCallback(
    ({ item }) => {
      if ('kind' in item && item.kind === 'pageHeader') {
        return <View style={styles.pageHeaderSlot}>{pageHeader}</View>;
      }
      if ('kind' in item && item.kind === 'calendar') {
        return (
          <View
            collapsable={false}
            style={[styles.stickyCalendarSlot, { backgroundColor: cardBg }]}
          >
            {calendar}
          </View>
        );
      }
      if ('skeleton' in item) {
        return (
          <View style={styles.rowPad}>
            <AgendaRowSkeleton
              borderColor={borderColor}
              cardBg={cardBg}
              skeletonColor={skeletonColor}
              accentColor={accentColor}
            />
          </View>
        );
      }
      if (!('booking' in item)) {
        return null;
      }
      return (
        <View style={styles.rowPad}>
          <AgendaBookingRow
            parsed={item}
            borderColor={borderColor}
            textColor={textColor}
            labelColor={labelColor}
            cardBg={cardBg}
            onChatWorker={onChatWorker}
            onReschedule={onReschedule}
            onCancel={onCancel}
            onRebook={onRebook}
            onReport={onReport}
            onRateWorker={onRateWorker}
          />
        </View>
      );
    },
    [
      accentColor,
      borderColor,
      calendar,
      cardBg,
      labelColor,
      pageHeader,
      skeletonColor,
      textColor,
      onChatWorker,
      onReschedule,
      onCancel,
      onRebook,
      onReport,
      onRateWorker,
    ]
  );

  const renderListFooter = useCallback(() => {
    if (isLoading || refreshing || parsedList.length > 0) {
      return null;
    }
    return (
      <EmptyList
        containerStyle={styles.emptyContainer}
        message="No bookings scheduled for this day"
      />
    );
  }, [isLoading, refreshing, parsedList.length]);

  return (
    <FlatList<ListRow>
      data={listData}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={({ leadingItem }) =>
        'kind' in leadingItem && leadingItem.kind === 'pageHeader' ? null : (
          <View style={styles.rowMargin} />
        )
      }
      ListFooterComponent={renderListFooter}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      stickyHeaderIndices={[1]}
      contentContainerStyle={styles.listContent}
      style={styles.list}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    width: '100%',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP,
  },
  pageHeaderSlot: {
    width: '100%',
  },
  stickyCalendarSlot: {
    width: '100%',
  },
  rowPad: {
    paddingHorizontal: widthPixel(16),
  },
  rowMargin: {
    marginBottom: ROW_GAP,
  },
  emptyContainer: {
    flex: 1,
    paddingTop: heightPixel(48),
    minHeight: heightPixel(200),
    paddingHorizontal: widthPixel(16),
  },
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: widthPixel(8),
  },
  timeRail: {
    paddingTop: heightPixel(2),
  },
  timeStart: {
    fontSize: fontPixel(13),
    fontFamily: 'SemiBold',
    letterSpacing: -0.2,
  },
  timeEnd: {
    fontSize: fontPixel(11),
    fontFamily: 'Medium',
    marginTop: heightPixel(2),
  },
  timeMeta: {
    fontSize: fontPixel(10),
    fontFamily: 'Regular',
    marginTop: heightPixel(4),
    letterSpacing: 0.2,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 0.5,
    borderLeftWidth: 0,
    minWidth: 0,
    overflow: 'hidden',
  },
  cardAccent: {
    width: widthPixel(4),
  },
  cardBody: {
    flex: 1,
    paddingVertical: heightPixel(14),
    paddingHorizontal: widthPixel(14),
    minWidth: 0,
  },
  cardHeaderRow: {
    marginBottom: heightPixel(8),
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardTitle: {
    fontSize: fontPixel(16),
    fontFamily: 'Bold',
    letterSpacing: -0.4,
    lineHeight: fontPixel(22),
  },
  cardWorker: {
    fontSize: fontPixel(13),
    fontFamily: 'Medium',
    marginTop: heightPixel(8),
  },
  skelTime: {
    height: heightPixel(13),
    width: widthPixel(44),
    borderRadius: widthPixel(2),
  },
  skelTimeShort: {
    height: heightPixel(11),
    width: widthPixel(36),
    borderRadius: widthPixel(2),
  },
  skelLine: {
    height: heightPixel(14),
    width: '88%',
    borderRadius: widthPixel(2),
  },
  skelLineShort: {
    height: heightPixel(12),
    width: '55%',
    borderRadius: widthPixel(2),
  },
});
