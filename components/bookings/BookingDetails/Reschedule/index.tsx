import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import ThemedText from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, useColorScheme, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface RescheduleProps {
    readonly onClose?: () => void;
    readonly isOpen: boolean;
}

interface CustomDayProps {
    date?: DateData;
    state?: string;
    onPress?: (date: DateData) => void;
    selectedDate?: string;
}

const CustomDay = ({ date, state, onPress, selectedDate }: CustomDayProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const borderColor = isDark ? colors.dark.white : colors.light.black;
    const textColor = isDark ? colors.dark.text : colors.light.text;
    const isSelected = date?.dateString === selectedDate;
    const isToday = state === 'today';
    
    return (
        <TouchableOpacity
            onPress={() => date && onPress?.(date)}
            style={[
                styles.dayContainer,
                isSelected && { backgroundColor: borderColor },
            ]}
            disabled={state === 'disabled'}
        >
            <Text
                style={[
                    styles.dayText,
                    { color: isSelected ? (isDark ? colors.light.black : colors.dark.white) : (isToday ? colors.light.tint : textColor) },
                    state === 'disabled' && { opacity: 0.3 },
                ]}
            >
                {date?.day}
            </Text>
        </TouchableOpacity>
    );
};

const Reschedule = ({
    onClose,
    isOpen,
}:RescheduleProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [selectedDate, setSelectedDate] = useState<string>('');

    const backgroundColor = useThemeColor(
      {
        light: colors.light.background,
        dark: colors.dark.background,
      },
      "background"
    );
    const borderColor = isDark ? colors.dark.white : colors.light.black;
    const textColor = isDark ? colors.dark.text : colors.light.text;
    const labelColor = isDark ? colors.dark.secondary : colors.light.secondary;

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
        <BottomSheet
            onClose={onClose}
            enablePanDownToClose={false}
            enableDynamicSizing={false}
            snapPoints={["65%"]}
            style={[{ backgroundColor }, styles.container]}
            keyboardBehavior="interactive"
            backgroundStyle={{
              backgroundColor,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderTopWidth: 0.5,
              borderColor,
            }}
            >
            <BottomSheetView style={[styles.contentContainer, { backgroundColor }]}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={[styles.label, { color: labelColor }]}>RESCHEDULE</Text>
                        <ThemedText 
                            style={[styles.title, { color: textColor }]} 
                            lightColor={colors.light.text} 
                            darkColor={colors.dark.text}
                        >
                            Select Date
                        </ThemedText>
                    </View>
                    <BackButton iconName="x" onPress={onClose} containerStyle={styles.closeButton} />
                </View>
                <View style={styles.calendarContainer}>
                <Calendar 
                        onDayPress={(day) => {
                            setSelectedDate(day.dateString);
                        }}
                        markedDates={{
                            [selectedDate]: {
                                selected: true,
                                selectedColor: borderColor,
                                selectedTextColor: isDark ? colors.light.black : colors.dark.white,
                            }
                        }}
                        dayComponent={(props) => <CustomDay {...props} selectedDate={selectedDate} />}
                    theme={{
                        calendarBackground: backgroundColor, 
                        dayTextColor: textColor,
                        textSectionTitleColor: labelColor,
                            selectedDayBackgroundColor: borderColor,
                            selectedDayTextColor: isDark ? colors.light.black : colors.dark.white,
                        todayTextColor: colors.light.tint,
                        dotColor: colors.light.tint,
                        monthTextColor: textColor,
                            textDisabledColor: labelColor,
                            arrowColor: borderColor,
                            textDayFontFamily: 'Regular',
                            textMonthFontFamily: 'Bold',
                            textDayHeaderFontFamily: 'SemiBold',
                            textDayFontSize: fontPixel(14),
                            textMonthFontSize: fontPixel(16),
                            textDayHeaderFontSize: fontPixel(10),
                        }}
                        style={styles.calendar}
                    />
                </View>
                <View style={styles.footerContainer}>
                    <Button
                        style={styles.button}
                        labelStyle={styles.buttonLabel}
                        label='CONFIRM DATE'
                        onPress={() => {
                            // TODO: Handle date confirmation
                            onClose?.();
                        }}
                        disabled={!selectedDate}
                    />
                </View>
            </BottomSheetView>
        </BottomSheet>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  contentContainer: {
    flex: 1,
    paddingTop: heightPixel(20),
    paddingBottom: heightPixel(20),
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: widthPixel(20),
    paddingBottom: heightPixel(16),
  },
  headerLeft: {
    flex: 1,
  },
  label: {
    fontSize: fontPixel(10),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
    marginBottom: heightPixel(8),
  },
  title: {
    fontSize: fontPixel(28),
    fontFamily: 'Bold',
    letterSpacing: -0.5,
  },
  closeButton: {
    marginLeft: widthPixel(16),
  },
  calendarContainer: {
    flex: 1,
    paddingHorizontal: widthPixel(20),
  },
  calendar: {
    borderWidth: 0,
  },
  dayContainer: {
    width: widthPixel(40),
    height: widthPixel(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
  },
  footerContainer: {
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(16),
  },
  button: {
    marginHorizontal: 0,
  },
  buttonLabel: {
    fontSize: fontPixel(12),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});

export default Reschedule;
