import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { heightPixel, widthPixel, fontPixel } from '@/constants/normalize';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const OVAL_WIDTH = screenWidth * 0.8;
const OVAL_HEIGHT = screenHeight * 0.4;

export const styles = StyleSheet.create({
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
        borderColor: Colors.light.tint,
        borderRadius: OVAL_HEIGHT / 2,
        backgroundColor: 'transparent',
    },
    guideText: {
        position: 'absolute',
        bottom: heightPixel(100),
        textAlign: 'center',
        fontSize: fontPixel(16),
        color: Colors.light.white,
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
        backgroundColor: Colors.light.tint,
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