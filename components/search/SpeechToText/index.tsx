import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Modal, 
  TouchableWithoutFeedback,
  Animated,
  Platform 
} from 'react-native';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BlurView } from 'expo-blur';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

interface SpeechToTextProps {
  disabled?: boolean;
  onTextReceived?: (text: string) => void;
}

export default function SpeechToText({
  disabled = false,
  onTextReceived
}: SpeechToTextProps) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedText, setRecordedText] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasTriedFallback, setHasTriedFallback] = useState(false);

  const snapPoints = useMemo(() => ['40%'], []);
  const bottomSheetRef = useRef<BottomSheet>(null);
  
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

  const buttonBackgroundColor = useThemeColor({
    light: colors.light.white,
    dark: colors.dark.black,
  }, 'white');

  const secondaryTextColor = useThemeColor({
    light: colors.light.secondary,
    dark: colors.dark.secondary,
  }, 'secondary');

  // Check if speech recognition is available
  useEffect(() => {
    const checkAvailability = async () => {
      const available = ExpoSpeechRecognitionModule.isRecognitionAvailable();
      setIsAvailable(available);
    };
    checkAvailability();
  }, []);

  // Speech recognition event handler
  useSpeechRecognitionEvent('start', () => {
    console.log('Speech recognition started');
    setIsRecording(true);
  });

  useSpeechRecognitionEvent('result', (event) => {
    const transcription = event.results[0]?.transcript;
    if (transcription) {
      setRecordedText(transcription);
      
      // If it's a final result, set the text
      if (event.isFinal) {
        onTextReceived?.(transcription);
      }
    }
  });

  useSpeechRecognitionEvent('end', () => {
    console.log('Speech recognition ended');
    setIsRecording(false);
    stopAnimations();
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error);
    setIsRecording(false);
    stopAnimations();
    
    // Try on-device recognition as fallback for service-related errors
    if ((event.error === 'service-not-allowed' || event.error === 'busy') && !hasTriedFallback) {
      console.log('Trying on-device recognition as fallback...');
      setHasTriedFallback(true);
      
      // Try with on-device recognition
      try {
        ExpoSpeechRecognitionModule.start({
          lang: 'en-US',
          interimResults: true,
          maxAlternatives: 1,
          continuous: false,
          requiresOnDeviceRecognition: true, // Force on-device
          addsPunctuation: true,
          contextualStrings: ['plumber', 'electrician', 'carpenter', 'handyman', 'repair', 'fix'],
        });
        setIsRecording(true);
        startAnimations();
        return; // Don't show error message yet
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
    
    // Show specific error messages to user based on error type
    if (event.error === 'not-allowed') {
      alert('Microphone access denied. Please enable microphone permissions in Settings.');
    } else if (event.error === 'audio-capture') {
      alert('Audio recording error. Please check your microphone and try again.');
    } else if (event.error === 'service-not-allowed') {
      alert('Speech recognition service is not allowed. Please enable Siri & Dictation in Settings.');
    } else if (event.error === 'language-not-supported') {
      alert('Language not supported. Please check your device language settings.');
    } else if (event.error === 'no-speech') {
      alert('No speech detected. Please speak clearly and try again.');
    } else {
      alert(`Speech recognition error: ${event.error}. Please try again.`);
    }
    
    // Reset fallback flag
    setHasTriedFallback(false);
    
    // Auto-close the bottom sheet on error
    handleClose();
  });

  // Animation functions
  const startAnimations = () => {
    // Pulse animation for the microphone icon
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Wave animation for visual feedback
    const waveLoop = Animated.loop(
      Animated.timing(waveAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    pulseLoop.start();
    waveLoop.start();
  };

  const stopAnimations = () => {
    pulseAnimation.setValue(1);
    waveAnimation.setValue(0);
  };

  const handleStartSpeechRecognition = async () => {
    if (!isAvailable) {
      alert('Speech recognition is not available on this device. Please ensure Siri & Dictation is enabled in Settings.');
      return;
    }

    try {
      setRecordedText('');
      setHasTriedFallback(false); // Reset fallback flag for new session
      
      // Request permissions and start recognition
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      
      if (!result.granted) {
        alert('Microphone permission is required for speech recognition');
        return;
      }

      // Check if on-device recognition is supported
      const supportsOnDevice = ExpoSpeechRecognitionModule.supportsOnDeviceRecognition();
      console.log('On-device recognition supported:', supportsOnDevice);

      // Try different configurations based on device capabilities
      const startOptions = {
        lang: 'en-US',
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false, // Start with cloud-based
        addsPunctuation: true,
        contextualStrings: ['plumber', 'electrician', 'carpenter', 'handyman', 'repair', 'fix', 'bathroom', 'kitchen', 'pipe', 'leak'],
      };

      // Start speech recognition
      ExpoSpeechRecognitionModule.start(startOptions);
      startAnimations();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      
      // More specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('1101')) {
        alert('Speech recognition service is currently unavailable. Please check your internet connection and ensure Siri & Dictation is enabled in Settings > Siri & Search.');
      } else if (errorMessage.includes('permission')) {
        alert('Please enable microphone and speech recognition permissions in Settings.');
      } else {
        alert(`Speech recognition failed: ${errorMessage || 'Unknown error'}. Please try again.`);
      }
      
      setIsRecording(false);
      stopAnimations();
    }
  };

  const handleStopSpeechRecognition = () => {
    ExpoSpeechRecognitionModule.stop();
    handleClose();
  };

  const handleSpeechToText = () => {
    setIsBottomSheetOpen(true);
    bottomSheetRef.current?.expand();
  };

  const handleClose = () => {
    if (isRecording) {
      ExpoSpeechRecognitionModule.stop();
    }
    setIsBottomSheetOpen(false);
    bottomSheetRef.current?.close();
    setRecordedText('');
  };

  const handleSheetChanges = useCallback((index: number) => {
    setIsBottomSheetOpen(index !== -1);
    if (index === -1 && isRecording) {
      ExpoSpeechRecognitionModule.stop();
    }
  }, [isRecording]);

  const WaveForm = () => {
    return (
      <View style={styles.waveformContainer}>
        {[...Array(5)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.waveBar,
              {
                backgroundColor: tintColor,
                transform: [
                  {
                    scaleY: waveAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1 + Math.random() * 0.5],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity 
        style={[styles.actionButton, { borderColor: tintColor, backgroundColor: buttonBackgroundColor }]}
        onPress={handleSpeechToText}
        disabled={disabled || !isAvailable}
      >
        <Ionicons name="mic" size={16} color={tintColor} />
        <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
          Voice Input
        </ThemedText>
      </TouchableOpacity>

      <Modal
        visible={isBottomSheetOpen}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
          
          <BottomSheet
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            onClose={handleClose}
            enablePanDownToClose
            backgroundStyle={{
              backgroundColor,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
            }}
          >
            <BottomSheetView style={styles.bottomSheetContent}>
              {/* Header */}
              <View style={styles.header}>
                <ThemedText style={styles.headerTitle}>
                  Speech to Text
                </ThemedText>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color={textColor} />
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
                      <Ionicons name="mic" size={32} color="#fff" />
                    </Animated.View>
                    
                    <WaveForm />
                    
                    <ThemedText style={styles.recordingText}>
                      Listening...
                    </ThemedText>
                    
                    {recordedText ? (
                      <View style={styles.transcriptionContainer}>
                        <ThemedText style={[styles.transcriptionText, { color: textColor }]}>
                          "{recordedText}"
                        </ThemedText>
                      </View>
                    ) : null}
                  </>
                ) : (
                  <>
                    <View style={[styles.microphoneContainer, { backgroundColor: tintColor }]}>
                      <Ionicons name="mic" size={32} color="#fff" />
                    </View>
                    
                    <ThemedText style={[styles.instructionText, { color: secondaryTextColor }]}>
                      Tap the microphone to start recording
                    </ThemedText>
                  </>
                )}
              </View>

              {/* Control Buttons */}
              <View style={styles.controlsContainer}>
                {!isRecording ? (
                  <TouchableOpacity 
                    style={[styles.recordButton, { backgroundColor: tintColor }]}
                    onPress={handleStartSpeechRecognition}
                  >
                    <Ionicons name="mic" size={24} color="#fff" />
                    <ThemedText style={styles.recordButtonText}>
                      Start Recording
                    </ThemedText>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.stopButton, { backgroundColor: '#ff4444' }]}
                    onPress={handleStopSpeechRecognition}
                  >
                    <Ionicons name="stop" size={24} color="#fff" />
                    <ThemedText style={styles.stopButtonText}>
                      Stop Recording
                    </ThemedText>
                  </TouchableOpacity>
                )}
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
    padding: widthPixel(16),
    paddingBottom: heightPixel(40),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(6),
    paddingHorizontal: widthPixel(12),
    paddingVertical: heightPixel(8),
    borderRadius: 20,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: fontPixel(12),
    fontFamily: 'CabinetGrotesk-Medium',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: heightPixel(24),
  },
  headerTitle: {
    fontSize: fontPixel(18),
    fontFamily: 'CabinetGrotesk-Medium',
    fontWeight: '600',
  },
  recordingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: heightPixel(20),
  },
  microphoneContainer: {
    width: widthPixel(80),
    height: widthPixel(80),
    borderRadius: widthPixel(40),
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
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
    height: heightPixel(20),
    borderRadius: widthPixel(1.5),
  },
  recordingText: {
    fontSize: fontPixel(16),
    fontFamily: 'CabinetGrotesk-Medium',
    fontWeight: '500',
    textAlign: 'center',
  },
  instructionText: {
    fontSize: fontPixel(14),
    fontFamily: 'CabinetGrotesk-Regular',
    textAlign: 'center',
    maxWidth: widthPixel(200),
  },
  transcriptionContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: widthPixel(16),
    borderRadius: 12,
    maxWidth: '90%',
  },
  transcriptionText: {
    fontSize: fontPixel(14),
    fontFamily: 'CabinetGrotesk-Regular',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  controlsContainer: {
    paddingTop: heightPixel(20),
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: widthPixel(8),
    paddingVertical: heightPixel(12),
    borderRadius: 8,
  },
  recordButtonText: {
    fontSize: fontPixel(16),
    fontFamily: 'CabinetGrotesk-Medium',
    fontWeight: '500',
    color: '#fff',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: widthPixel(8),
    paddingVertical: heightPixel(12),
    borderRadius: 8,
  },
  stopButtonText: {
    fontSize: fontPixel(16),
    fontFamily: 'CabinetGrotesk-Medium',
    fontWeight: '500',
    color: '#fff',
  },
}); 