import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
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
import BottomSheet, { BottomSheetFooter, BottomSheetTextInput, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BottomSheetDefaultFooterProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Keyboard,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Searching from '@/components/search/Searching';
import { ConfirmActionSheet } from '@/components/ui/ConfirmActionSheet';

interface AISearchModalProps {
    visible: boolean;
    onClose: () => void;
    // New props for booking mode
    mode?: 'search' | 'booking';
    artisan?: Worker;
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

const AISearchModal = ({ visible, onClose, mode = 'search', artisan }: AISearchModalProps) => {
    const [localSearch, setLocalSearch] = useState('');
    const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null);
    const [questionTextInput, setQuestionTextInput] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    
    const search = useAppSelector(selectSearch);
    const agentIsLoading = useAppSelector(selectAgentIsLoading);
    const currentQuestion = useAppSelector(selectAgentCurrentQuestion);
    const conversationId = useAppSelector(selectAgentConversationId);
    const conversationStatus = useAppSelector(selectAgentConversationStatus);
    const agentError = useAppSelector(selectAgentError);
    
    const dispatch = useAppDispatch();
    const inputRef = useRef<any>(null);
    const questionInputRef = useRef<any>(null);
    const questionScrollRef = useRef<any>(null);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
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
        return mode === 'booking' ? 'Describe Your Issue' : 'Find a Service Provider';
    }, [mode, currentView, currentQuestion]);
    
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

    // Reset question state when question changes
    useEffect(() => {
        setSelectedOptions([]);
        setQuestionTextInput('');
    }, [currentQuestion?.id]);

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            // Prevent closing during loading
            if (agentIsLoading) {
                bottomSheetRef.current?.expand();
                return;
            }
            // Prevent closing during question view - show confirmation instead
            if (currentView === 'question') {
                bottomSheetRef.current?.expand();
                setShowConfirmClose(true);
                return;
            }
            onClose();
        }
    }, [onClose, agentIsLoading, currentView]);

    useEffect(() => {
        if (visible) {
            setLocalSearch(search);
            setSelectedSuggestion(null);
            bottomSheetRef.current?.expand();
            // Only focus input in search view
            if (currentView === 'search') {
                setTimeout(() => {
                    inputRef.current?.focus();
                }, 300);
            }
        } else {
            bottomSheetRef.current?.close();
        }
    }, [visible, search, currentView]);

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
        onClose();
    }, [dispatch, onClose]);

    const handleClose = useCallback(() => {
        if (agentIsLoading) return;
        // If in question view, show confirmation instead of closing
        if (currentView === 'question') {
            setShowConfirmClose(true);
            return;
        }
        Keyboard.dismiss();
        dispatch(actions.resetAgentConversation());
        onClose();
    }, [agentIsLoading, currentView, dispatch, onClose]);

    const handleClearInput = () => {
        setLocalSearch('');
        setSelectedSuggestion(null);
        inputRef.current?.focus();
    };

    // Render question options
    const renderOptions = () => {
        if (!currentQuestion?.options) return null;

        const hasTextInput = currentQuestion.allowAdditionalText || 
                            currentQuestion.type === QuestionType.TEXT_INPUT ||
                            currentQuestion.type === QuestionType.NUMBER_INPUT;

        return (
            <View style={styles.optionsContainer}>
                {hasTextInput && (
                    <View style={styles.additionalTextSection}>
                        <View style={[styles.sectionDivider, { backgroundColor: borderColor }]} />
                        <ThemedText style={[styles.additionalTextLabel, { color: secondaryColor }]}>
                            OR SELECT AN OPTION
                        </ThemedText>
                        <View style={[styles.sectionDivider, { backgroundColor: borderColor }]} />
                    </View>
                )}
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

    // Render question text input
    const renderQuestionTextInput = () => {
        if (!currentQuestion) return null;
        
        const isTextInput = currentQuestion.type === QuestionType.TEXT_INPUT || 
                           currentQuestion.type === QuestionType.NUMBER_INPUT;
        
        const isHybridQuestion = (currentQuestion.type === QuestionType.SINGLE_SELECT || 
                                 currentQuestion.type === QuestionType.MULTI_SELECT) && 
                                currentQuestion.allowAdditionalText;
        
        if (!isTextInput && !isHybridQuestion) return null;

        // Determine placeholder based on context
        let placeholder = "Type your answer...";
        if (isHybridQuestion) {
            placeholder = "e.g., I need help with...";
        } else if (currentQuestion.validation?.placeholder) {
            placeholder = currentQuestion.validation.placeholder;
        }

        return (
            <>
                <View 
                    style={[styles.inputWrapper, { borderColor }]}
                    ref={questionInputRef}
                >
                    <View style={[styles.inputAccent, { backgroundColor: tintColor }]} />
                    <View style={styles.inputInner}>
                        {isHybridQuestion && (
                            <View style={styles.inputHeader}>
                                <ThemedText style={[styles.inputLabel, { color: secondaryColor }]}>
                                    DESCRIBE YOUR NEED
                                </ThemedText>
                            </View>
                        )}
                        <BottomSheetTextInput
                            style={[styles.textInput, { color: textColor }]}
                            placeholder={placeholder}
                            placeholderTextColor={secondaryColor + '80'}
                            value={questionTextInput}
                            onChangeText={setQuestionTextInput}
                            keyboardType={currentQuestion.type === QuestionType.NUMBER_INPUT ? 'numeric' : 'default'}
                            multiline={isTextInput || isHybridQuestion}
                            textAlignVertical={isTextInput || isHybridQuestion ? 'top' : 'center'}
                            selectionColor={tintColor}
                            maxLength={255}
                        />
                        <View style={[styles.inputFooter, { borderTopColor: borderColor }]}>
                            <View style={[styles.charCountContainer, { marginLeft: 'auto' }]}>
                                <ThemedText style={[
                                    styles.charCount, 
                                    { color: questionTextInput.length > 230 ? colors.light.danger : secondaryColor }
                                ]}>
                                    {questionTextInput.length}
                                </ThemedText>
                                <ThemedText style={[styles.charCountTotal, { color: secondaryColor }]}>
                                    /255
                                </ThemedText>
                            </View>
                        </View>
                    </View>
                </View>
            </>
        );
    };

    // Render footer based on current view
    const renderFooter = useCallback(
        (props: BottomSheetDefaultFooterProps) => {
            if (currentView === 'loading') return null;
            
            if (currentView === 'error') {
                return (
                    <BottomSheetFooter {...props}>
                        <View style={[styles.footer, { borderTopColor: borderColor, backgroundColor }]}>
                            <Button
                                label="TRY AGAIN"
                                onPress={handleRetry}
                                style={styles.searchButton}
                            />
                        </View>
                    </BottomSheetFooter>
                );
            }

            if (currentView === 'question') {
                return (
                    <BottomSheetFooter {...props}>
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
                    </BottomSheetFooter>
                );
            }

            // Search view footer
            return (
                <BottomSheetFooter {...props}>
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
                        <ThemedText style={[styles.footerHint, { color: secondaryColor }]}>
                            {mode === 'booking' 
                                ? 'Provide details about the service you need'
                                : 'AI assistant will help you find the perfect match'
                            }
                        </ThemedText>
                    </View>
                </BottomSheetFooter>
            );
        },
        [currentView, localSearch, agentIsLoading, borderColor, backgroundColor, secondaryColor, 
         handleSearch, handleQuestionSubmit, canSubmitQuestion, buttonLabel, mode, iconColor,
         currentQuestion?.optional, conversationId, dispatch, textColor, handleRetry]
    );

    // Render search view content
    const renderSearchContent = () => (
        <BottomSheetScrollView 
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
                            {mode === 'booking' ? 'DESCRIPTION' : 'YOUR REQUEST'}
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
                        maxLength={255}
                    />
                    <View style={[styles.inputFooter, { borderTopColor: borderColor }]}>
                        {mode === 'search' && (
                            <View style={styles.inputHint}>
                                <Feather name="message-circle" size={14} color={secondaryColor} />
                                <ThemedText style={[styles.inputHintText, { color: secondaryColor }]}>
                                    AI will ask follow-up questions if needed
                                </ThemedText>
                            </View>
                        )}
                        <View style={[styles.charCountContainer, mode === 'booking' && { marginLeft: 'auto' }]}>
                            <ThemedText style={[
                                styles.charCount, 
                                { color: localSearch.length > 230 ? colors.light.danger : secondaryColor }
                            ]}>
                                {localSearch.length}
                            </ThemedText>
                            <ThemedText style={[styles.charCountTotal, { color: secondaryColor }]}>
                                /255
                            </ThemedText>
                        </View>
                    </View>
                </View>
            </View>

            {/* Suggestions Section - only in search mode */}
            {mode === 'search' && (
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
            )}

            {/* Tips Section */}
            <View style={[styles.tipsContainer, { backgroundColor: miscColor }]}>
                <View style={styles.tipHeader}>
                    <Feather name="info" size={14} color={secondaryColor} />
                    <ThemedText style={[styles.tipTitle, { color: secondaryColor }]}>
                        {mode === 'booking' ? 'TIP' : 'PRO TIP'}
                    </ThemedText>
                </View>
                <ThemedText style={[styles.tipText, { color: textColor }]}>
                    Be specific about location, urgency, and any special requirements for better matches.
                </ThemedText>
            </View>
        </BottomSheetScrollView>
    );

    // Render question view content
    const renderQuestionContent = () => (
        <BottomSheetScrollView 
            ref={questionScrollRef}
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

            {/* Text Input FIRST (so keyboard doesn't cover it) */}
            {renderQuestionTextInput()}
            
            {/* Then Options */}
            {renderOptions()}
        </BottomSheetScrollView>
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

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableWithoutFeedback onPress={agentIsLoading || currentView === 'question' ? undefined : handleClose}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>
                <BottomSheet
                    ref={bottomSheetRef}
                    snapPoints={['100%']}
                    index={0}
                    onChange={handleSheetChanges}
                    onClose={handleClose}
                    enablePanDownToClose={!agentIsLoading && currentView !== 'question'}
                    enableDynamicSizing={false}
                    keyboardBehavior="extend"
                    keyboardBlurBehavior="restore"
                    android_keyboardInputMode="adjustResize"
                    enableContentPanningGesture={true}
                    handleIndicatorStyle={{ backgroundColor: borderColor, width: widthPixel(40) }}
                    backgroundStyle={{
                        backgroundColor,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                    }}
                    footerComponent={renderFooter}
                >
                    <BottomSheetView style={styles.bottomSheetContent}>
                        {/* Header - show for search and question views */}
                        {(currentView === 'search' || currentView === 'question' || currentView === 'loading' || currentView === 'error') && (
                            <View style={styles.header}>
                                <View style={styles.headerLeft}>
                                    <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                                    <View style={styles.headerLabelRow}>
                                        <ThemedText style={[styles.headerLabel, { color: secondaryColor }]}>
                                            {currentView === 'question' ? 'QUICK QUESTION' : currentView === 'loading' ? 'LOADING...' : currentView === 'error' ? 'ERROR' : headerLabel}
                                        </ThemedText>
                                        {mode === 'search' && currentView === 'search' && (
                                            <View style={[styles.aiBadge, { borderColor: tintColor }]}>
                                                <Animated.View style={{ opacity: pulseAnim }}>
                                                    <Feather name="zap" size={10} color={tintColor} />
                                                </Animated.View>
                                                <ThemedText style={[styles.aiBadgeText, { color: tintColor }]}>
                                                    AI
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>
                                    <ThemedText 
                                        style={[styles.headerTitle, { color: textColor }]}
                                        lightColor={colors.light.text}
                                        darkColor={colors.dark.text}
                                    >
                                        {headerTitle}
                                    </ThemedText>
                                </View>
                                {
                                    currentView !== 'loading' && currentView !== 'error' && (
                                        <BackButton 
                                            iconName="x" 
                                            onPress={agentIsLoading ? undefined : handleClose} 
                                            containerStyle={styles.closeButton} 
                                        />
                                    )
                                }
                            </View>
                        )}

                        {/* Content based on current view */}
                        {currentView === 'search' && renderSearchContent()}
                        {currentView === 'question' && renderQuestionContent()}
                        {currentView === 'loading' && renderLoadingContent()}
                        {currentView === 'error' && renderErrorContent()}
                    </BottomSheetView>
                </BottomSheet>
            </View>
            <ConfirmActionSheet
                isOpen={showConfirmClose}
                isOpenChange={setShowConfirmClose}
                title="Cancel Question?"
                description="Are you sure you want to cancel? Your progress will be lost and you'll need to start over."
                onConfirm={handleConfirmClose}
                confirmText="Yes, Cancel"
                cancelText="Continue"
            />
        </Modal>
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
        paddingTop: heightPixel(20),
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
        paddingRight: widthPixel(16),
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
    // Question view styles
    questionContent: {
        flex: 1,
    },
    questionScrollContent: {
        paddingHorizontal: widthPixel(20),
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
    questionInputWrapper: {
        flexDirection: 'row',
        marginBottom: heightPixel(24),
        borderWidth: 0.5,
        borderLeftWidth: 0,
    },
    questionTextInput: {
        flex: 1,
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(14),
        fontSize: fontPixel(16),
        fontFamily: 'Regular',
        minHeight: heightPixel(52),
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
        paddingHorizontal: widthPixel(20),
        borderWidth: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    skipText: {
        fontSize: fontPixel(12),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
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
        paddingHorizontal: widthPixel(20),
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
