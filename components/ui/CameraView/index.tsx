import React, { useCallback, useEffect, useState } from 'react';
import { View, TouchableOpacity, Platform, StyleSheet, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { colors } from '@/constants/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { verifyImage } from './utils';
import { heightPixel, widthPixel, fontPixel } from '@/constants/normalize';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const OVAL_WIDTH = screenWidth * 0.8;
const OVAL_HEIGHT = screenHeight * 0.4;

interface CameraViewProps {
    onCapture?: (uri: string) => void;
    onClose?: () => void;
}

const CameraView = ({ onCapture, onClose }: CameraViewProps) => {
    const { hasPermission, requestPermission } = useCameraPermission();
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('Position your face within the oval');
    const device = useCameraDevice('front');
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission, requestPermission]);

    const handleCapture = useCallback(async () => {
        try {
            if (device && camera.current) {
                const photo = await camera.current.takePhoto({
                    flash: 'off',
                });

                if (photo?.path) {
                    // Verify the image
                    const verificationResult = await verifyImage(photo);
                    
                    if (verificationResult.isValid) {
                        // Convert file path to proper URI based on platform
                        const uri = Platform.OS === 'ios' 
                            ? photo.path 
                            : `file://${photo.path}`;
                        
                        setPhoto(uri);
                        onCapture?.(uri);
                    } else {
                        setMessage(verificationResult.message);
                        // Wait 2 seconds before resetting message
                        setTimeout(() => {
                            setMessage('Position your face within the oval');
                        }, 2000);
                    }
                }
            }
        } catch (error) {
            console.error('Error capturing photo:', error);
            setMessage('Error capturing photo');
            setTimeout(() => {
                setMessage('Position your face within the oval');
            }, 2000);
        }
    }, [device, onCapture]);

    const camera = React.useRef<Camera>(null);

    if (!hasPermission) {
        return (
            <View style={[styles.container, { backgroundColor }]}>
                <ThemedText style={styles.permissionText}>
                    Please grant camera permission to continue
                </ThemedText>
            </View>
        );
    }

    if (!device) {
        return (
            <View style={[styles.container, { backgroundColor }]}>
                <ThemedText style={styles.permissionText}>
                    No camera device found
                </ThemedText>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <TouchableOpacity 
                style={styles.closeButton} 
                onPress={onClose}
            >
                <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>

            <Camera
                ref={camera}
                style={styles.camera}
                device={device}
                isActive={true}
                photo={true}
                onInitialized={() => setIsCameraReady(true)}
            />

            {/* Oval mask overlay */}
            <View style={styles.maskContainer}>
                <View style={styles.ovalMask} />
                <ThemedText style={styles.guideText}>
                    {message}
                </ThemedText>
            </View>

            {/* Capture button */}
            <TouchableOpacity 
                style={[
                    styles.captureButton,
                    !isCameraReady && styles.captureButtonDisabled
                ]}
                onPress={handleCapture}
                disabled={!isCameraReady}
            >
                <View style={styles.captureButtonInner} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    maskContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ovalMask: {
        width: OVAL_WIDTH,
        height: OVAL_HEIGHT,
        borderWidth: 2,
        borderColor: colors.light.tint,
        borderRadius: OVAL_HEIGHT / 2,
        backgroundColor: 'transparent',
    },
    guideText: {
        position: 'absolute',
        bottom: heightPixel(100),
        textAlign: 'center',
        fontSize: fontPixel(16),
        color: colors.light.white,
        paddingHorizontal: widthPixel(20),
    },
    closeButton: {
        position: 'absolute',
        top: heightPixel(50),
        right: widthPixel(20),
        zIndex: 1,
        padding: widthPixel(10),
    },
    captureButton: {
        position: 'absolute',
        bottom: heightPixel(50),
        alignSelf: 'center',
        width: widthPixel(70),
        height: widthPixel(70),
        borderRadius: widthPixel(35),
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: widthPixel(60),
        height: widthPixel(60),
        borderRadius: widthPixel(30),
        backgroundColor: colors.light.tint,
    },
    captureButtonDisabled: {
        opacity: 0.5,
    },
    permissionText: {
        textAlign: 'center',
        marginTop: heightPixel(50),
        paddingHorizontal: widthPixel(20),
    },
});

export default CameraView; 