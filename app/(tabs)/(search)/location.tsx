import { ThemedSafeAreaView } from "@/components/ui/Themed/ThemedSafeAreaView";
import { StyleSheet } from "react-native";
import LocationSelector from "@/components/account/UserLocation";

export default function LocationScreen() {
    return (
        <ThemedSafeAreaView style={[styles.container]}>
            <LocationSelector />
        </ThemedSafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

