import React, { useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle, Animated, Easing, TextStyle, Modal, TouchableWithoutFeedback, Platform } from 'react-native';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors } from '@/constants/theme/colors';
import { fontPixel, widthPixel } from '@/constants/normalize';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, isToday, isTomorrow } from 'date-fns';
import { BlurView } from 'expo-blur';

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

    // Animated borderWidth
    const borderWidthAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.timing(borderWidthAnim, {
            toValue: showDatePicker ? 2 : 0.3,
            duration: 300,
            useNativeDriver: false,
            easing: Easing.inOut(Easing.ease)
        }).start();
    }, [showDatePicker]);

    const onFocus = () => {
        setShowDatePicker(true);
    };

    const onBlur = () => {
        setShowDatePicker(false);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        onBlur();
        if (selectedDate) {
            onDateChange(selectedDate);
        }
    };

    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

    const modalBackgroundColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.background,
    }, 'background');

    const formatDate = (date: Date) => {
        if (isToday(date)) {
            return `Today at ${format(date, 'h:mm a')}`;
        } else if (isTomorrow(date)) {
            return `Tomorrow at ${format(date, 'h:mm a')}`;
        } else {
            return format(date, 'EEE, MMM d \'at\' h:mm a');
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
                    {date ? formatDate(date) : 'Select Date & Time'}
                </ThemedText>
            </AnimatedTouchable>
            {Platform.OS === 'ios' ? (
                <Modal
                    visible={showDatePicker}
                    transparent={true}
                    animationType="fade"
                >
                    <TouchableWithoutFeedback onPress={onBlur}>
                        <View style={styles.modalOverlay}>
                            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                            <TouchableWithoutFeedback>
                                <View style={[styles.modalContent, { backgroundColor: modalBackgroundColor }]}>
                                    <View style={styles.modalHeader}>
                                        <View style={styles.modalTitleContainer}>
                                            <Feather name="calendar" size={24} color={tintColor} />
                                            <ThemedText type='title' style={styles.modalTitle}>Select Date & Time</ThemedText>
                                        </View>
                                    </View>
                                    <DateTimePicker
                                        value={date || new Date()}
                                        mode="datetime"
                                        display="spinner"
                                        onChange={handleDateChange}
                                        minimumDate={new Date()}
                                        textColor={color}
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            ) : showDatePicker && (
                <DateTimePicker
                    value={date || new Date()}
                    mode="datetime"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    textColor={color}
                />
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
    label: {
        fontSize: fontPixel(14),
        fontFamily: 'SemiBold',
        marginLeft: widthPixel(16)
    },
    dateText: {
        fontSize: fontPixel(16),
        fontFamily: 'Regular'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.light.white,
        borderTopLeftRadius: widthPixel(16),
        borderTopRightRadius: widthPixel(16),
        padding: widthPixel(16),
    },
    modalHeader: {
        paddingBottom: widthPixel(16),
        borderBottomWidth: 0.3,
        borderBottomColor: colors.light.secondary,
        marginBottom: widthPixel(8)
    },
    modalTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: widthPixel(8)
    },
    modalTitle: {
        fontSize: fontPixel(18),
        textAlign: 'center'
    },
});

export default DateTimeSelector; 