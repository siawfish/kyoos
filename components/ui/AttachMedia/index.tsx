import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Media, MimeType } from '@/redux/app/types';
import { Feather } from '@expo/vector-icons';
import BottomSheet, { BottomSheetFooter, BottomSheetView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface MediaOption {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
  disabled?: boolean;
}

interface AttachMediaProps {
  disabled?: boolean;
  onChange?: (media: Media[]) => void;
  onTextReceived?: (text: string) => void;
  maxCount?: number;
}

export default function AttachMedia({
  disabled = false,
  onChange,
  onTextReceived,
  maxCount = 10,
}: AttachMediaProps) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [isSpeechAvailable, setIsSpeechAvailable] = useState(false);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  const snapPoints = useMemo(() => ['45%'], []);
  const voiceSnapPoints = useMemo(() => ['45%'], []);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const voiceSheetRef = useRef<BottomSheet>(null);

  // Animation refs for recording visualization
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;

  const textColor = useThemeColor({
    light: colors.light.text,
    dark: colors.dark.text,
  }, 'text');

  const backgroundColor = useThemeColor({
    light: colors.light.background,
    dark: colors.dark.background,
  }, 'background');

  const tintColor = useThemeColor({
    light: colors.light.tint,
    dark: colors.dark.tint,
  }, 'tint');

  const secondaryColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary,
  }, 'secondary');

  const borderColor = useThemeColor({
    light: colors.light.grey,
    dark: colors.dark.grey,
  }, 'grey');

  const miscColor = useThemeColor({
    light: colors.light.misc,
    dark: colors.dark.misc,
  }, 'misc');

  const dangerColor = colors.light.danger;

  // Check if speech recognition is available
  useEffect(() => {
    const checkAvailability = () => {
      const available = ExpoSpeechRecognitionModule.isRecognitionAvailable();
      setIsSpeechAvailable(available);
    };
    checkAvailability();
  }, []);

  // Speech recognition event handlers
  useSpeechRecognitionEvent('start', () => {
    setIsRecording(true);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcription = event.results[0]?.transcript;
    if (transcription) {
      setRecordedText(transcription);
      if (event.isFinal) {
        onTextReceived?.(transcription);
      }
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setIsRecording(false);
    stopAnimations();
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error);
    setIsRecording(false);
    stopAnimations();
    
    // Try on-device recognition as fallback
    if ((event.error === 'service-not-allowed' || event.error === 'busy') && !hasTriedFallback) {
      setHasTriedFallback(true);
      try {
        ExpoSpeechRecognitionModule.start({
          lang: 'en-US',
          interimResults: true,
          maxAlternatives: 1,
          continuous: false,
          requiresOnDeviceRecognition: true,
          addsPunctuation: true,
          contextualStrings: ['plumber', 'electrician', 'carpenter', 'handyman', 'repair', 'fix'],
        });
        setIsRecording(true);
        startAnimations();
        return;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
    
    // Show specific error messages
    if (event.error === 'not-allowed') {
      alert('Microphone access denied. Please enable microphone permissions in Settings.');
    } else if (event.error === 'audio-capture') {
      alert('Audio recording error. Please check your microphone and try again.');
    } else if (event.error === 'service-not-allowed') {
      alert('Speech recognition service is not allowed. Please enable Siri & Dictation in Settings.');
    } else if (event.error === 'no-speech') {
      alert('No speech detected. Please speak clearly and try again.');
    } else {
      alert(`Speech recognition error: ${event.error}. Please try again.`);
    }
    
    setHasTriedFallback(false);
    handleCloseVoiceModal();
  });

  // Animation functions
  const startAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(waveAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  };

  const stopAnimations = useCallback(() => {
    pulseAnimation.setValue(1);
    waveAnimation.setValue(0);
  }, [pulseAnimation, waveAnimation]);

  const handleAttachMedia = () => {
    setIsBottomSheetOpen(true);
    bottomSheetRef.current?.expand();
  };

  const handleClose = () => {
    setIsBottomSheetOpen(false);
    bottomSheetRef.current?.close();
  };

  const handleCloseVoiceModal = useCallback(() => {
    if (isRecording) {
      ExpoSpeechRecognitionModule.stop();
    }
    setIsVoiceModalOpen(false);
    voiceSheetRef.current?.close();
    setRecordedText('');
    setIsRecording(false);
    stopAnimations();
  }, [isRecording, stopAnimations]);

  const handleMediaPicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert('Permission to access media library is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 1,
        selectionLimit: 1,
      });
  
      handleClose();
      
      if (!result.canceled) {
        onChange?.(result.assets.map((asset) => ({
          type: asset.mimeType as MimeType,
          url: asset.uri,
          width: asset.width,
          height: asset.height,
        })));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image. Please try again.');
      handleClose();
    }
  };

  const handleCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        alert('Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
  
      handleClose();
      
      if (!result.canceled) {
        onChange?.(result.assets.map((asset) => ({
          type: asset.mimeType as MimeType,
          url: asset.uri,
          width: asset.width,
          height: asset.height,
        })));
      }
    } catch (error) {
      console.error('Error using camera:', error);
      alert('Failed to capture photo. Please try again.');
      handleClose();
    }
  };

  const handleVoiceInput = () => {
    handleClose();
    setTimeout(() => {
      setIsVoiceModalOpen(true);
      voiceSheetRef.current?.expand();
    }, 300);
  };

  const handleStartSpeechRecognition = async () => {
    if (!isSpeechAvailable) {
      alert('Speech recognition is not available. Please enable Siri & Dictation in Settings.');
      return;
    }

    try {
      setRecordedText('');
      setHasTriedFallback(false);
      
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      
      if (!result.granted) {
        alert('Microphone permission is required for speech recognition');
        return;
      }

      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
        contextualStrings: ['plumber', 'electrician', 'carpenter', 'handyman', 'repair', 'fix', 'bathroom', 'kitchen', 'pipe', 'leak'],
      });
      startAnimations();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Speech recognition failed: ${errorMessage || 'Unknown error'}. Please try again.`);
      setIsRecording(false);
      stopAnimations();
    }
  };

  const handleStopSpeechRecognition = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  const handleUseSpeechText = () => {
    if (recordedText) {
      onTextReceived?.(recordedText);
    }
    handleCloseVoiceModal();
  };

  const handleSheetChanges = useCallback((index: number) => {
    setIsBottomSheetOpen(index !== -1);
  }, []);

  const handleVoiceSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      handleCloseVoiceModal();
    }
  }, [handleCloseVoiceModal]);

  const WaveForm = () => (
    <View style={styles.waveformContainer}>
      {[...Array(7)].map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            {
              backgroundColor: tintColor,
              height: heightPixel(20 + Math.random() * 20),
              transform: [
                {
                  scaleY: waveAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.4, 1 + Math.random() * 0.5, 0.4],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );

  const mediaOptions: MediaOption[] = [
    {
      id: 'gallery',
      icon: 'image',
      label: 'Photo Library',
      description: 'Choose an image from your gallery',
      onPress: handleMediaPicker,
    },
    {
      id: 'camera',
      icon: 'camera',
      label: 'Take Photo',
      description: 'Take a photo with camera',
      onPress: handleCamera,
    },
    {
      id: 'voice',
      icon: 'mic',
      label: 'Voice Input',
      description: 'Speak to describe your request',
      onPress: handleVoiceInput,
      disabled: !isSpeechAvailable,
    },
  ];
    
  return (
    <>
      <TouchableOpacity 
        style={[styles.actionButton, { borderColor: tintColor }]}
        onPress={handleAttachMedia}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Feather name="paperclip" size={14} color={tintColor} />
      </TouchableOpacity>

      {/* Media Options Sheet */}
      <Modal
        visible={isBottomSheetOpen}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            onClose={handleClose}
            enablePanDownToClose
            enableDynamicSizing={false}
            handleIndicatorStyle={{ display: 'none' }}
            backgroundStyle={{
              backgroundColor,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
          >
            <BottomSheetView style={styles.bottomSheetContent}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={[styles.accentBar, { backgroundColor: tintColor }]} />
                  <ThemedText style={[styles.headerLabel, { color: secondaryColor }]}>
                    ADD INPUT
                  </ThemedText>
                  <ThemedText style={[styles.headerTitle, { color: textColor }]}>
                    Attach Media
                  </ThemedText>
                </View>
                <TouchableOpacity 
                  onPress={handleClose} 
                  style={[styles.closeButton, { borderColor }]}
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={18} color={textColor} />
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {mediaOptions.map((option, index) => (
                  <TouchableOpacity 
                    key={option.id}
                    style={[
                      styles.optionItem, 
                      { 
                        borderColor,
                        borderBottomWidth: index === mediaOptions.length - 1 ? 0.5 : 0,
                        opacity: option.disabled ? 0.5 : 1,
                      }
                    ]}
                    onPress={option.onPress}
                    activeOpacity={0.7}
                    disabled={option.disabled}
                  >
                    <View style={[styles.optionAccent, { backgroundColor: tintColor }]} />
                    <View style={[styles.optionIconContainer, { backgroundColor: miscColor }]}>
                      <Feather name={option.icon} size={20} color={tintColor} />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <ThemedText style={[styles.optionLabel, { color: textColor }]}>
                        {option.label}
                      </ThemedText>
                      <ThemedText style={[styles.optionDescription, { color: secondaryColor }]}>
                        {option.description}
                      </ThemedText>
                    </View>
                    <Feather name="chevron-right" size={18} color={secondaryColor} />
                  </TouchableOpacity>
                ))}
              </View>
            </BottomSheetView>
          </BottomSheet>
        </View>
      </Modal>

      {/* Voice Input Sheet */}
      <Modal
        visible={isVoiceModalOpen}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableWithoutFeedback onPress={handleCloseVoiceModal}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          <BottomSheet
            ref={voiceSheetRef}
            index={0}
            snapPoints={voiceSnapPoints}
            onChange={handleVoiceSheetChanges}
            onClose={handleCloseVoiceModal}
            enablePanDownToClose
            enableDynamicSizing={false}
            handleIndicatorStyle={{ display: 'none' }}
            backgroundStyle={{
              backgroundColor,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
            }}
            footerComponent={(props) => (
              <BottomSheetFooter {...props} bottomInset={0}>
                <View style={[styles.voiceControlsContainer, { borderTopColor: borderColor, backgroundColor }]}>
                  {!isRecording ? (
                    <TouchableOpacity 
                      style={[styles.voiceButton, { backgroundColor: tintColor }]}
                      onPress={handleStartSpeechRecognition}
                      activeOpacity={0.8}
                    >
                      <Feather name="mic" size={20} color={backgroundColor} />
                      <ThemedText style={[styles.voiceButtonText, { color: backgroundColor }]}>
                        Start Recording
                      </ThemedText>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.voiceButton, { backgroundColor: dangerColor }]}
                      onPress={handleStopSpeechRecognition}
                      activeOpacity={0.8}
                    >
                      <Feather name="square" size={18} color={colors.light.white} />
                      <ThemedText style={[styles.voiceButtonText, { color: colors.light.white }]}>
                        Stop Recording
                      </ThemedText>
                    </TouchableOpacity>
                  )}

                  {recordedText && !isRecording ? (
                    <TouchableOpacity 
                      style={[styles.useTextButton, { borderColor: tintColor }]}
                      onPress={handleUseSpeechText}
                      activeOpacity={0.7}
                    >
                      <Feather name="check" size={18} color={tintColor} />
                      <ThemedText style={[styles.useTextButtonText, { color: tintColor }]}>
                        Use This Text
                      </ThemedText>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </BottomSheetFooter>
            )}
          >
            <BottomSheetView style={styles.voiceSheetContent}>
              <View style={styles.voiceMainContent}>
                {/* Voice Header */}
                <View style={styles.header}>
                  <View style={styles.headerLeft}>
                    <View style={[styles.accentBar, { backgroundColor: tintColor }]} />
                    <ThemedText style={[styles.headerLabel, { color: secondaryColor }]}>
                      VOICE INPUT
                    </ThemedText>
                    <ThemedText style={[styles.headerTitle, { color: textColor }]}>
                      Speak Your Request
                    </ThemedText>
                  </View>
                  <TouchableOpacity 
                    onPress={handleCloseVoiceModal} 
                    style={[styles.closeButton, { borderColor }]}
                    activeOpacity={0.7}
                  >
                    <Feather name="x" size={18} color={textColor} />
                  </TouchableOpacity>
                </View>

                {/* Recording Area */}
                <View style={styles.recordingArea}>
                  {isRecording ? (
                    <>
                      <Animated.View 
                        style={[
                          styles.microphoneContainer,
                          { 
                            backgroundColor: tintColor,
                            transform: [{ scale: pulseAnimation }]
                          }
                        ]}
                      >
                        <Feather name="mic" size={28} color={colors.light.white} />
                      </Animated.View>
                      
                      <WaveForm />
                      
                      <ThemedText style={[styles.recordingStatus, { color: tintColor }]}>
                        LISTENING...
                      </ThemedText>
                    </>
                  ) : (
                    <>
                      <View style={[styles.microphoneContainer, { backgroundColor: miscColor }]}>
                        <Feather name="mic" size={28} color={tintColor} />
                      </View>
                      
                      <ThemedText style={[styles.instructionText, { color: secondaryColor }]}>
                        Tap below to start speaking
                      </ThemedText>
                    </>
                  )}

                  {/* Transcription */}
                  {recordedText ? (
                    <View style={[styles.transcriptionContainer, { borderColor, backgroundColor: miscColor }]}>
                      <ThemedText style={[styles.transcriptionLabel, { color: secondaryColor }]}>
                        TRANSCRIPTION
                      </ThemedText>
                      <ThemedText style={[styles.transcriptionText, { color: textColor }]}>
                        &quot;{recordedText}&quot;
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
              </View>
            </BottomSheetView>
          </BottomSheet>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  bottomSheetContent: {
    flex: 1,
    paddingTop: heightPixel(20),
  },
  voiceSheetContent: {
    flex: 1,
    paddingTop: heightPixel(20),
  },
  voiceMainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: widthPixel(20),
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
  headerLabel: {
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
    width: widthPixel(36),
    height: widthPixel(36),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    marginTop: heightPixel(8),
  },
  optionsContainer: {
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: heightPixel(14),
    paddingRight: widthPixel(20),
    borderTopWidth: 0.5,
    borderLeftWidth: 0,
  },
  optionAccent: {
    width: widthPixel(3),
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  optionIconContainer: {
    width: widthPixel(44),
    height: widthPixel(44),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: widthPixel(20),
  },
  optionTextContainer: {
    flex: 1,
    marginLeft: widthPixel(14),
  },
  optionLabel: {
    fontSize: fontPixel(15),
    fontFamily: 'SemiBold',
  },
  optionDescription: {
    fontSize: fontPixel(12),
    fontFamily: 'Regular',
    marginTop: heightPixel(2),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(6),
    paddingVertical: heightPixel(8),
    paddingHorizontal: widthPixel(12),
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: fontPixel(12),
    fontFamily: 'SemiBold',
  },
  recordingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: widthPixel(20),
    gap: heightPixel(16),
  },
  microphoneContainer: {
    width: widthPixel(72),
    height: widthPixel(72),
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(4),
    height: heightPixel(40),
  },
  waveBar: {
    width: widthPixel(3),
  },
  recordingStatus: {
    fontSize: fontPixel(11),
    fontFamily: 'SemiBold',
    letterSpacing: 1.5,
  },
  instructionText: {
    fontSize: fontPixel(14),
    fontFamily: 'Regular',
    textAlign: 'center',
  },
  transcriptionContainer: {
    width: '100%',
    padding: widthPixel(16),
    borderWidth: 0.5,
  },
  transcriptionLabel: {
    fontSize: fontPixel(9),
    fontFamily: 'SemiBold',
    letterSpacing: 1.2,
    marginBottom: heightPixel(8),
  },
  transcriptionText: {
    fontSize: fontPixel(15),
    fontFamily: 'Medium',
    lineHeight: fontPixel(22),
    fontStyle: 'italic',
  },
  voiceControlsContainer: {
    paddingHorizontal: widthPixel(20),
    paddingTop: heightPixel(16),
    paddingBottom: heightPixel(40),
    borderTopWidth: 0.5,
    gap: heightPixel(12),
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: widthPixel(10),
    height: heightPixel(52),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  voiceButtonText: {
    fontSize: fontPixel(15),
    fontFamily: 'SemiBold',
  },
  useTextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: widthPixel(8),
    height: heightPixel(48),
    borderWidth: 1,
  },
  useTextButtonText: {
    fontSize: fontPixel(14),
    fontFamily: 'SemiBold',
  },
});