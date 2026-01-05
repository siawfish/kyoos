import LoadingPopover from '@/components/search/LoadingPopover';
import AttachMedia from '@/components/ui/AttachMedia';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Media, MediaType } from '@/redux/app/types';
import { selectIsLoading, selectMedia, selectSearch } from '@/redux/search/selector';
import { actions } from '@/redux/search/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Feather } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFooter, BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetDefaultFooterProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Image,
    Keyboard,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

interface AISearchModalProps {
    visible: boolean;
    onClose: () => void;
}

const suggestions = [
    { icon: 'droplet', text: "Fix a leaking pipe" },
    { icon: 'wind', text: "Install ceiling fans" },
    { icon: 'box', text: "Build custom shelves" },
    { icon: 'thermometer', text: "AC not cooling" },
    { icon: 'home', text: "Kitchen renovation" },
    { icon: 'sun', text: "Garden landscaping" },
];

const AISearchModal = ({ visible, onClose }: AISearchModalProps) => {
    const [localSearch, setLocalSearch] = useState('');
    const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const search = useAppSelector(selectSearch);
    const media = useAppSelector(selectMedia);
    const isLoading = useAppSelector(selectIsLoading);
    const dispatch = useAppDispatch();
    const inputRef = useRef<any>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const accentColor = isDark ? colors.dark.white : colors.light.black;
    
    const snapPoints = useMemo(() => ['90%', '100%'], []);

    const backgroundColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background,
    }, 'background');

    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');

    const secondaryColor = useThemeColor({
        light: colors.light.secondary,
        dark: colors.dark.secondary,
    }, 'secondary');

    const borderColor = useThemeColor({
        light: colors.light.grey,
        dark: colors.dark.grey,
    }, 'grey');

    const tintColor = useThemeColor({
        light: colors.light.tint,
        dark: colors.dark.tint,
    }, 'tint');

    const miscColor = useThemeColor({
        light: colors.light.misc,
        dark: colors.dark.misc,
    }, 'misc');

    // Pulse animation for AI indicator
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 0.6,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [pulseAnim]);

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (visible) {
            setLocalSearch(search);
            setSelectedSuggestion(null);
            setSelectedMedia(media && media.length > 0 ? media[0] : null);
            bottomSheetRef.current?.expand();
            setTimeout(() => {
                inputRef.current?.focus();
            }, 300);
        } else {
            bottomSheetRef.current?.close();
        }
    }, [visible, search, media]);

    const handleSearch = useCallback(() => {
        if (localSearch.trim() && !isLoading) {
            // Sync local state to Redux before triggering search
            dispatch(actions.setSearch(localSearch));
            
            // Ensure media is synced (it should already be, but ensure it's current)
            if (selectedMedia) {
                dispatch(actions.setMedia([selectedMedia]));
            } else {
                dispatch(actions.setMedia([]));
            }
            
            // Trigger the search - saga will read from Redux state
            dispatch(actions.onSearch({}));
            
            // Close modal after a brief delay to allow LoadingPopover to show
            setTimeout(() => {
                onClose();
            }, 100);
        }
    }, [localSearch, selectedMedia, isLoading, dispatch, onClose]);

    const handleSuggestionPress = (suggestion: string, index: number) => {
        setLocalSearch(suggestion);
        setSelectedSuggestion(index);
    };

    const handleMediaAttach = (media: Media[]) => {
        if (media.length > 0) {
            setSelectedMedia(media[0]);
            dispatch(actions.setMedia(media));
        }
    };

    const handleRemoveMedia = () => {
        setSelectedMedia(null);
        dispatch(actions.setMedia([]));
    };

    const handleClose = () => {
        Keyboard.dismiss();
        onClose();
    };

    const handleClearInput = () => {
        setLocalSearch('');
        setSelectedSuggestion(null);
        setSelectedMedia(null);
        dispatch(actions.setMedia([]));
        inputRef.current?.focus();
    };

    const renderFooter = useCallback(
        (props: BottomSheetDefaultFooterProps) => (
            <BottomSheetFooter {...props}>
                <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor }]}>
                    <Button
                        label={isLoading ? "Finding matches..." : "Find Service Provider"}
                        onPress={handleSearch}
                        disabled={!localSearch.trim() || isLoading}
                        isLoading={isLoading}
                        style={styles.searchButton}
                        icon={!isLoading ? <Feather name="search" size={18} color={colors.light.white} /> : undefined}
                    />
                    <ThemedText style={[styles.footerHint, { color: secondaryColor }]}>
                        AI will match you with the best professionals
                    </ThemedText>
                </View>
            </BottomSheetFooter>
        ),
        [localSearch, isLoading, borderColor, backgroundColor, secondaryColor, handleSearch]
    );

    if (!visible && !isLoading) return null;

    return (
        <>
            <Modal
                visible={visible && !isLoading}
                transparent
                animationType="fade"
                onRequestClose={handleClose}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
                    <TouchableWithoutFeedback onPress={handleClose}>
                        <View style={StyleSheet.absoluteFill} />
                    </TouchableWithoutFeedback>
                    <BottomSheet
                        ref={bottomSheetRef}
                        snapPoints={snapPoints}
                        index={0}
                        onChange={handleSheetChanges}
                        onClose={onClose}
                        enablePanDownToClose
                        enableDynamicSizing={true}
                        keyboardBehavior="extend"
                        keyboardBlurBehavior="restore"
                        android_keyboardInputMode="adjustResize"
                        handleIndicatorStyle={{ backgroundColor: borderColor, width: widthPixel(40) }}
                        backgroundStyle={{
                            backgroundColor,
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                        }}
                        footerComponent={renderFooter}
                    >
                        <BottomSheetView style={styles.bottomSheetContent}>
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerLeft}>
                                <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                                <View style={styles.headerLabelRow}>
                                    <ThemedText style={[styles.headerLabel, { color: secondaryColor }]}>
                                        SMART SEARCH
                                    </ThemedText>
                                    <View style={[styles.aiBadge, { borderColor: tintColor }]}>
                                        <Animated.View style={{ opacity: pulseAnim }}>
                                            <Feather name="zap" size={10} color={tintColor} />
                                        </Animated.View>
                                        <ThemedText style={[styles.aiBadgeText, { color: tintColor }]}>
                                            AI
                                        </ThemedText>
                                    </View>
                                </View>
                                <ThemedText 
                                    style={[styles.headerTitle, { color: textColor }]}
                                    lightColor={colors.light.text}
                                    darkColor={colors.dark.text}
                                >
                                    Find a Service Provider
                                </ThemedText>
                            </View>
                            <BackButton iconName="x" onPress={handleClose} containerStyle={styles.closeButton} />
                        </View>

                        {/* Content */}
                        <ScrollView 
                            style={styles.content}
                            keyboardShouldPersistTaps="never"
                            showsVerticalScrollIndicator={false}
                            keyboardDismissMode="on-drag"
                        >
                            {/* Search Input */}
                            <View style={[styles.inputWrapper, { borderColor }]}>
                                <View style={[styles.inputAccent, { backgroundColor: tintColor }]} />
                                <View style={styles.inputInner}>
                                    <View style={styles.inputHeader}>
                                        <ThemedText style={[styles.inputLabel, { color: secondaryColor }]}>
                                            YOUR REQUEST
                                        </ThemedText>
                                        {localSearch.length > 0 && (
                                            <TouchableOpacity 
                                                onPress={handleClearInput}
                                                style={styles.clearButton}
                                                activeOpacity={0.7}
                                            >
                                                <Feather name="x" size={14} color={secondaryColor} />
                                                <ThemedText style={[styles.clearText, { color: secondaryColor }]}>
                                                    Clear
                                                </ThemedText>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <BottomSheetTextInput
                                        ref={inputRef}
                                        style={[styles.textInput, { color: textColor }]}
                                        placeholder="e.g., I need someone to fix my kitchen sink that's been leaking for a week..."
                                        placeholderTextColor={secondaryColor + '80'}
                                        multiline
                                        value={localSearch}
                                        onChangeText={(text) => {
                                            setLocalSearch(text);
                                            setSelectedSuggestion(null);
                                        }}
                                        textAlignVertical="top"
                                        selectionColor={tintColor}
                                        maxLength={500}
                                    />
                                    {selectedMedia && (
                                        <View style={[styles.selectedMediaContainer, { borderTopColor: borderColor }]}>
                                            <View style={styles.selectedMediaWrapper}>
                                                <Image 
                                                    source={{ uri: selectedMedia.uri }} 
                                                    style={styles.selectedMediaImage}
                                                />
                                                <TouchableOpacity 
                                                    style={[styles.removeMediaButton, { backgroundColor: colors.light.danger }]}
                                                    onPress={handleRemoveMedia}
                                                    activeOpacity={0.7}
                                                >
                                                    <Feather name="x" size={12} color={colors.light.white} />
                                                </TouchableOpacity>
                                            </View>
                                            <ThemedText style={[styles.mediaTypeLabel, { color: secondaryColor }]}>
                                                {selectedMedia.type === MediaType.VIDEO ? 'VIDEO ATTACHED' : 'IMAGE ATTACHED'}
                                            </ThemedText>
                                        </View>
                                    )}
                                    <View style={[styles.inputFooter, { borderTopColor: borderColor }]}>
                                        <AttachMedia 
                                            onChange={handleMediaAttach} 
                                            onTextReceived={(text) => setLocalSearch(prev => prev ? `${prev} ${text}` : text)}
                                            maxCount={1}
                                        />
                                        <View style={styles.charCountContainer}>
                                            <ThemedText style={[
                                                styles.charCount, 
                                                { color: localSearch.length > 450 ? colors.light.danger : secondaryColor }
                                            ]}>
                                                {localSearch.length}
                                            </ThemedText>
                                            <ThemedText style={[styles.charCountTotal, { color: secondaryColor }]}>
                                                /500
                                            </ThemedText>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Suggestions Section */}
                            <View style={styles.suggestionsSection}>
                                <View style={styles.suggestionsTitleRow}>
                                    <View style={[styles.sectionDivider, { backgroundColor: borderColor }]} />
                                    <ThemedText style={[styles.suggestionsLabel, { color: secondaryColor }]}>
                                        QUICK SUGGESTIONS
                                    </ThemedText>
                                    <View style={[styles.sectionDivider, { backgroundColor: borderColor }]} />
                                </View>
                                
                                <View style={styles.suggestionsGrid}>
                                    {suggestions.map((suggestion, index) => {
                                        const isSelected = selectedSuggestion === index;
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.suggestionChip,
                                                    { 
                                                        borderColor: isSelected ? tintColor : borderColor,
                                                        backgroundColor: isSelected ? miscColor : 'transparent',
                                                    }
                                                ]}
                                                onPress={() => handleSuggestionPress(suggestion.text, index)}
                                                activeOpacity={0.7}
                                            >
                                                <Feather 
                                                    name={suggestion.icon as any} 
                                                    size={14} 
                                                    color={isSelected ? tintColor : secondaryColor} 
                                                />
                                                <ThemedText style={[
                                                    styles.suggestionText, 
                                                    { color: isSelected ? tintColor : textColor }
                                                ]}>
                                                    {suggestion.text}
                                                </ThemedText>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Tips Section */}
                            <View style={[styles.tipsContainer, { backgroundColor: miscColor }]}>
                                <View style={styles.tipHeader}>
                                    <Feather name="info" size={14} color={secondaryColor} />
                                    <ThemedText style={[styles.tipTitle, { color: secondaryColor }]}>
                                        PRO TIP
                                    </ThemedText>
                                </View>
                                <ThemedText style={[styles.tipText, { color: textColor }]}>
                                    Be specific about location, urgency, and any special requirements for better matches.
                                </ThemedText>
                            </View>
                        </ScrollView>
                        </BottomSheetView>
                    </BottomSheet>
                </View>
            </Modal>
            
            {/* Loading Popover - rendered outside modal so it stays visible when modal closes */}
            <LoadingPopover 
                visible={isLoading}
                title="SEARCHING"
                subtitle="Finding the perfect service provider for you"
            />
        </>
    );
};

