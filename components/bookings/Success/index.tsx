import { BlurView } from "expo-blur";
import SuccessOverlay from "@/components/ui/SuccessOverlay";
import { useAppTheme } from "@/hooks/use-app-theme";
import { StyleSheet, View } from "react-native";

interface SuccessProps {
    readonly onButtonPress: () => void;
}


export default function Success({ onButtonPress }: SuccessProps) {
    const theme = useAppTheme();
    const isDark = theme === 'dark';

    return (
        <View>
            <BlurView
                intensity={60}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
            />
            <SuccessOverlay
                title="Booking Requested"
                text="Your booking has been requested. We will notify you when the booking is accepted."
                buttonLabel="View Booking"
                onButtonPress={onButtonPress}
            />
        </View>
    );
}