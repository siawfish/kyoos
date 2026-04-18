import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectUser } from '@/redux/app/selector';
import { useAppSelector } from '@/store/hooks';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

type UserMapLocationMarkerProps = {
    latitude: number;
    longitude: number;
};

function avatarSource(avatar: string | undefined) {
    if (!avatar) return null;
    if (avatar.startsWith('http') || avatar.startsWith('file')) {
        return { uri: avatar };
    }
    return avatar;
}

/**
 * Current-user pin — layout and styles match {@link WorkerMapMarker} (flat B&W card + mapFoot).
 */
export default function UserMapLocationMarker({ latitude, longitude }: UserMapLocationMarkerProps) {
    const user = useAppSelector(selectUser);

    const surface = useThemeColor(
        {
            light: colors.light.white,
            dark: colors.dark.background,
        },
        'background',
    );

    const border = useThemeColor(
        {
            light: colors.light.black,
            dark: colors.dark.white,
        },
        'text',
    );

    const textColor = useThemeColor(
        {
            light: colors.light.text,
            dark: colors.dark.text,
        },
        'text',
    );

    const divider = useThemeColor(
        {
            light: colors.light.grey,
            dark: colors.dark.grey,
        },
        'grey',
    );

    const resolvedAvatar = avatarSource(user?.avatar);
    const initial = useMemo(() => {
        const n = user?.name?.trim();
        return n ? n.charAt(0).toUpperCase() : '?';
    }, [user?.name]);

    return (
        <Marker
            coordinate={{ latitude, longitude }}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={false}
            zIndex={1000}
        >
            <View style={styles.container} pointerEvents="none">
                <View style={[styles.bubble, { backgroundColor: surface, borderColor: border }]}>
                    <View style={[styles.avatarCell, { borderRightColor: divider }]}>
                        {resolvedAvatar ? (
                            <Image source={resolvedAvatar} style={styles.avatarImg} />
                        ) : (
                            <View style={[styles.avatarFallback, { backgroundColor: surface }]}>
                                <ThemedText style={[styles.avatarInitial, { color: textColor }]}>{initial}</ThemedText>
                            </View>
                        )}
                    </View>
                    <View style={styles.bubbleBody}>
                        <ThemedText style={[styles.meLabel, { color: textColor }]} numberOfLines={1}>
                            Me
                        </ThemedText>
                    </View>
                </View>
                <View style={[styles.mapFoot, { backgroundColor: border }]} />
            </View>
        </Marker>
    );
}

/** Same as WorkerMapMarker */
const AVATAR = widthPixel(32);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    bubble: {
        flexDirection: 'row',
        alignItems: 'stretch',
        borderWidth: widthPixel(1.5),
        maxWidth: widthPixel(200),
        borderRadius: 0,
    },
    avatarCell: {
        width: AVATAR,
        height: AVATAR,
        borderRightWidth: widthPixel(1),
        overflow: 'hidden',
    },
    avatarImg: {
        width: AVATAR,
        height: AVATAR,
    },
    avatarFallback: {
        width: AVATAR,
        height: AVATAR,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: fontPixel(14),
        fontFamily: 'Bold',
    },
    bubbleBody: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(6),
        paddingHorizontal: widthPixel(10),
        paddingVertical: heightPixel(8),
        flexShrink: 1,
    },
    /** Matches worker skillLabel / single-line secondary label sizing */
    meLabel: {
        fontSize: fontPixel(11),
        fontFamily: 'SemiBold',
        maxWidth: widthPixel(110),
        letterSpacing: 0.2,
    },
    mapFoot: {
        width: widthPixel(12),
        height: heightPixel(5),
        marginTop: heightPixel(-1),
    },
});
