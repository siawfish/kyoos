import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Option } from '@/redux/app/types';
import { Feather } from '@expo/vector-icons';
import { Portal } from '@gorhom/portal';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import EmptyList from '../EmptyList';
import { ThemedText } from '../Themed/ThemedText';
import SkeletonLoader from './components/SkeletonLoader';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_TRANSLATE_Y = -SCREEN_HEIGHT * 0.5;

interface MultiBottomSheetSelectProps {
    options: Option[];
    selectedOptions: string[];
    children?: React.ReactNode;
    onOptionsChange: (options: string[]) => void;
    open?: boolean;
    handleSheetChanges?: (index: number) => void;
    title?: string;
    isLoading?: boolean;
    closeOnSelect?: boolean;
}

const MultiBottomSheetSelect = ({
    options,
    selectedOptions,
    children,
    onOptionsChange,
    open = false,
    handleSheetChanges,
    title,
    isLoading = false,
    closeOnSelect = false
}: MultiBottomSheetSelectProps) => {
    const translateY = useSharedValue(0);
    const context = useSharedValue({ y: 0 });
    const active = useSharedValue(false);

    const pillColor = useThemeColor({
        light: colors.light.black,
        dark: colors.dark.tint,
    }, 'text');

    const backgroundColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background,
    }, 'background');

    const colorScheme = useColorScheme();
    const borderColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint
    }, 'tint');

    const tintColor = colorScheme === 'dark' ? colors.dark.tint : colors.light.tint;
    const selectedBackgroundColor = tintColor + '20';

    const optionBorderColor = useThemeColor({
        light: colors.light.misc,
        dark: colors.dark.misc
    }, 'misc');

    const iconContainerBackground = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.white
    }, 'white');

    useEffect(() => {
        if (open) {
            translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
            active.value = true;
        } else {
            translateY.value = withSpring(0, { damping: 50 });
            active.value = false;
        }
    }, [open]);

    const gesture = Gesture.Pan()
        .onStart(() => {
            context.value = { y: translateY.value };
        })
        .onUpdate((event) => {
            translateY.value = event.translationY + context.value.y;
            translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
        })
        .onEnd(() => {
            if (translateY.value > -SCREEN_HEIGHT * 0.3) {
                translateY.value = withSpring(0, { damping: 50 });
                if (handleSheetChanges) {
                    runOnJS(handleSheetChanges)(-1);
                }
                active.value = false;
            } else {
                translateY.value = withSpring(MAX_TRANSLATE_Y, { damping: 50 });
            }
        });

    const rBottomSheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    const handleSelectOption = (option: Option) => {
        if (closeOnSelect) {
            translateY.value = withSpring(0, { damping: 50 });
            active.value = false;
            if (handleSheetChanges) {
                runOnJS(handleSheetChanges)(-1);
            }
        }
        if (!selectedOptions.includes(option.value)) {
            onOptionsChange([...selectedOptions, option.value]);
            return;
        }
        onOptionsChange(selectedOptions.filter(s => s !== option.value));
    };

    const renderItem = useCallback(({ item: option }: { item: Option }) => {
        const isSelected = selectedOptions.includes(option.value);
        return (
            <TouchableOpacity
                style={[
                    styles.option,
                    { borderBottomColor: optionBorderColor },
                    isSelected && { backgroundColor: selectedBackgroundColor }
                ]}
                onPress={() => handleSelectOption(option)}
            >
                <View style={styles.optionContent}>
                    {option.icon && (
                        <View style={[styles.optionIconContainer, { backgroundColor: iconContainerBackground }]}>
                            <Image source={{uri: option.icon}} style={styles.optionIcon} />
                        </View>
                    )}
                    <ThemedText style={styles.optionText}>{option.label}</ThemedText>
                </View>
                {isSelected && (
                    <Feather name="check" size={20} color={pillColor} />
                )}
            </TouchableOpacity>
        );
    }, [selectedOptions, pillColor, selectedBackgroundColor, optionBorderColor, iconContainerBackground]);

    return (
        <>
            {children}
            {open && (
                <TouchableOpacity 
                    style={StyleSheet.absoluteFill} 
                    onPress={() => {
                        translateY.value = withSpring(0, { damping: 50 });
                        active.value = false;
                        if (handleSheetChanges) {
                            handleSheetChanges(-1);
                        }
                    }}
                >
                    <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                </TouchableOpacity>
            )}
            <Portal>
                <GestureDetector gesture={gesture}>
                    <Animated.View
                        style={[
                            styles.bottomSheetContainer,
                            rBottomSheetStyle,
                            { backgroundColor }
                        ]}
                    >
                        <View style={styles.line} />
                        {title && (
                            <View style={styles.bottomSheetHeader}>
                                <ThemedText style={styles.bottomSheetTitle}>{title}</ThemedText>
                            </View>
                        )}
                        {isLoading ? (
                            <SkeletonLoader />
                        ) : options.length > 0 ? (
                            <FlatList
                                data={options}
                                renderItem={renderItem}
                                keyExtractor={(item) => item?.value}
                                contentContainerStyle={styles.bottomSheetContent}
                            />
                        ) : (
                            <EmptyList
                                message='No options found'
                                containerStyle={{
                                    height: 200,
                                    flex: 0
                                }}
                            />
                        )}
                    </Animated.View>
                </GestureDetector>
            </Portal>
        </>
    );
}

export default MultiBottomSheetSelect;

const styles = StyleSheet.create({
    bottomSheetContainer: {
        height: SCREEN_HEIGHT,
        width: '100%',
        position: 'absolute',
        top: SCREEN_HEIGHT,
        borderRadius: 0,
        zIndex: 100,
    },
    line: {
        width: 75,
        height: 4,
        backgroundColor: 'grey',
        alignSelf: 'center',
        marginVertical: 15,
        borderRadius: 0,
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: widthPixel(8),
        flex: 1
    },
    selector: {
        fontSize: widthPixel(18),
        padding: widthPixel(16),
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 0.3,
        borderBottomWidth: 0.3,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        minHeight: heightPixel(56),
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: widthPixel(12),
        paddingVertical: heightPixel(6),
        borderRadius: 0,
        borderWidth: 1,
        gap: widthPixel(8),
    },
    pillText: {
        fontSize: fontPixel(14),
        fontFamily: 'Medium',
    },
    bottomSheetHeader: {
        padding: widthPixel(16),
        paddingBottom: heightPixel(8),
    },
    bottomSheetContent: {
        paddingHorizontal: widthPixel(16),
        paddingBottom: heightPixel(40),
    },
    bottomSheetTitle: {
        fontSize: fontPixel(18),
        fontFamily: 'Bold',
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: heightPixel(16),
        paddingHorizontal: widthPixel(16),
        marginHorizontal: -widthPixel(16),
        borderBottomWidth: 0.3,
    },
    optionText: {
        fontSize: fontPixel(16),
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
    },
    optionIcon: {
        width: widthPixel(20),
        height: widthPixel(20),
        borderRadius: 0,
    },
    optionIconContainer: {
        width: widthPixel(24),
        height: widthPixel(24),
        borderRadius: 0,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

