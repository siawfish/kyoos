import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import Switch from '@/components/ui/Switch';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { WorkingHours as WorkingHoursType } from '@/redux/app/types';
import { selectRegisterFormWorkingHours } from '@/redux/auth/selector';
import { actions } from '@/redux/auth/slice';
import { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, useColorScheme, View } from 'react-native';

interface WorkingHoursProps {
    mode?: 'auth' | 'account';
    selectWorkingHours?: (state: RootState) => WorkingHoursType;
    onUpdateWorkingHours?: (params: {day: string, field: 'from' | 'to', value: Date}) => void;
    onToggleDay?: (day: string) => void;
    headerConfig?: {
        stepLabel?: string;
        title: string;
        subtitle: string;
    };
    showBackButton?: boolean;
    onBack?: () => void;
    contentBottomPadding?: number;
}

const WorkingHours = ({
    mode = 'auth',
    selectWorkingHours: propSelectWorkingHours,
    onUpdateWorkingHours: propOnUpdateWorkingHours,
    onToggleDay: propOnToggleDay,
    headerConfig,
    showBackButton = false,
    onBack,
    contentBottomPadding,
}: WorkingHoursProps = {}) => {
    const reduxWorkingHours = useAppSelector(selectRegisterFormWorkingHours);
    const propWorkingHours = useAppSelector(propSelectWorkingHours || selectRegisterFormWorkingHours);
    const workingHours = propSelectWorkingHours ? propWorkingHours : reduxWorkingHours;
    const dispatch = useAppDispatch();
    const [showPicker, setShowPicker] = useState(false);
    const [selectedDay, setSelectedDay] = useState<string>('');
    const [selectedField, setSelectedField] = useState<'from' | 'to'>('from');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    
    // Define weekdays in correct order (Monday - Sunday)
    const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    const backgroundColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black,
    }, 'background');

    const handleColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.light.tint,
    }, 'background');

    const buttonColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');


    const textColor = isDark ? colors.dark.text : colors.light.text;
    const subtitleColor = isDark ? colors.dark.secondary : colors.light.secondary;
    const accentColor = isDark ? colors.dark.white : colors.light.black;

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        if (selectedDate && selectedDay) {
            if (propOnUpdateWorkingHours) {
                propOnUpdateWorkingHours({day: selectedDay, field: selectedField, value: selectedDate});
            } else {
                // Default to Redux action (backward compatibility)
                dispatch(actions.updateWorkingHours({day: selectedDay, field: selectedField, value: selectedDate}));
            }
        }
    };

    const showTimePicker = (day: string, field: 'from' | 'to') => {
        setSelectedDay(day);
        setSelectedField(field);
        setShowPicker(true);
    };

    const getTimeDate = (timeString: string) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        return date;
    };

    const toggleDay = (day: string) => {
        if (propOnToggleDay) {
            propOnToggleDay(day);
        } else {
            // Default to Redux action (backward compatibility)
            dispatch(actions.toggleDay(day));
        }
    };

    // Default header config for auth mode
    const defaultHeaderConfig = {
        stepLabel: 'STEP 5',
        title: 'Working\nHours',
        subtitle: 'Set your availability for each day of the week',
    };

    const finalHeaderConfig = headerConfig || defaultHeaderConfig;

    return (
        <>
            {showBackButton && onBack && (
                <View style={styles.header}>
                    <BackButton iconName='arrow-left' onPress={onBack} />
                </View>
            )}
            <ScrollView 
                contentContainerStyle={[
                    styles.container,
                    contentBottomPadding ? { paddingBottom: contentBottomPadding } : undefined
                ]} 
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.contentContainer}>
                    <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                    {finalHeaderConfig.stepLabel && (
                        <Text style={[styles.label, { color: subtitleColor }]}>
                            {finalHeaderConfig.stepLabel}
                        </Text>
                    )}
                    <Text style={[styles.titleText, { color: textColor }]}>
                        {finalHeaderConfig.title}
                    </Text>
                    <Text style={[styles.subtitleText, { color: subtitleColor }]}>
                        {finalHeaderConfig.subtitle}
                    </Text>
                </View>

                {WEEKDAYS.filter(day => workingHours[day]).map((day) => (
                    <View key={day} style={styles.dayContainer}>
                        <ThemedText 
                            type="default"
                            style={styles.dayLabel}
                        >
                            {day}
                        </ThemedText>
                        <View style={styles.rightContainer}>
                            <View style={[
                                styles.timeInputsContainer,
                                !workingHours[day].opened && styles.disabled
                            ]}>
                                <Button
                                    style={[styles.timeButton, { backgroundColor }]}
                                    labelStyle={[styles.timeButtonText, { color: buttonColor}]}
                                    onPress={() => showTimePicker(day, 'from')}
                                    label={workingHours[day].from}
                                    disabled={!workingHours[day].opened}
                                />
                                <ThemedText 
                                    type="default"
                                    style={[styles.toText, !workingHours[day].opened && styles.disabledText]}
                                >
                                    to
                                </ThemedText>
                                <Button
                                    style={[styles.timeButton, { backgroundColor }]}
                                    labelStyle={[styles.timeButtonText, { color: buttonColor }]}
                                    onPress={() => showTimePicker(day, 'to')}
                                    label={workingHours[day].to}
                                    disabled={!workingHours[day].opened}
                                />
                            </View>
                            <View style={styles.switchContainer}>
                                <Switch
                                    value={workingHours[day].opened}
                                    onValueChange={() => toggleDay(day)}
                                />
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {showPicker && (
                <Modal
                    visible={showPicker}
                    transparent={true}
                    animationType="fade"
                >
                    <View style={styles.modalOverlay}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
                            <View style={StyleSheet.absoluteFill} />
                        </TouchableWithoutFeedback>
                        <BottomSheet
                            enablePanDownToClose={true}
                            snapPoints={["40%"]}
                            onClose={() => setShowPicker(false)}
                            style={[{ backgroundColor }, styles.bottomSheet]}
                            handleIndicatorStyle={[{ backgroundColor: handleColor }, styles.handle]}
                            handleStyle={[{ backgroundColor }, styles.handle]}
                            backgroundStyle={{
                                backgroundColor,
                                borderTopLeftRadius: 0,
                                borderTopRightRadius: 0,
                            }}
                        >
                            <BottomSheetView style={[styles.pickerContainer, { backgroundColor }]}>
                                <ThemedText type="defaultSemiBold" style={styles.pickerTitle}>
                                    Select Time for {selectedDay} ({selectedField})
                                </ThemedText>
                                <DateTimePicker
                                    value={getTimeDate(workingHours[selectedDay][selectedField])}
                                    mode="time"
                                    is24Hour={true}
                                    display="spinner"
                                    onChange={handleTimeChange}
                                    style={styles.picker}
                                />
                            </BottomSheetView>
                        </BottomSheet>
                    </View>
                </Modal>
            )}
        </>
    )
}

export default WorkingHours;

const styles = StyleSheet.create({
    container: {
        padding: widthPixel(20)
    },
    contentContainer: {
        marginBottom: heightPixel(24),
        marginTop: heightPixel(8),
    },
    accentBar: {
        width: widthPixel(40),
        height: heightPixel(4),
        marginBottom: heightPixel(20),
    },
    label: {
        fontSize: fontPixel(11),
        fontFamily: 'SemiBold',
        letterSpacing: 2,
        marginBottom: heightPixel(8),
    },
    titleText: {
        fontSize: fontPixel(32),
        fontFamily: 'Bold',
        lineHeight: fontPixel(38),
        letterSpacing: -1,
        marginBottom: heightPixel(12),
    },
    subtitleText: {
        fontSize: fontPixel(15),
        fontFamily: 'Regular',
        lineHeight: fontPixel(22),
    },
    dayContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: heightPixel(16)
    },
    dayLabel: {
        fontSize: fontPixel(16),
        fontFamily: 'SemiBold',
        width: widthPixel(100),
        textTransform: 'capitalize'
    },
    rightContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(12)
    },
    timeInputsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8)
    },
    disabled: {
        opacity: 0.5
    },
    disabledText: {
        opacity: 0.5
    },
    timeButton: {
        flex: 1,
        height: heightPixel(48),
        borderRadius: 0,
        marginHorizontal: 0,
        shadowColor: 'transparent',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    timeButtonText: {
        fontSize: fontPixel(16),
        fontFamily: 'Regular',
        color: colors.light.text
    },
    toText: {
        fontSize: fontPixel(14),
        marginHorizontal: widthPixel(4)
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    bottomSheet: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    handle: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    pickerContainer: {
        padding: widthPixel(16),
    },
    pickerTitle: {
        fontSize: fontPixel(18),
        marginBottom: heightPixel(16),
        textAlign: 'center'
    },
    picker: {
        width: '100%',
        height: heightPixel(200)
    },
    switchContainer: {
        marginRight: -widthPixel(4)
    },
    header: {
        paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(16),
        marginBottom: heightPixel(8),
    },
});

