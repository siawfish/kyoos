import React, { useRef, useEffect, useMemo } from 'react';
import { 
    StyleSheet, 
    TouchableOpacity, 
    View, 
    ViewStyle, 
    Animated, 
    Easing, 
    TextStyle, 
    Platform, 
    Text,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppTheme } from '@/hooks/use-app-theme';
import { colors } from '@/constants/theme/colors';
import { fontPixel, widthPixel, heightPixel } from '@/constants/normalize';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addHours, isToday, parseISO, setHours, setMinutes, setSeconds } from 'date-fns';
import IOSDatePickerModal from '@/components/ui/IOSDatePickerModal';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { actions } from '@/redux/booking/slice';
import { 
    selectServiceDate, 
    selectServiceTime, 
    selectAvailableSlots, 
    selectIsGettingAvailableSlots 
} from '@/redux/booking/selector';
import { AvailableSlot } from '@/redux/booking/types';
import { formatDate } from '@/constants/helpers';

interface AppointmentDateTimeSelectorProps {
    containerStyle?: ViewStyle;
    style?: ViewStyle;
    labelStyle?: TextStyle;
}

const AppointmentDateTimeSelector = ({
    containerStyle,
    style,
    labelStyle,
}: AppointmentDateTimeSelectorProps) => {
    const [showDatePicker, setShowDatePicker] = React.useState(false);
    const dispatch = useAppDispatch();
    
    const appointmentDate = useAppSelector(selectServiceDate);
    const appointmentTime = useAppSelector(selectServiceTime);
    const availableSlots = useAppSelector(selectAvailableSlots);
    const isGettingAvailableSlots = useAppSelector(selectIsGettingAvailableSlots);

    
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    
    const backgroundColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background,
    }, 'background');
    
    const color = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    const borderColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    // Animated borderWidth
    const borderWidthAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.timing(borderWidthAnim, {
            toValue: showDatePicker ? 2 : 0.3,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease)
        }).start();
    }, [showDatePicker, borderWidthAnim]);

    const onFocus = () => {
        setShowDatePicker(true);
    };

    const onBlur = () => {
        setShowDatePicker(false);
    };

    // Get selected date as Date object
    const selectedDate = useMemo(() => {
        if (appointmentDate?.value) {
            return parseISO(appointmentDate.value);
        }
        return new Date();
    }, [appointmentDate?.value]);

    const handleDateChange = (event: any, selectedDate?: Date) => {
        onBlur();
        if (selectedDate) {
            // if date is today, pass the date as it is. if not reset the time to 00:00:00
            if (isToday(selectedDate)) {
                // set time to an hour away from now
                selectedDate = addHours(selectedDate, 1);
            } else {
                selectedDate = setHours(selectedDate, 7);
                selectedDate = setMinutes(selectedDate, 0);
                selectedDate = setSeconds(selectedDate, 0);
            }
            const dateString = selectedDate.toISOString();
            // Set the date
            dispatch(actions.setAppointmentDate(dateString));
            // Fetch available times for this date
            dispatch(actions.getAvailableTimes(dateString));
        }
    };

    const handleTimeSlotSelect = (slot: AvailableSlot) => {
        // Use time or startTime field, prefer time
        const timeValue = slot.time || slot.dateTime;
        if (timeValue) {
            dispatch(actions.setAppointmentTime(timeValue));
        }
    };

    const formatTimeSlot = (timeString: string) => {
        // Try to parse the time string and format it
        // Handle formats like "09:00", "9:00 AM", etc.
        try {
            // If it's already in a readable format, return as is
            if (timeString.includes('AM') || timeString.includes('PM')) {
                return timeString;
            }
            // If it's in 24-hour format (HH:mm), convert to 12-hour
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        } catch {
            return timeString;
        }
    };

    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

    return (
        <View style={[styles.container, containerStyle]}>
            {/* Date Selection */}
            <AnimatedTouchable
                onPress={onFocus}
                style={[
                    styles.selector,
                    {
                        backgroundColor,
                        borderTopWidth: borderWidthAnim,
                        borderBottomWidth: borderWidthAnim,
                        borderColor: tintColor
                    },
                    style
                ]}
            >
                <Feather name="calendar" size={20} color={tintColor} />
                <ThemedText style={[styles.dateText, { color }]}>
                    {appointmentDate?.value 
                        ? formatDate(selectedDate)
                        : 'Select Date'
                    }
                </ThemedText>
            </AnimatedTouchable>

            {/* Date Picker Modal */}
            {Platform.OS === 'ios' ? (
                <IOSDatePickerModal
                    visible={showDatePicker}
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                    onClose={onBlur}
                />
            ) : showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                />
            )}

            {/* Time Slots Section */}
            {appointmentDate?.value && (
                <View style={styles.timeSlotsContainer}>
                    {isGettingAvailableSlots ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={tintColor} />
                            <ThemedText 
                                style={[styles.loadingText, { color }]}
                                lightColor={colors.light.secondary}
                                darkColor={colors.dark.secondary}
                            >
                                Loading available times...
                            </ThemedText>
                        </View>
                    ) : availableSlots.length > 0 ? (
                        <>
                            <View style={styles.timeSlotsHeader}>
                                <Text style={[styles.timeSlotsLabel, { color: color }]}>
                                    Available Times
                                </Text>
                            </View>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.timeSlotsList}
                            >
                                {availableSlots.map((slot, index) => {
                                    const timeValue = slot.time || slot.dateTime;
                                    const isSelected = appointmentTime?.value === timeValue;
                                    return (
                                        <TouchableOpacity
                                            key={`${slot.date}-${timeValue}-${index}`}
                                            onPress={() => handleTimeSlotSelect(slot)}
                                            style={[
                                                styles.timeSlotButton,
                                                {
                                                    backgroundColor: isSelected ? tintColor : backgroundColor,
                                                    borderColor: isSelected ? tintColor : borderColor,
                                                }
                                            ]}
                                        >
                                            <ThemedText 
                                                style={[
                                                    styles.timeSlotText,
                                                    { 
                                                        color: isSelected 
                                                            ? (isDark ? colors.dark.black : colors.light.white)
                                                            : color
                                                    }
                                                ]}
                                            >
                                                {formatTimeSlot(timeValue)}
                                            </ThemedText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <ThemedText 
                                style={[styles.emptyText, { color }]}
                                lightColor={colors.light.secondary}
                                darkColor={colors.dark.secondary}
                            >
                                No available times for this date
                            </ThemedText>
                        </View>
                    )}
                </View>
            )}

            {/* Error Messages */}
            {(appointmentDate?.error || appointmentTime?.error) && (
                <ThemedText 
                    style={styles.errorText}
                    lightColor={colors.light.error}
                    darkColor={colors.dark.error}
                >
                    {appointmentDate?.error || appointmentTime?.error}
                </ThemedText>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: widthPixel(8)
    },
    selector: {
        fontSize: widthPixel(18),
        padding: widthPixel(16),
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(12),
        borderColor: colors.light.tint,
        borderTopWidth: 0.3,
        borderBottomWidth: 0.3,
        borderLeftWidth: 0,
        borderRightWidth: 0
    },
    dateText: {
        fontSize: fontPixel(16),
        fontFamily: 'Regular'
    },
    timeSlotsContainer: {
        marginTop: heightPixel(12),
        paddingHorizontal: widthPixel(16),
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
        paddingVertical: heightPixel(12),
    },
    loadingText: {
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
    },
    timeSlotsHeader: {
        marginBottom: heightPixel(8),
    },
    timeSlotsLabel: {
        fontSize: fontPixel(12),
        fontFamily: 'SemiBold',
        letterSpacing: 1,
    },
    timeSlotsList: {
        gap: widthPixel(8),
        paddingVertical: heightPixel(4),
    },
    timeSlotButton: {
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(10),
        borderRadius: 0,
        borderWidth: 0.5,
        marginRight: widthPixel(8),
    },
    timeSlotText: {
        fontSize: fontPixel(14),
        fontFamily: 'Medium',
    },
    emptyContainer: {
        paddingVertical: heightPixel(12),
    },
    emptyText: {
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
    },
    errorText: {
        fontSize: fontPixel(12),
        marginTop: heightPixel(4),
        marginLeft: widthPixel(16),
        fontFamily: 'Regular'
    },
});

export default AppointmentDateTimeSelector;
