import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { heightPixel, widthPixel } from '@/constants/normalize'
import comment from "@/assets/images/comment.png";
import like from "@/assets/images/like.png";
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { colors } from '@/constants/theme/colors';

const Actions = () => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.btn}>
                <Image source={like} style={styles.img} />
                <ThemedText style={styles.fontSize} type='subtitle'>
                    1.5k
                </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn}>
                <Image source={comment} style={styles.img} />
                <ThemedText style={styles.fontSize} type='subtitle'>
                    200
                </ThemedText>
            </TouchableOpacity>
        </View>
    )
}

export default Actions

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-end',
        paddingTop: heightPixel(10),
        flexDirection: 'row',
        gap: widthPixel(10),
        marginTop: heightPixel(10),
        borderTopWidth: 0.5,
        borderColor: colors.light.misc,
        paddingHorizontal: widthPixel(10),
    },
    img: {
        width: widthPixel(20),
        height: widthPixel(20),
        objectFit: 'contain',
    },
    btn: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: widthPixel(5),
    },
    fontSize: {
        fontSize: widthPixel(14),
    }
})