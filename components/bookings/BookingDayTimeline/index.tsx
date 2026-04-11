import BookingStatus from '@/components/bookings/BookingDetails/Status';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useBookingStatus } from '@/hooks/useBookingStatus';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Booking } from '@/redux/booking/types';
import { router } from 'expo-router';
import { format } from 'date-fns';
import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/** Fixed width for start/end times — keeps cards full width on the right. */
const TIME_RAIL_WIDTH = widthPixel(58);
const ROW_GAP = heightPixel(14);

export type ParsedBooking = {
  booking: Booking;
  startMs: number;
  endMs: number;
};

/** Same start/end semantics as useBookingStatus; fallbacks if end missing. */
export function parseBookingInterval(booking: Booking): ParsedBooking | null {
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
};

function AgendaBookingRow({
  parsed,
  borderColor,
  textColor,
  labelColor,
  cardBg,
}: AgendaRowProps) {
  const { booking, startMs, endMs } = parsed;
  const { statusColor } = useBookingStatus(booking);
  const durationMs = endMs - startMs;
  const durationLabel = formatDurationMs(durationMs);

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
        onPress={() => router.push(`/(tabs)/(bookings)/${booking.id}`)}
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

export type BookingDayTimelineProps = {
  bookings: Booking[];
  selectedDate: Date;
  isLoading: boolean;
};

export default function BookingDayTimeline({
  bookings,
  selectedDate: _selectedDate,
  isLoading,
}: BookingDayTimelineProps) {
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

  if (isLoading) {
    return (
      <View style={styles.list}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={i < 2 ? styles.rowMargin : null}>
            <AgendaRowSkeleton
              borderColor={borderColor}
              cardBg={cardBg}
              skeletonColor={skeletonColor}
              accentColor={accentColor}
            />
          </View>
        ))}
      </View>
    );
  }

  if (parsedList.length === 0) {
    return null;
  }

  return (
    <View style={styles.list}>
      {parsedList.map((p, index) => (
        <View
          key={p.booking.id}
          style={index < parsedList.length - 1 ? styles.rowMargin : null}
        >
          <AgendaBookingRow
            parsed={p}
            borderColor={borderColor}
            textColor={textColor}
            labelColor={labelColor}
            cardBg={cardBg}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    width: '100%',
  },
  rowMargin: {
    marginBottom: ROW_GAP,
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
