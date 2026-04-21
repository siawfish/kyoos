import { BlurView } from "expo-blur";
import SuccessOverlay from "@/components/ui/SuccessOverlay";
import { useAppTheme } from "@/hooks/use-app-theme";
import { StyleSheet, View } from "react-native";

interface SuccessProps {
    onButtonPress: () => void;
    title?: string;
    text?: string;
    buttonLabel?: string;
}


export default function Success({ 
    onButtonPress, 
    title='Booking Requested', 
    text='Your booking has been requested. We will notify you when the booking is accepted.', 
    buttonLabel='View Booking'
}: Readonly<SuccessProps>) {
    const theme = useAppTheme();
    const isDark = theme === 'dark';

    return (
        <View style={styles.container}>
            <BlurView
                intensity={60}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
            />
            <SuccessOverlay
                title={title}
                text={text}
                buttonLabel={buttonLabel}
                onButtonPress={onButtonPress}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});