export default AISearchModal;

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    bottomSheetContent: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(20),
        paddingBottom: heightPixel(24),
    },
    headerLeft: {
        flex: 1,
    },
    accentBar: {
        width: widthPixel(40),
        height: heightPixel(4),
        marginBottom: heightPixel(16),
    },
    headerLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
        marginBottom: heightPixel(8),
    },
    headerLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
    },
    aiBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(3),
        paddingHorizontal: widthPixel(6),
        paddingVertical: heightPixel(3),
        borderWidth: 1,
    },
    aiBadgeText: {
        fontSize: fontPixel(9),
        fontFamily: 'Bold',
        letterSpacing: 0.5,
    },
    headerTitle: {
        fontSize: fontPixel(24),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
        lineHeight: fontPixel(28),
    },
    closeButton: {
        marginTop: heightPixel(8),
    },
    content: {
        flex: 1,
        paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(20),
    },
    inputWrapper: {
        flexDirection: 'row',
        borderWidth: 0.5,
        borderLeftWidth: 0,
        marginBottom: heightPixel(24),
    },
    inputAccent: {
        width: widthPixel(4),
    },
    inputInner: {
        flex: 1,
    },
    inputHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: widthPixel(16),
        paddingTop: heightPixel(14),
        paddingBottom: heightPixel(8),
    },
    inputLabel: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(4),
    },
    clearText: {
        fontSize: fontPixel(11),
        fontFamily: 'Medium',
    },
    textInput: {
        minHeight: heightPixel(100),
        maxHeight: heightPixel(140),
        paddingHorizontal: widthPixel(16),
        paddingBottom: heightPixel(12),
        fontSize: fontPixel(16),
        fontFamily: 'Regular',
        lineHeight: fontPixel(24),
    },
    selectedMediaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(12),
        borderTopWidth: 0.5,
        gap: widthPixel(12),
    },
    selectedMediaWrapper: {
        position: 'relative',
    },
    selectedMediaImage: {
        width: widthPixel(56),
        height: widthPixel(56),
    },
    removeMediaButton: {
        position: 'absolute',
        top: -widthPixel(6),
        right: -widthPixel(6),
        width: widthPixel(20),
        height: widthPixel(20),
        alignItems: 'center',
        justifyContent: 'center',
    },
    mediaTypeLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1,
    },
    inputFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(12),
        borderTopWidth: 0.5,
    },
    charCountContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    charCount: {
        fontSize: fontPixel(14),
        fontFamily: 'SemiBold',
    },
    charCountTotal: {
        fontSize: fontPixel(12),
        fontFamily: 'Regular',
    },
    suggestionsSection: {
        marginBottom: heightPixel(20),
    },
    suggestionsTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: heightPixel(16),
        gap: widthPixel(12),
    },
    sectionDivider: {
        flex: 1,
        height: 0.5,
    },
    suggestionsLabel: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
    },
    suggestionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: widthPixel(10),
    },
    suggestionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
        paddingHorizontal: widthPixel(14),
        paddingVertical: heightPixel(12),
        borderWidth: 0.5,
    },
    suggestionText: {
        fontSize: fontPixel(13),
        fontFamily: 'Medium',
    },
    tipsContainer: {
        padding: widthPixel(16),
        marginBottom: heightPixel(20),
    },
    tipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
        marginBottom: heightPixel(8),
    },
    tipTitle: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
    },
    tipText: {
        fontSize: fontPixel(13),
        fontFamily: 'Regular',
        lineHeight: fontPixel(20),
    },
    footer: {
        paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(16),
        paddingBottom: heightPixel(40),
        borderTopWidth: 0.5,
    },
    searchButton: {
        marginHorizontal: 0,
        height: heightPixel(54),
    },
    footerHint: {
        fontSize: fontPixel(11),
        fontFamily: 'Regular',
        textAlign: 'center',
        marginTop: heightPixel(12),
    },
});

