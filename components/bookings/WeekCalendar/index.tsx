import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useAppTheme } from '@/hooks/use-app-theme'
import { addDays, format, isSameDay, startOfWeek } from 'date-fns'
import React, { useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface WeekCalendarProps {
  selectedDate: Date
  onDateSelect: (date: Date) => void
  bookingCounts?: Record<string, number>
}

const WeekCalendar = ({ selectedDate, onDateSelect, bookingCounts = {} }: WeekCalendarProps) => {
  const theme = useAppTheme()
  const isDark = theme === 'dark'

  const cardBg = isDark ? 'transparent' : colors.light.background
  const borderColor = isDark ? colors.dark.white : colors.light.black
  const textColor = isDark ? colors.dark.text : colors.light.text
  const labelColor = isDark ? colors.dark.secondary : colors.light.secondary

  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate])

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  const goToPreviousWeek = () => {
    onDateSelect(addDays(selectedDate, -7))
  }

  const goToNextWeek = () => {
    onDateSelect(addDays(selectedDate, 7))
  }

  const isToday = (date: Date) => isSameDay(date, new Date())
  const isSelected = (date: Date) => isSameDay(date, selectedDate)

  const getBookingCount = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return bookingCounts[dateKey] || 0
  }

  return (
    <View style={[styles.container, { backgroundColor: cardBg, borderColor }]}>
      <View style={[styles.topAccent, { backgroundColor: borderColor }]} />
      
      {/* Month/Year Header with Navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.monthYear, { color: textColor }]}>
          {format(selectedDate, 'MMMM yyyy').toUpperCase()}
        </Text>
        <TouchableOpacity onPress={goToNextWeek} style={styles.navButton} activeOpacity={0.7}>
          <Ionicons name="chevron-forward" size={20} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Week Days */}
      <View style={styles.weekContainer}>
        {weekDays.map((date, index) => {
          const selected = isSelected(date)
          const today = isToday(date)
          const count = getBookingCount(date)

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                selected && { backgroundColor: borderColor },
              ]}
              onPress={() => onDateSelect(date)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayName,
                  { color: selected ? (isDark ? colors.light.black : colors.dark.white) : labelColor },
                ]}
              >
                {format(date, 'EEE').toUpperCase()}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  { color: selected ? (isDark ? colors.light.black : colors.dark.white) : textColor },
                  today && !selected && { color: isDark ? colors.dark.secondary : colors.light.tint },
                ]}
              >
                {format(date, 'd')}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.indicator,
                    {
                      backgroundColor: selected
                        ? (isDark ? colors.light.black : colors.dark.white)
                        : borderColor,
                    },
                  ]}
                />
              )}
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

export default WeekCalendar

const styles = StyleSheet.create({
  container: {
    marginHorizontal: widthPixel(16),
    marginBottom: heightPixel(24),
    borderWidth: 0.5,
    borderTopWidth: 0,
    overflow: 'hidden',
  },
  topAccent: {
    height: heightPixel(3),
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: widthPixel(12),
    paddingTop: heightPixel(16),
    paddingBottom: heightPixel(12),
  },
  navButton: {
    padding: widthPixel(4),
  },
  monthYear: {
    fontSize: fontPixel(12),
    fontFamily: 'Bold',
    letterSpacing: 2,
  },
  weekContainer: {
    flexDirection: 'row',
    paddingHorizontal: widthPixel(8),
    paddingBottom: heightPixel(16),
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: heightPixel(12),
    marginHorizontal: widthPixel(2),
  },
  dayName: {
    fontSize: fontPixel(9),
    fontFamily: 'SemiBold',
    letterSpacing: 0.5,
    marginBottom: heightPixel(6),
  },
  dayNumber: {
    fontSize: fontPixel(18),
    fontFamily: 'Bold',
  },
  indicator: {
    width: widthPixel(4),
    height: widthPixel(4),
    marginTop: heightPixel(6),
  },
})

