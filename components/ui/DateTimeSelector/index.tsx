import React, { useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle, Animated, Easing, TextStyle } from 'react-native';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { fontPixel, widthPixel } from '@/constants/normalize';
import { Feather } from '@expo/vector-icons';
import { format, isToday, isTomorrow } from 'date-fns';
import WheelDatePickerModal from '@/components/ui/WheelDatePicker/WheelDatePickerModal';

interface DateTimeSelectorProps {
    containerStyle?: ViewStyle;
    style?: ViewStyle;
    label?: string;
    labelStyle?: TextStyle;
    date?: Date;
    onDateChange: (date: Date) => void;
}

const DateTimeSelector = ({
    containerStyle,
    style,
    label,
    labelStyle,
    date,
    onDateChange,
}: DateTimeSelectorProps) => {
    const [showDatePicker, setShowDatePicker] = React.useState(false);

    const backgroundColor = useThemeColor({
        light: colors.light.misc,
        dark: colors.dark.misc,
    }, 'misc');

    const color = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

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

    const handleDateChange = (selectedDate: Date) => {
        onDateChange(selectedDate);
    };

    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

    const formatDateLabel = (d: Date) => {
        if (isToday(d)) {
            return `Today at ${format(d, 'h:mm a')}`;
        } else if (isTomorrow(d)) {
            return `Tomorrow at ${format(d, 'h:mm a')}`;
        } else {
            return format(d, 'EEE, MMM d \'at\' h:mm a');
        }
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <ThemedText
                    type='default'
                    lightColor={colors.light.secondary}
                    darkColor={colors.dark.secondary}
                    style={[styles.label, labelStyle]}
                >
                    {label}
                </ThemedText>
            )}
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
                    {date ? formatDateLabel(date) : 'Select Date & Time'}
                </ThemedText>
            </AnimatedTouchable>
            <WheelDatePickerModal
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                value={date || new Date()}
                onChange={handleDateChange}
                minimumDate={new Date()}
            />
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
    label: {
        fontSize: fontPixel(14),
        fontFamily: 'SemiBold',
        marginLeft: widthPixel(16)
    },
    dateText: {
        fontSize: fontPixel(16),
        fontFamily: 'Regular'
    },
});

export default DateTimeSelector;
