import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import React from 'react';
import { StyleSheet } from 'react-native';
import {Agenda, DateData, AgendaEntry, AgendaSchedule} from 'react-native-calendars';
import SectionTitle from '@/components/ui/SectionTitle';
import { fontPixel, heightPixel } from '@/constants/normalize';
import { format } from 'date-fns'
import { formatRelativeDate, timeToString } from '@/constants/helpers';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import BookingCard from '@/components/bookings/BookingCard';

export default function BookingsScreen() {
  const [items, setItems] = React.useState<AgendaSchedule>({});
  const [currentDate, setCurrentDate] = React.useState<string>(new Date().toISOString().split('T')[0]);
  const loadItems = (day: DateData) => {  
    setTimeout(() => {
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);
  
        if (!items[strTime]) {
          items[strTime] = [];
          
          const numItems = Math.floor(Math.random() * 3 + 1);
          for (let j = 0; j < numItems; j++) {
            items[strTime].push({
              name: 'Plumbing appointment with John',
              height: Math.max(50, Math.floor(Math.random() * 150)),
              day: strTime
            });
          }
        }
      }
      
      const newItems: AgendaSchedule = {};
      Object.keys(items).forEach(key => {
        newItems[key] = items[key];
      });
      setItems(newItems);
    }, 1000);
  };

  
  const rowHasChanged = (r1: AgendaEntry, r2: AgendaEntry) => {
    return r1.name !== r2.name;
  };
  const backgroundColor = useThemeColor({ light: '', dark: '' }, 'background');
  const labelColor = useThemeColor({ light: colors.light.secondary, dark: colors.dark.secondary }, 'text');
  const textColor = useThemeColor({ light: colors.light.text, dark: colors.dark.text }, 'text');
  const knobColor = useThemeColor({ light: colors.light.grey, dark: colors.dark.lightTint }, 'text');
  const tintColor = useThemeColor({ light: colors.light.tint, dark: colors.dark.tint }, 'text');
  
  return (
    <ThemedSafeAreaView 
      style={styles.containerStyle}
    >
        <SectionTitle 
          title={formatRelativeDate(currentDate)} 
          subtitle={format(new Date(currentDate), 'EEEE, MMMM d, yyyy')}
          containerStyle={styles.headerContainerStyle}
          titleStyle={styles.headerTitle}
          icon={null}
        />
        {/* <Agenda
          items={items}
          loadItemsForMonth={loadItems}
          selected={currentDate} // Should be a date string of format 'yyyy-mm-dd'
          renderItem={(item:AgendaEntry, firstItemInDay:boolean)=><BookingCard reservation={item} isFirst={firstItemInDay} />}
          rowHasChanged={rowHasChanged}
          showClosingKnob={true}
          style={{
            backgroundColor,
          }}
          onDayPress={(day:DateData) => setCurrentDate(day.dateString)}
          onDayChange={(day:DateData) => setCurrentDate(day.dateString)}
          theme={{
            calendarBackground: backgroundColor, 
            dayTextColor: textColor,
            textSectionTitleColor: labelColor,
            selectedDayBackgroundColor: colors.light.tint,
            todayTextColor: colors.light.tint,
            dotColor: colors.light.tint,
            agendaKnobColor: knobColor,
            monthTextColor: textColor,
            agendaTodayColor: colors.light.tint,
            agendaDayTextColor: labelColor,
            agendaDayNumColor: labelColor,
            reservationsBackgroundColor: backgroundColor
          }}
        /> */}
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
  },
  headerContainerStyle: {
    marginBottom: heightPixel(8),
    marginHorizontal: heightPixel(16),
    paddingBottom: heightPixel(10),
    marginTop: heightPixel(20),
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: fontPixel(32),
    lineHeight: 32,
  }
});
