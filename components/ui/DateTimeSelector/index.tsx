import React, { useRef, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle, Animated, Easing, TextStyle, Modal, TouchableWithoutFeedback, Platform, Text } from 'react-native';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppTheme } from '@/hooks/use-app-theme';
import { colors } from '@/constants/theme/colors';
import { fontPixel, widthPixel, heightPixel } from '@/constants/normalize';
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
    
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    
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

    const accentColor = useThemeColor({
        light: colors.light.black,
        dark: colors.dark.white
    }, 'background');

    const cardBg = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
    }, 'background');

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

    const handleDateChange = (event: any, selectedDate?: Date) => {
        onBlur();
        if (selectedDate) {
            onDateChange(selectedDate);
        }
    };

    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

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
                            <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                            <TouchableWithoutFeedback>
                                <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
                                    {/* Header */}
                                    <View style={styles.modalHeader}>
                                        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                                        <View style={styles.headerContent}>
                                            <View style={styles.headerLabelRow}>
                                                <Feather 
                                                    name="calendar" 
                                                    size={16} 
                                                    color={isDark ? colors.dark.secondary : colors.light.secondary} 
                                                />
                                                <Text 
                                                    style={[
                                                        styles.headerLabel, 
                                                        { 
                                                            color: isDark ? colors.dark.secondary : colors.light.secondary 
                                                        }
                                                    ]}
                                                >
                                                    SELECT DATE & TIME
                                                </Text>
                                            </View>
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
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        paddingBottom: heightPixel(40),
    },
    modalHeader: {
        paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(20),
        paddingBottom: heightPixel(16),
    },
    accentBar: {
        width: widthPixel(40),
        height: heightPixel(4),
        marginBottom: heightPixel(16),
    },
    headerContent: {
        // flex: 1,
    },
    headerLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
    },
    headerLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
    },
});

export default DateTimeSelector;
