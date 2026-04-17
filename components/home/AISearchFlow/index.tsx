import { AccentScreenHeader } from '@/components/ui/AccentScreenHeader';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import SmartTextArea from '@/components/ui/SmartTextArea';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
    selectAgentCurrentQuestion,
    selectAgentIsLoading,
    selectAgentConversationId,
    selectAgentConversationStatus,
    selectAgentError,
    selectSearch,
} from '@/redux/search/selector';
import {
    QuestionType,
    QuestionOption,
    ConversationStatus,
} from '@/redux/search/agent-types';
import { Worker } from '@/redux/search/types';
import { actions } from '@/redux/search/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Searching from '@/components/search/Searching';
import { ConfirmActionSheet } from '@/components/ui/ConfirmActionSheet';
import AdditionalInfoSheet from './AdditionalInfoSheet';
import { TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP } from '@/constants/navigation/tabRootScrollPadding';

export interface AISearchFlowProps {
    onRequestClose: () => void;
    mode?: 'search' | 'booking';
    artisan?: Worker | null;
}

const suggestions = [
    { icon: 'droplet', text: "Fix a leaking pipe" },
    { icon: 'wind', text: "Install ceiling fans" },
    { icon: 'box', text: "Build custom shelves" },
    { icon: 'thermometer', text: "AC not cooling" },
    { icon: 'home', text: "Kitchen renovation" },
    { icon: 'sun', text: "Garden landscaping" },
];

type ViewState = 'search' | 'question' | 'loading' | 'error';

