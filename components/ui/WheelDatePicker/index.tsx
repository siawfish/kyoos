import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppTheme } from '@/hooks/use-app-theme';
import WheelPicker, {
  type OnValueChanged,
  type RenderOverlayProps,
} from '@quidone/react-native-wheel-picker';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

const MONTH_DATA = MONTHS.map((label, i) => ({ value: i, label }));

const ITEM_HEIGHT = heightPixel(44);
const VISIBLE_COUNT = 5;

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function buildDayData(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    value: i + 1,
    label: String(i + 1).padStart(2, '0'),
  }));
}

function buildYearData(minYear: number, maxYear: number) {
  return Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
    value: minYear + i,
    label: String(minYear + i),
  }));
}

export interface WheelDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
}

function IosStyleOverlay({
  itemHeight,
  dividerColor,
}: Pick<RenderOverlayProps, 'itemHeight'> & { dividerColor: string }) {
  return (
    <View
      style={[StyleSheet.absoluteFill, styles.overlayRoot]}
      pointerEvents="none"
    >
      <View
        style={[
          styles.selectionFrame,
          { height: itemHeight, borderColor: dividerColor },
        ]}
      />
    </View>
  );
}

type MonthItem = (typeof MONTH_DATA)[number];
type DayItem = { value: number; label: string };
type YearItem = { value: number; label: string };

export default function WheelDatePicker({
  value,
  onChange,
  minimumDate,
}: Readonly<WheelDatePickerProps>) {
  const theme = useAppTheme();
  const isDark = theme === 'dark';

  const textColor = useThemeColor(
    { light: colors.light.text, dark: colors.dark.text },
    'text'
  );
  const dividerColor = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.18)';

  const fadeTop = isDark
    ? (['rgba(0,0,0,0.95)', 'rgba(0,0,0,0)'] as const)
    : (['rgba(255,255,255,0.95)', 'rgba(255,255,255,0)'] as const);
  const fadeBottom = isDark
    ? (['rgba(0,0,0,0)', 'rgba(0,0,0,0.95)'] as const)
    : (['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)'] as const);

  const month = value.getMonth();
  const day = value.getDate();
  const year = value.getFullYear();

  const minYear = minimumDate ? minimumDate.getFullYear() : new Date().getFullYear();
  const maxYear = minYear + 3;

  const yearData = useMemo(() => buildYearData(minYear, maxYear), [minYear, maxYear]);

  const daysInMonth = useMemo(() => getDaysInMonth(month, year), [month, year]);
  const dayData = useMemo(() => buildDayData(daysInMonth), [daysInMonth]);

  const clampedDay = Math.min(day, daysInMonth);

  const clampToMinimum = useCallback(
    (d: Date): Date => {
      if (minimumDate && d < minimumDate) {
        return new Date(minimumDate);
      }
      return d;
    },
    [minimumDate]
  );

  const itemTextStyle = useMemo(
    () => ({
      fontSize: fontPixel(22),
      fontFamily: 'Regular' as const,
      color: textColor,
    }),
    [textColor]
  );

  const triggerHaptic = useCallback(() => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
  }, []);

  const onMonthChanged = useCallback<OnValueChanged<MonthItem>>(
    ({ item }) => {
      triggerHaptic();
      const newDaysInMonth = getDaysInMonth(item.value, year);
      const newDay = Math.min(clampedDay, newDaysInMonth);
      const next = clampToMinimum(new Date(year, item.value, newDay));
      onChange(next);
    },
    [year, clampedDay, onChange, clampToMinimum, triggerHaptic]
  );

  const onDayChanged = useCallback<OnValueChanged<DayItem>>(
    ({ item }) => {
      triggerHaptic();
      const next = clampToMinimum(new Date(year, month, item.value));
      onChange(next);
    },
    [year, month, onChange, clampToMinimum, triggerHaptic]
  );

  const onYearChanged = useCallback<OnValueChanged<YearItem>>(
    ({ item }) => {
      triggerHaptic();
      const newDaysInMonth = getDaysInMonth(month, item.value);
      const newDay = Math.min(clampedDay, newDaysInMonth);
      const next = clampToMinimum(new Date(item.value, month, newDay));
      onChange(next);
    },
    [month, clampedDay, onChange, clampToMinimum, triggerHaptic]
  );

  const renderOverlay = useCallback(
    (props: RenderOverlayProps) => (
      <IosStyleOverlay itemHeight={props.itemHeight} dividerColor={dividerColor} />
    ),
    [dividerColor]
  );

  const renderWheel = (
    data: readonly { value: number; label: string }[],
    selectedValue: number,
    onValueChanged: OnValueChanged<{ value: number; label: string }>,
    flex?: number
  ) => (
    <View style={[styles.wheelShell, flex != null && { flex }]}>
      <WheelPicker
        data={data}
        value={selectedValue}
        onValueChanged={onValueChanged}
        itemHeight={ITEM_HEIGHT}
        visibleItemCount={VISIBLE_COUNT}
        width="100%"
        itemTextStyle={itemTextStyle}
        renderOverlay={renderOverlay}
        overlayItemStyle={styles.overlayItemHidden}
      />
      <LinearGradient
        colors={fadeTop}
        style={styles.fadeTop}
        pointerEvents="none"
      />
      <LinearGradient
        colors={fadeBottom}
        style={styles.fadeBottom}
        pointerEvents="none"
      />
    </View>
  );

  return (
    <View style={styles.row}>
      {renderWheel(MONTH_DATA, month, onMonthChanged as OnValueChanged<{ value: number; label: string }>, 1.2)}
      {renderWheel(dayData, clampedDay, onDayChanged as OnValueChanged<{ value: number; label: string }>)}
      {renderWheel(yearData, year, onYearChanged as OnValueChanged<{ value: number; label: string }>, 1.3)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: widthPixel(8),
  },
  wheelShell: {
    flex: 1,
    position: 'relative',
  },
  overlayRoot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionFrame: {
    alignSelf: 'stretch',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
  },
  overlayItemHidden: {
    opacity: 0,
    backgroundColor: 'transparent',
  },
  fadeTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: ITEM_HEIGHT * 1.25,
  },
  fadeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: ITEM_HEIGHT * 1.25,
  },
});
