import React, { useCallback, useMemo, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { colors } from "@/constants/theme/colors";
import { Feather } from "@expo/vector-icons";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { useRouter } from "expo-router";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { Worker } from "@/redux/search/types";

interface ArtisanOptionsProps {
    isVisible: boolean;
    onClose: () => void;
    artisan?: Worker;
    children?: React.ReactNode;
}

const ArtisanOptions = ({ isVisible, onClose, artisan, children }: ArtisanOptionsProps) => {
    const backgroundColor = useThemeColor({
        light: colors.light.white,
        dark: colors.dark.black
    }, 'background');
    const textColor = useThemeColor({
        light: colors.light.text,
        dark: colors.dark.text,
    }, 'text');
    const router = useRouter();
    const snapPoints = useMemo(() => ['25%'], []);
    const withChildrenSnapPoints = useMemo(() => ['55%'], []);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            onClose();
        }
    }, [onClose]);

    const handleBookNow = () => {
        onClose();
        router.push(`/(tabs)/(search)/(booking)`);
    };

    const handleSeeProfile = () => {
        onClose();
        router.push(`/(tabs)/(search)/(artisan)`);
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.modalOverlay}>
                <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>
                <BottomSheet
                    ref={bottomSheetRef}
                    snapPoints={children ? withChildrenSnapPoints : snapPoints}
                    onChange={handleSheetChanges}
                    onClose={onClose}
                    enablePanDownToClose
                    backgroundStyle={{
                        backgroundColor,
                        borderTopLeftRadius: 15,
                        borderTopRightRadius: 15,
                    }}
                >
                    <BottomSheetView style={styles.bottomSheetContent}>
                        <View style={styles.childrenContainer}>
                            {children}
                        </View>
                        <TouchableOpacity 
                            style={styles.bottomSheetItem} 
                            onPress={handleBookNow}
                        >
                            <Feather name="calendar" size={24} color={textColor} />
                            <ThemedText style={styles.bottomSheetText}>Book Now</ThemedText>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.bottomSheetItem}
                            onPress={handleSeeProfile}
                        >
                            <Feather name="user" size={24} color={textColor} />
                            <ThemedText style={styles.bottomSheetText}>See Profile</ThemedText>
                        </TouchableOpacity>
                    </BottomSheetView>
                </BottomSheet>
            </View>
        </Modal>
    );
};

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
    bottomSheetItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(12),
        paddingVertical: heightPixel(12),
    },
    bottomSheetText: {
        fontSize: fontPixel(16),
        fontFamily: 'Medium',
    },
    childrenContainer: {
        marginBottom: heightPixel(16),
    },
});

export default ArtisanOptions; 