import SectionTitle from '@/components/ui/SectionTitle';
import { colors } from '@/constants/theme/colors';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { useThemeColor } from '@/hooks/use-theme-color';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React from 'react';
import { StyleSheet, Modal, View, TouchableWithoutFeedback } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { BlurView } from 'expo-blur';

interface RescheduleProps {
    readonly onClose?: () => void;
    readonly isOpen: boolean;
}

const Reschedule = ({
    onClose,
    isOpen,
}:RescheduleProps) => {
    const backgroundColor = useThemeColor(
      {
        light: colors.light.background,
        dark: colors.dark.background,
      },
      "background"
    );
    const handleColor = useThemeColor(
      {
        light: colors.light.secondary,
        dark: colors.light.tint,
      },
      "background"
    );

  const agendaBackgroundColor = useThemeColor({ light: '', dark: colors.dark.background }, 'background');
  const labelColor = useThemeColor({ light: colors.light.secondary, dark: colors.dark.text }, 'text');
  const textColor = useThemeColor({ light: colors.light.text, dark: colors.dark.text }, 'text');
  const knobColor = useThemeColor({ light: colors.light.grey, dark: colors.light.lightTint }, 'tint');

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
            enablePanDownToClose={true}
            snapPoints={["60%"]}
            style={[{ backgroundColor }, styles.container]}
            handleIndicatorStyle={[{ backgroundColor: handleColor }, styles.handle]}
            handleStyle={[{ backgroundColor: backgroundColor }, styles.handle]}
            keyboardBehavior="interactive"
            backgroundStyle={{
              backgroundColor,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
            }}
            >
            <BottomSheetView style={[styles.contentContainer, { backgroundColor }]}>
                <SectionTitle titleStyle={styles.title} icon={null} title="Select Date" subtitle="" />
                <Calendar 
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
                        reservationsBackgroundColor: agendaBackgroundColor,
                        arrowColor: colors.light.tint,
                    }}
                />
            </BottomSheetView>
        </BottomSheet>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  contentContainer: {
    flex: 1,
    paddingVertical: heightPixel(20),
  },
  handle: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  title: {
    fontSize: fontPixel(24),
    paddingHorizontal: widthPixel(16),
    marginBottom: widthPixel(16),
    lineHeight: heightPixel(30),
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});

export default Reschedule;
