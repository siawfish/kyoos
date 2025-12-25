import { StyleSheet, Image, View } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/ui/Themed/ThemedView'
import user from "@/assets/images/individual.png";
import { heightPixel, widthPixel } from '@/constants/normalize';
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import Rating from '../Rating';
import IconButton from '@/components/ui/IconButton';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '@/constants/theme/colors';
import { Link } from 'expo-router';

const ContactCard = () => {
    return (
        <ThemedView
            style={styles.container}
        >
            <View style={styles.row}>
                <View style={styles.user}>
                    <Image
                        source={user}
                        style={styles.img}
                    />
                    <View>
                        <ThemedText style={styles.name} type="defaultSemiBold">John Doe</ThemedText>
                        <Rating rating={1} />
                    </View>
                </View>
                <View style={styles.rightRow}>
                    <Link href="/(tabs)/(messaging)/1" asChild>
                        <IconButton style={styles.btn}>
                            <Ionicons
                                name="chatbubble-outline"
                                size={widthPixel(20)}
                                color={colors.light.tint}
                            />
                        </IconButton>
                    </Link>
                </View>
            </View>
            <View style={styles.map}>
                {/* <LeafletView
                    renderLoading={()=><ActivityIndicator color={colors.light.primary} />}
                    zoom={13}
                    mapCenterPosition={{
                        lat: 5.6037,
                        lng: -0.1870,
                    }}
                /> */}
            </View>
        </ThemedView>
    )
}

export default ContactCard

const styles = StyleSheet.create({
    container: {
        borderRadius: widthPixel(10),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    user: {
        flexDirection: 'row',
        gap: widthPixel(8),
        alignItems: 'center',
    },
    name: {
        fontSize: widthPixel(16),
    },
    rightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
    },
    img: { 
        width: widthPixel(50), 
        height: widthPixel(50),
        borderRadius: widthPixel(25),
    },
    icon: {
        width: widthPixel(30),
        height: widthPixel(30),
    },
    btn: {
        backgroundColor: colors.light.lightTint,
        borderRadius: widthPixel(20),
        padding: widthPixel(10),
    },
    map: {
        height: heightPixel(150),
        marginTop: widthPixel(16),
        borderRadius: widthPixel(10),
        overflow: 'hidden',
    }
})