import user from "@/assets/images/individual.png";
import ThemedText from "@/components/ui/Themed/ThemedText";
import { fontPixel, widthPixel } from "@/constants/normalize";
import { selectUser } from "@/redux/app/selector";
import { selectMessages } from "@/redux/messaging/selector";
import { useGlobalSearchParams } from "expo-router";
import { Image, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";

export default function Title(){
    const {id} = useGlobalSearchParams();
    const loggedInUser = useSelector(selectUser);
    const messages = useSelector(selectMessages)
    const sender = messages.find(m=>m.id === id)?.participants.find(p=>p.id !== loggedInUser?.id)
    return (
        <View style={styles.headerTitle}>
            {
                sender?.avatar ? (
                    <Image source={{uri: sender?.avatar}} style={{ width: widthPixel(24), height: widthPixel(24), borderRadius: 100 }} />
                ) : (
                    <Image source={user} style={{ width: widthPixel(24), height: widthPixel(24), borderRadius: 100 }} />
                )
            }
            <ThemedText type="subtitle" style={{ textAlign: 'center', fontSize: fontPixel(14) }}>{sender?.name}</ThemedText>
        </View>
    )
}


const styles = StyleSheet.create({
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: widthPixel(8),
  },
});

