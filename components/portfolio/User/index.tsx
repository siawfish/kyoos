import user from "@/assets/images/individual.png";
import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { formatDistanceToNow, isValid } from 'date-fns';
import React from 'react';
import { Image, ImageStyle, StyleProp, StyleSheet, View } from 'react-native';

interface UserProps {
    name: string;
    avatar: string;
    createdAt?: string;
    imageStyle?: StyleProp<ImageStyle>;
}

const User = ({ name, avatar, createdAt, imageStyle }: UserProps) => {
    const createdDate = createdAt ? new Date(createdAt) : undefined;
    const relativeCreated =
        createdDate && isValid(createdDate)
            ? formatDistanceToNow(createdDate, { addSuffix: true })
            : null;

    return (
        <View style={styles.user}>
            <Image
                source={avatar ? { uri: avatar } : user}
                style={[styles.image, imageStyle]}
            />
            <View>
                <ThemedText 
                    type='title' 
                    style={styles.name}
                >
                    {name}
                </ThemedText>
                {relativeCreated != null && (
                    <ThemedText darkColor={colors.dark.secondary} lightColor={colors.light.secondary} style={styles.createdAt}>
                        {relativeCreated}
                    </ThemedText>
                )}
            </View>
        </View>
    )
};

export default User;

const styles = StyleSheet.create({
    image: { 
        width: widthPixel(40), 
        height: widthPixel(40),
        borderRadius: 0,
    },
    user: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(12),
    },
    name: {
        fontSize: widthPixel(16),
        fontFamily: 'Bold',
        letterSpacing: -0.5,
    },
    createdAt: {
        fontFamily: 'Regular',
        fontSize: widthPixel(12),
        marginTop: widthPixel(2),
    },
});

