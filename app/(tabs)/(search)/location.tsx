import { ScreenLayout } from "@/components/layout/ScreenLayout";
import { StyleSheet } from "react-native";
import LocationSelector from "@/components/account/UserLocation/LocationSelector";

export default function LocationScreen() {
    return (
        <ScreenLayout style={[styles.container]}>
            <LocationSelector />
        </ScreenLayout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

