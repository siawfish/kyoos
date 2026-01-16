import BackButton from "@/components/ui/BackButton";
import BookingDescriptionModal from "@/components/ui/BookingDescriptionModal";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { actions as bookingActions } from "@/redux/booking/slice";
import { selectSearchReferenceId } from "@/redux/search/selector";
import { actions } from "@/redux/search/slice";
import { Worker } from "@/redux/search/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Feather } from "@expo/vector-icons";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef } from "react";
import { Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

interface ArtisanOptionsProps {
    isVisible: boolean;
    onClose: () => void;
    artisan?: Worker;
    children?: React.ReactNode;
}

const ArtisanOptions = ({ isVisible, onClose, artisan, children }: ArtisanOptionsProps) => {
    const theme = useAppTheme();
    const isDark = theme === 'dark';
    const accentColor = isDark ? colors.dark.white : colors.light.black;
    
    const backgroundColor = useThemeColor({
        light: colors.light.background,
        dark: colors.dark.background
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
    
    const router = useRouter();
    const searchReferenceId = useAppSelector(selectSearchReferenceId);
    const dispatch = useAppDispatch();
    const snapPoints = useMemo(() => ['30%'], []);
    const withChildrenSnapPoints = useMemo(() => ['65%'], []);
    const bottomSheetRef = useRef<BottomSheet>(null);

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            onClose();
        }
    }, [onClose]);

    const handleBookNow = () => {
        // Check if searchReferenceId is empty - if so, show description modal
        if (searchReferenceId === '') {
            dispatch(actions.setDescriptionModalVisible(true));
        } else {
            // If searchReferenceId exists, navigate directly to booking screen
            onClose();
            dispatch(bookingActions.initializeBooking());
            router.push({
                pathname: '/(tabs)/(search)/(booking)/booking',
                params: {
                    artisanId: artisan?.id
                }
            });
        }
    };

    const handleSeeProfile = () => {
        onClose();
        router.push({
            pathname: '/(tabs)/(search)/(artisan)/artisan',
            params: {
                artisanId: artisan?.id
            }
        });
    };

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.modalOverlay}>
                <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={StyleSheet.absoluteFill} />
                </TouchableWithoutFeedback>
                <BottomSheet
                    ref={bottomSheetRef}
                    snapPoints={children ? withChildrenSnapPoints : snapPoints}
                    onChange={handleSheetChanges}
                    onClose={onClose}
                    enablePanDownToClose
                    enableDynamicSizing={false}
                    handleIndicatorStyle={{ backgroundColor: borderColor, width: widthPixel(40) }}
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
                                <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                                <View style={styles.headerLabelRow}>
                                    <ThemedText style={[styles.headerLabel, { color: secondaryColor }]}>
                                        ARTISAN OPTIONS
                                    </ThemedText>
                                </View>
                                <ThemedText 
                                    style={[styles.headerTitle, { color: textColor }]}
                                    lightColor={colors.light.text}
                                    darkColor={colors.dark.text}
                                >
                                    {artisan?.name || 'Service Provider'}
                                </ThemedText>
                            </View>
                            <BackButton iconName="x" onPress={onClose} containerStyle={styles.closeButton} />
                        </View>

                        {/* Children Container */}
                        {children && (
                            <View style={[styles.childrenContainer, { borderBottomColor: borderColor }]}>
                                {children}
                            </View>
                        )}

                        {/* Action Items */}
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity 
                                style={[styles.actionItem, { borderColor }]} 
                                onPress={handleBookNow}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.actionAccent, { backgroundColor: tintColor }]} />
                                <View style={styles.actionContent}>
                                    <Feather name="calendar" size={20} color={tintColor} />
                                    <View style={styles.actionTextContainer}>
                                        <ThemedText style={[styles.actionTitle, { color: textColor }]}>
                                            Book Now
                                        </ThemedText>
                                        <ThemedText style={[styles.actionSubtitle, { color: secondaryColor }]}>
                                            Schedule a service appointment
                                        </ThemedText>
                                    </View>
                                </View>
                                <Feather name="chevron-right" size={18} color={secondaryColor} />
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.actionItem, { borderColor }]}
                                onPress={handleSeeProfile}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.actionAccent, { backgroundColor: tintColor }]} />
                                <View style={styles.actionContent}>
                                    <Feather name="user" size={20} color={tintColor} />
                                    <View style={styles.actionTextContainer}>
                                        <ThemedText style={[styles.actionTitle, { color: textColor }]}>
                                            See Profile
                                        </ThemedText>
                                        <ThemedText style={[styles.actionSubtitle, { color: secondaryColor }]}>
                                            View full profile and portfolio
                                        </ThemedText>
                                    </View>
                                </View>
                                <Feather name="chevron-right" size={18} color={secondaryColor} />
                            </TouchableOpacity>
                        </View>
                    </BottomSheetView>
                </BottomSheet>
            </View>

            {/* Booking Description Modal */}
            <BookingDescriptionModal
                artisan={artisan}
            />
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
        paddingBottom: heightPixel(40),
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
        marginBottom: heightPixel(8),
    },
    headerLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1.5,
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
    childrenContainer: {
        paddingHorizontal: widthPixel(20),
        paddingBottom: heightPixel(20),
        borderBottomWidth: 0.5,
        marginBottom: heightPixel(20),
    },
    actionsContainer: {
        paddingHorizontal: widthPixel(20),
        gap: heightPixel(12),
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.5,
        borderLeftWidth: 0,
        overflow: 'hidden',
    },
    actionAccent: {
        width: widthPixel(4),
        height: '100%',
    },
    actionContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(12),
        paddingHorizontal: widthPixel(16),
        paddingVertical: heightPixel(16),
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: fontPixel(16),
        fontFamily: 'Bold',
        marginBottom: heightPixel(2),
    },
    actionSubtitle: {
        fontSize: fontPixel(12),
        fontFamily: 'Regular',
    },
});

export default ArtisanOptions; 