const AISearchFlow = ({ onRequestClose, mode = 'search', artisan }: AISearchFlowProps) => {
    const [localSearch, setLocalSearch] = useState('');
    const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
    const [questionTextInput, setQuestionTextInput] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [showAdditionalInfoSheet, setShowAdditionalInfoSheet] = useState(false);
    
    const search = useAppSelector(selectSearch);
    const agentIsLoading = useAppSelector(selectAgentIsLoading);
    const currentQuestion = useAppSelector(selectAgentCurrentQuestion);
    const conversationId = useAppSelector(selectAgentConversationId);
    const conversationStatus = useAppSelector(selectAgentConversationStatus);
    const agentError = useAppSelector(selectAgentError);
    
    const dispatch = useAppDispatch();
    const insets = useSafeAreaInsets();
    const inputRef = useRef<TextInput>(null);
    const marqueeAnim = useRef(new Animated.Value(0)).current;
    const [marqueeTrackWidth, setMarqueeTrackWidth] = useState(0);
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const accentColor = isDark ? colors.dark.white : colors.light.black;

    // Derive current view from Redux state
    const currentView: ViewState = useMemo(() => {
        if (agentError) return 'error';
        if (agentIsLoading) return 'loading';
        if (currentQuestion && conversationStatus === ConversationStatus.IN_PROGRESS) return 'question';
        return 'search';
    }, [agentError, agentIsLoading, currentQuestion, conversationStatus]);

    // Mode-based content
    const headerLabel = mode === 'booking' ? 'BOOKING REQUEST' : 'SMART SEARCH';
    const headerTitle = useMemo(() => {
        if (currentView === 'question' && currentQuestion) {
            return currentQuestion.text;
        }
        return mode === 'booking' ? 'Describe Your Issue' : 'What do you need?';
    }, [mode, currentView, currentQuestion]);

    const isSimpleSearchHome = mode === 'search' && currentView === 'search';
    
    const buttonLabel = useMemo(() => {
        if (currentView === 'question') return 'CONTINUE';
        if (agentIsLoading) return mode === 'booking' ? 'Processing...' : 'Finding matches...';
        return mode === 'booking' ? 'Continue to Booking' : 'Find Service Provider';
    }, [mode, agentIsLoading, currentView]);

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

    const iconColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black,
    }, 'text');

    useEffect(() => {
        if (mode !== 'search' || marqueeTrackWidth <= 0) return;
        marqueeAnim.setValue(0);
        const duration = Math.min(45000, Math.max(12000, marqueeTrackWidth * 35));
        const loop = Animated.loop(
            Animated.timing(marqueeAnim, {
                toValue: -marqueeTrackWidth,
                duration,
                easing: Easing.linear,
                // Native-driver transforms break hit-testing for children; chips must stay tappable.
                useNativeDriver: false,
            })
        );
        loop.start();
        return () => loop.stop();
    }, [marqueeAnim, marqueeTrackWidth, mode]);

    // Reset question state when question changes
    useEffect(() => {
        setSelectedOptions([]);
        setQuestionTextInput('');
        setShowAdditionalInfoSheet(false);
    }, [currentQuestion?.id]);

    const closeAdditionalInfoSheet = useCallback(() => {
        setShowAdditionalInfoSheet(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLocalSearch(search);
            setSelectedSuggestion(null);
            const t = setTimeout(() => {
                if (!conversationId) {
                    inputRef.current?.focus();
                }
            }, 300);
            return () => clearTimeout(t);
        }, [search, conversationId])
    );

    // Handle search submission
    const handleSearch = useCallback(() => {
        if (localSearch.trim() && !agentIsLoading) {
            // Sync local state to Redux
            dispatch(actions.setSearch(localSearch));
            
            // Reset any previous agent conversation
            dispatch(actions.resetAgentConversation());
            
            // In booking mode, set the selected artisan
            if (mode === 'booking' && artisan?.id) {
                dispatch(actions.setSelectedArtisan(artisan.id));
            }
            
            // Start the agent conversation - modal stays open to show loading/questions
            dispatch(actions.startAgentConversation(localSearch.trim()));
        }
    }, [localSearch, agentIsLoading, dispatch, mode, artisan]);

    // Handle question option selection
    const handleOptionSelect = useCallback((optionId: string) => {
        if (currentQuestion?.type === QuestionType.MULTI_SELECT) {
            setSelectedOptions(prev => 
                prev.includes(optionId) 
                    ? prev.filter(id => id !== optionId)
                    : [...prev, optionId]
            );
        } else {
            setSelectedOptions([optionId]);
        }
    }, [currentQuestion?.type]);

    // Handle question submission
    const handleQuestionSubmit = useCallback(() => {
        if (!conversationId || agentIsLoading) return;

        const isTextInput = currentQuestion?.type === QuestionType.TEXT_INPUT || 
                           currentQuestion?.type === QuestionType.NUMBER_INPUT;
        const isMultiSelect = currentQuestion?.type === QuestionType.MULTI_SELECT;
        const isHybridQuestion = (currentQuestion?.type === QuestionType.SINGLE_SELECT || 
                                 currentQuestion?.type === QuestionType.MULTI_SELECT) && 
                                currentQuestion?.allowAdditionalText;

        const hasText = questionTextInput.trim().length > 0;
        const hasSelectedOptions = selectedOptions.length > 0;

        // For text-only inputs
        if (isTextInput && hasText) {
            dispatch(actions.continueAgentConversation({
                conversationId,
                message: questionTextInput.trim(),
            }));
        } 
        // For hybrid questions - send both options and text if available
        else if (isHybridQuestion) {
            if (isMultiSelect && hasSelectedOptions) {
                dispatch(actions.continueAgentConversation({
                    conversationId,
                    selectedOptionIds: selectedOptions,
                    message: hasText ? questionTextInput.trim() : undefined,
                }));
            } else if (hasSelectedOptions) {
                dispatch(actions.continueAgentConversation({
                    conversationId,
                    selectedOptionId: selectedOptions[0],
                    message: hasText ? questionTextInput.trim() : undefined,
                }));
            } else if (hasText) {
                // User only provided text without selecting an option
                dispatch(actions.continueAgentConversation({
                    conversationId,
                    message: questionTextInput.trim(),
                }));
            }
        }
        // For regular multi-select
        else if (isMultiSelect && hasSelectedOptions) {
            dispatch(actions.continueAgentConversation({
                conversationId,
                selectedOptionIds: selectedOptions,
            }));
        } 
        // For regular single-select
        else if (hasSelectedOptions) {
            dispatch(actions.continueAgentConversation({
                conversationId,
                selectedOptionId: selectedOptions[0],
            }));
        }
    }, [conversationId, agentIsLoading, currentQuestion, questionTextInput, selectedOptions, dispatch]);

    // Check if question can be submitted
    const canSubmitQuestion = useCallback(() => {
        if (agentIsLoading) return false;
        
        const isTextInput = currentQuestion?.type === QuestionType.TEXT_INPUT || 
                           currentQuestion?.type === QuestionType.NUMBER_INPUT;
        const isMultiSelect = currentQuestion?.type === QuestionType.MULTI_SELECT;
        const isHybridQuestion = (currentQuestion?.type === QuestionType.SINGLE_SELECT || 
                                 currentQuestion?.type === QuestionType.MULTI_SELECT) && 
                                currentQuestion?.allowAdditionalText;

        const hasText = questionTextInput.trim().length > 0;
        const hasSelectedOptions = selectedOptions.length > 0;

        // For text-only inputs, require text
        if (isTextInput) {
            return hasText;
        }
        
        // For hybrid questions, allow either options OR text (or both)
        if (isHybridQuestion) {
            return hasSelectedOptions || hasText;
        }
        
        // For regular multi-select, require at least one option
        if (isMultiSelect) {
            return hasSelectedOptions;
        }
        
        // For regular single-select, require exactly one option
        return selectedOptions.length === 1;
    }, [agentIsLoading, currentQuestion, questionTextInput, selectedOptions]);

    // Handle error retry
    const handleRetry = useCallback(() => {
        dispatch(actions.resetAgentConversation());
    }, [dispatch]);

    const handleSuggestionPress = (suggestion: string, index: number) => {
        setLocalSearch(suggestion);
        setSelectedSuggestion(index);
    };

    // Handle actual close after confirmation
    const handleConfirmClose = useCallback(() => {
        Keyboard.dismiss();
        dispatch(actions.resetAgentConversation());
        setShowConfirmClose(false);
        onRequestClose();
    }, [dispatch, onRequestClose]);

    const handleClose = useCallback(() => {
        if (agentIsLoading) return;
        if (currentView === 'question') {
            setShowConfirmClose(true);
            return;
        }
        Keyboard.dismiss();
        dispatch(actions.resetAgentConversation());
        onRequestClose();
    }, [agentIsLoading, currentView, dispatch, onRequestClose]);

    const handleClearInput = () => {
        setLocalSearch('');
        setSelectedSuggestion(null);
        inputRef.current?.focus();
    };

    // Render question options
    const renderOptions = () => {
        if (!currentQuestion?.options) return null;

        return (
            <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option: QuestionOption) => {
                    const isSelected = selectedOptions.includes(option.id);
                    return (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.optionItem,
                                { borderColor: isSelected ? tintColor : borderColor },
                            ]}
                            onPress={() => handleOptionSelect(option.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.optionAccent, 
                                { backgroundColor: isSelected ? tintColor : 'transparent' }
                            ]} />
                            <View style={styles.optionContent}>
                                {option.icon && (
                                    <Feather 
                                        name={option.icon as any} 
                                        size={20} 
                                        color={isSelected ? tintColor : secondaryColor} 
                                    />
                                )}
                                <View style={styles.optionTextContainer}>
                                    <ThemedText style={[
                                        styles.optionTitle, 
                                        { color: isSelected ? tintColor : textColor }
                                    ]}>
                                        {option.label}
                                    </ThemedText>
                                    {option.description && (
                                        <ThemedText style={[styles.optionSubtitle, { color: secondaryColor }]}>
                                            {option.description}
                                        </ThemedText>
                                    )}
                                </View>
                            </View>
                            {currentQuestion.type === QuestionType.MULTI_SELECT ? (
                                <View style={[
                                    styles.checkbox,
                                    {
                                        borderColor: isSelected ? tintColor : borderColor,
                                        backgroundColor: isSelected ? tintColor : 'transparent',
                                    },
                                ]}>
                                    {isSelected && <Feather name="check" size={12} color={colors.light.white} />}
                                </View>
                            ) : (
                                <View style={[
                                    styles.radio,
                                    { borderColor: isSelected ? tintColor : borderColor },
                                ]}>
                                    {isSelected && (
                                        <View style={[styles.radioInner, { backgroundColor: tintColor }]} />
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    // Hybrid: entry button opens sheet. TEXT_INPUT / NUMBER_INPUT: inline field only.
    const renderQuestionTextInput = () => {
        if (!currentQuestion) return null;

        const isTextInput =
            currentQuestion.type === QuestionType.TEXT_INPUT ||
            currentQuestion.type === QuestionType.NUMBER_INPUT;

        const isHybridQuestion =
            (currentQuestion.type === QuestionType.SINGLE_SELECT ||
                currentQuestion.type === QuestionType.MULTI_SELECT) &&
            currentQuestion.allowAdditionalText;

        if (!isTextInput && !isHybridQuestion) return null;

        if (isHybridQuestion) {
            const hasAdditional = questionTextInput.trim().length > 0;
            return (
                <TouchableOpacity
                    style={[
                        styles.additionalInfoButton,
                        {
                            borderColor: hasAdditional ? tintColor : borderColor,
                            backgroundColor: hasAdditional ? miscColor : 'transparent',
                        },
                    ]}
                    onPress={() => setShowAdditionalInfoSheet(true)}
                    activeOpacity={0.7}
                >
                    <Feather name="plus" size={18} color={hasAdditional ? tintColor : secondaryColor} />
                    <ThemedText
                        style={[
                            styles.additionalInfoButtonLabel,
                            { color: hasAdditional ? tintColor : textColor },
                        ]}
                    >
                        Additional Information
                    </ThemedText>
                    {hasAdditional && (
                        <ThemedText style={[styles.additionalInfoButtonHint, { color: secondaryColor }]}>
                            Added
                        </ThemedText>
                    )}
                </TouchableOpacity>
            );
        }

        let placeholder = 'Type your answer...';
        if (currentQuestion.validation?.placeholder) {
            placeholder = currentQuestion.validation.placeholder;
        }

        return (
            <SmartTextArea
                density="compact"
                borderColor={borderColor}
                tintColor={tintColor}
                textColor={textColor}
                placeholderTextColor={secondaryColor + '80'}
                selectionColor={tintColor}
                placeholder={placeholder}
                value={questionTextInput}
                onChangeText={setQuestionTextInput}
                keyboardType={
                    currentQuestion.type === QuestionType.NUMBER_INPUT ? 'numeric' : 'default'
                }
                maxLength={255}
                footer={
                    <View style={[styles.inputFooter, { borderTopColor: borderColor }]}>
                        <View style={[styles.charCountContainer, { marginLeft: 'auto' }]}>
                            <ThemedText
                                style={[
                                    styles.charCount,
                                    {
                                        color:
                                            questionTextInput.length > 230
                                                ? colors.light.danger
                                                : secondaryColor,
                                    },
                                ]}
                            >
                                {questionTextInput.length}
                            </ThemedText>
                            <ThemedText style={[styles.charCountTotal, { color: secondaryColor }]}>
                                /255
                            </ThemedText>
                        </View>
                    </View>
                }
            />
        );
    };

    const renderFooterContent = useCallback(() => {
        if (currentView === 'loading') return null;

        if (currentView === 'error') {
            return (
                <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor }]}>
                    <Button
                        label="TRY AGAIN"
                        onPress={handleRetry}
                        style={styles.searchButton}
                    />
                </View>
            );
        }

        if (currentView === 'question') {
            return (                    
                <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor }]}>
                    <View style={styles.questionButtonContainer}>
                        <Button
                            label={buttonLabel}
                            onPress={handleQuestionSubmit}
                            disabled={!canSubmitQuestion()}
                            isLoading={agentIsLoading}
                            style={styles.questionSubmitButton}
                        />
                        {currentQuestion?.optional && (
                            <TouchableOpacity
                                style={[styles.skipButton, { borderColor }]}
                                onPress={() => {
                                    if (conversationId) {
                                        dispatch(actions.continueAgentConversation({
                                            conversationId,
                                            message: 'skip',
                                        }));
                                    }
                                }}
                            >
                                <ThemedText style={[styles.skipText, { color: textColor }]}>
                                    SKIP
                                </ThemedText>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            );
        }

        return (
            <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor }]}>
                <Button
                    label={buttonLabel}
                    onPress={handleSearch}
                    disabled={!localSearch.trim() || agentIsLoading}
                    isLoading={agentIsLoading}
                    style={styles.searchButton}
                    icon={!agentIsLoading ? (
                        <Feather
                            name={mode === 'booking' ? 'arrow-right' : 'search'}
                            size={18}
                            color={iconColor}
                        />
                    ) : undefined}
                />
                {!isSimpleSearchHome && (
                    <ThemedText style={[styles.footerHint, { color: secondaryColor }]}>
                        {mode === 'booking'
                            ? 'Provide details about the service you need'
                            : 'We’ll match you with providers that fit your request'}
                    </ThemedText>
                )}
            </View>
        );
    }, [
        currentView, localSearch, agentIsLoading, borderColor, backgroundColor, secondaryColor,
        handleSearch, handleQuestionSubmit, canSubmitQuestion, buttonLabel, mode, iconColor,
        currentQuestion?.optional, conversationId, dispatch, textColor, handleRetry, insets.bottom,
        isSimpleSearchHome,
    ]);

    const renderSuggestionChip = (suggestion: (typeof suggestions)[0], index: number, keyPrefix: string) => {
        const logicalIndex = index % suggestions.length;
        const isSelected = selectedSuggestion === logicalIndex;
        return (
            <TouchableOpacity
                key={`${keyPrefix}-${index}`}
                style={[
                    styles.suggestionMarqueeChip,
                    {
                        borderColor: isSelected ? tintColor : borderColor,
                        backgroundColor: isSelected ? miscColor : 'transparent',
                    },
                ]}
                onPress={() => handleSuggestionPress(suggestion.text, logicalIndex)}
                activeOpacity={0.7}
            >
                <Feather
                    name={suggestion.icon as React.ComponentProps<typeof Feather>['name']}
                    size={12}
                    color={isSelected ? tintColor : secondaryColor}
                />
                <ThemedText
                    style={[styles.suggestionMarqueeText, { color: isSelected ? tintColor : textColor }]}
                >
                    {suggestion.text}
                </ThemedText>
            </TouchableOpacity>
        );
    };

    // Render search view content
    const renderSearchContent = () => (
        <ScrollView
            style={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
        >
            <SmartTextArea
                ref={inputRef}
                density={mode === 'search' ? 'searchSimple' : 'search'}
                borderColor={borderColor}
                tintColor={tintColor}
                textColor={textColor}
                placeholderTextColor={secondaryColor + '80'}
                selectionColor={tintColor}
                value={localSearch}
                onChangeText={(text) => {
                    setLocalSearch(text);
                    setSelectedSuggestion(null);
                }}
                maxLength={255}
                placeholder={
                    mode === 'booking'
                        ? "e.g., I need someone to fix my kitchen sink that's been leaking for a week..."
                        : 'What work do you need? Add how much (rooms, items, size) and if it’s a quick fix or bigger job.'
                }
                header={
                    mode === 'booking' ? (
                        <View style={styles.inputHeader}>
                            <ThemedText style={[styles.inputLabel, { color: secondaryColor }]}>
                                DESCRIPTION
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
                    ) : undefined
                }
                footer={
                    <View style={[styles.inputFooter, { borderTopColor: borderColor }]}>
                        {mode === 'search' && localSearch.length > 0 ? (
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
                        ) : (
                            <View />
                        )}
                        <View style={styles.charCountContainer}>
                            <ThemedText
                                style={[
                                    styles.charCount,
                                    { color: localSearch.length > 230 ? colors.light.danger : secondaryColor },
                                ]}
                            >
                                {localSearch.length}
                            </ThemedText>
                            <ThemedText style={[styles.charCountTotal, { color: secondaryColor }]}>
                                /255
                            </ThemedText>
                        </View>
                    </View>
                }
            />

            {mode === 'search' && (
                <View style={styles.marqueeSection}>
                    <View style={styles.marqueeClip}>
                        <Animated.View
                            style={[
                                styles.marqueeRow,
                                { transform: [{ translateX: marqueeAnim }] },
                            ]}
                        >
                            <View
                                style={styles.marqueeTrack}
                                onLayout={(e) => setMarqueeTrackWidth(e.nativeEvent.layout.width)}
                            >
                                {suggestions.map((s, i) => renderSuggestionChip(s, i, 'm1'))}
                            </View>
                            <View style={styles.marqueeTrack}>
                                {suggestions.map((s, i) =>
                                    renderSuggestionChip(s, i + suggestions.length, 'm2')
                                )}
                            </View>
                        </Animated.View>
                    </View>
                </View>
            )}

            <View style={[styles.tipsContainer, { backgroundColor: miscColor }]}>
                <View style={styles.tipHeader}>
                    <Feather name="info" size={14} color={secondaryColor} />
                    <ThemedText style={[styles.tipTitle, { color: secondaryColor }]}>
                        {mode === 'booking' ? 'TIP' : 'PRO TIP'}
                    </ThemedText>
                </View>
                <ThemedText style={[styles.tipText, { color: textColor }]}>
                    {mode === 'booking'
                        ? 'Say what needs doing, how much is involved (rooms, items, or area), and whether it’s a small repair or larger work — that’s what the assistant uses to estimate time and match providers.'
                        : 'Include three things: what task (repair, install, clean, etc.), how much (quantity, rooms, or size), and complexity (quick fix vs. major work). That means fewer follow-ups and better price estimates.'}
                </ThemedText>
            </View>
        </ScrollView>
    );

    const renderQuestionContent = () => (
        <ScrollView
            style={styles.questionContent}
            contentContainerStyle={styles.questionScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
        >
            {/* Question hint */}
            {currentQuestion?.hint && (
                <ThemedText style={[styles.questionHint, { color: secondaryColor }]}>
                    {currentQuestion.hint}
                </ThemedText>
            )}

            {/* Then Options */}
            {renderOptions()}

            {renderQuestionTextInput()}
        </ScrollView>
    );

    // Render loading view content
    const renderLoadingContent = () => (
        <Searching visible={agentIsLoading} />
    );

    // Render error view content
    const renderErrorContent = () => (
        <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={40} color={colors.light.danger} />
            <ThemedText style={[styles.errorTitle, { color: textColor }]}>
                Something went wrong
            </ThemedText>
            <ThemedText style={[styles.errorText, { color: secondaryColor }]}>
                {agentError}
            </ThemedText>
        </View>
    );

    return (
        <SafeAreaView style={[styles.screenRoot, { backgroundColor }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardView}
                keyboardVerticalOffset={0}
            >
                {(currentView === 'search' || currentView === 'question' || currentView === 'loading' || currentView === 'error') && (
                    <AccentScreenHeader
                        style={styles.modalStackHeader}
                        accentColor={accentColor}
                        accentSpacing="split"
                        title={
                            <View style={styles.titleContainer}>
                                <View style={styles.titleTextContainer}>
                                    <ThemedText
                                        style={[styles.headerEyebrow, { color: secondaryColor }]}
                                        lightColor={colors.light.secondary}
                                        darkColor={colors.dark.secondary}
                                    >
                                        {currentView === 'question'
                                            ? 'QUICK QUESTION'
                                            : currentView === 'loading'
                                            ? 'LOADING...'
                                            : currentView === 'error'
                                                ? 'ERROR'
                                                : headerLabel}
                                    </ThemedText>
                                    <ThemedText
                                        style={[styles.headerTitle, { color: textColor }]}
                                        lightColor={colors.light.text}
                                        darkColor={colors.dark.text}
                                    >
                                        {headerTitle}
                                    </ThemedText>
                                </View>
                                {currentView !== 'loading' && currentView !== 'error' ? (
                                    <BackButton
                                        iconName="x"
                                        onPress={agentIsLoading ? undefined : handleClose}
                                        containerStyle={styles.closeButton}
                                    />
                                ) : undefined}
                            </View>
                        }
                    />
                )}

                <View style={styles.body}>
                    {currentView === 'search' && renderSearchContent()}
                    {currentView === 'question' && renderQuestionContent()}
                    {currentView === 'loading' && renderLoadingContent()}
                    {currentView === 'error' && renderErrorContent()}
                </View>

                {renderFooterContent()}
            </KeyboardAvoidingView>

            <AdditionalInfoSheet
                visible={showAdditionalInfoSheet}
                value={questionTextInput}
                onChangeText={setQuestionTextInput}
                onClose={closeAdditionalInfoSheet}
            />

            <ConfirmActionSheet
                isOpen={showConfirmClose}
                isOpenChange={setShowConfirmClose}
                title="Cancel Question?"
                description="Are you sure you want to cancel? Your progress will be lost and you'll need to start over."
                onConfirm={handleConfirmClose}
                confirmText="Yes, Cancel"
                cancelText="Continue"
            />
        </SafeAreaView>
    );
};

export default AISearchFlow;

const styles = StyleSheet.create({
    screenRoot: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    body: {
        flex: 1,
        minHeight: 0,
    },
    modalStackHeader: {
        paddingHorizontal: widthPixel(16),
        paddingBottom: heightPixel(24),
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: widthPixel(12),
    },
    titleTextContainer: {
        flex: 1,
        flexShrink: 1,
        minWidth: 0,
    },
    headerEyebrow: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
        marginBottom: heightPixel(8),
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
        minHeight: 0,
        paddingHorizontal: widthPixel(16),
        paddingTop: heightPixel(20),
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
    inputFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(12),
        borderTopWidth: 0.5,
    },
    inputHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(6),
    },
    inputHintText: {
        fontSize: fontPixel(11),
        fontFamily: 'Regular',
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
    marqueeSection: {
        marginBottom: heightPixel(18),
        marginHorizontal: -widthPixel(16),
    },
    marqueeClip: {
        overflow: 'hidden',
        paddingVertical: heightPixel(2),
    },
    marqueeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    marqueeTrack: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        gap: widthPixel(10),
        paddingRight: widthPixel(10),
    },
    suggestionMarqueeChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(6),
        paddingHorizontal: widthPixel(12),
        paddingVertical: heightPixel(8),
        borderWidth: 0.5,
    },
    suggestionMarqueeText: {
        fontSize: fontPixel(12),
        fontFamily: 'Medium',
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
        paddingHorizontal: widthPixel(16),
        paddingTop: heightPixel(16),
        paddingBottom: TAB_ROOT_SCROLL_CONTENT_BOTTOM_GAP,
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
    // Question view styles
    questionContent: {
        flex: 1,
        minHeight: 0,
    },
    questionScrollContent: {
        paddingHorizontal: widthPixel(16),
        paddingBottom: heightPixel(20),
    },
    searchQueryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
        paddingVertical: heightPixel(12),
        paddingHorizontal: widthPixel(16),
        borderWidth: 0.5,
        marginBottom: heightPixel(16),
    },
    searchQueryText: {
        flex: 1,
        fontSize: fontPixel(13),
        fontFamily: 'Regular',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(4),
    },
    editText: {
        fontSize: fontPixel(12),
        fontFamily: 'SemiBold',
    },
    questionHint: {
        fontSize: fontPixel(13),
        fontFamily: 'Regular',
        marginBottom: heightPixel(16),
        lineHeight: fontPixel(18),
    },
    optionsContainer: {
        gap: heightPixel(12),
        marginBottom: heightPixel(24),
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.5,
        overflow: 'hidden',
    },
    optionAccent: {
        width: widthPixel(4),
        alignSelf: 'stretch',
    },
    optionContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(12),
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(16),
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: fontPixel(16),
        fontFamily: 'Bold',
        marginBottom: heightPixel(2),
    },
    optionSubtitle: {
        fontSize: fontPixel(12),
        fontFamily: 'Regular',
    },
    checkbox: {
        width: widthPixel(20),
        height: widthPixel(20),
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: widthPixel(16),
    },
    radio: {
        width: widthPixel(20),
        height: widthPixel(20),
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: widthPixel(16),
    },
    radioInner: {
        width: widthPixel(10),
        height: widthPixel(10),
    },
    additionalTextSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: heightPixel(16),
        marginBottom: heightPixel(12),
        gap: widthPixel(12),
    },
    additionalTextLabel: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
    },
    questionButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: widthPixel(12),
    },
    questionSubmitButton: {
        flex: 1,
        marginHorizontal: 0,
    },
    skipButton: {
        paddingVertical: heightPixel(14),
        paddingHorizontal: widthPixel(16),
        borderWidth: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipText: {
        fontSize: fontPixel(12),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
    },
    additionalInfoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(10),
        paddingVertical: heightPixel(14),
        paddingHorizontal: widthPixel(16),
        borderWidth: 0.5,
        marginBottom: heightPixel(8),
    },
    additionalInfoButtonLabel: {
        flex: 1,
        fontSize: fontPixel(14),
        fontFamily: 'SemiBold',
    },
    additionalInfoButtonHint: {
        fontSize: fontPixel(11),
        fontFamily: 'Medium',
    },
    // Loading view styles
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: heightPixel(60),
    },
    loadingText: {
        fontSize: fontPixel(15),
        fontFamily: 'SemiBold',
        marginTop: heightPixel(16),
    },
    // Error view styles
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: heightPixel(40),
        paddingHorizontal: widthPixel(16),
    },
    errorTitle: {
        fontSize: fontPixel(18),
        fontFamily: 'Bold',
        marginTop: heightPixel(16),
        marginBottom: heightPixel(8),
    },
    errorText: {
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
        textAlign: 'center',
        marginBottom: heightPixel(24),
    },
});
