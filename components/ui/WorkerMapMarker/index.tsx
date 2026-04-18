import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { calculateWorkerCost, formatPrice } from '@/constants/helpers';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { selectUser } from '@/redux/app/selector';
import { Worker } from '@/redux/search/types';
import { useAppSelector } from '@/store/hooks';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface WorkerMapMarkerProps {
    worker: Worker;
    pinColor?: string;
    estimatedDuration?: number;
    onPress?: (id: string) => void;
    displayCost?: boolean;
}

function avatarSource(avatar: string | undefined) {
    if (!avatar) return null;
    if (avatar.startsWith('http') || avatar.startsWith('file')) {
        return { uri: avatar };
    }
    return avatar;
}

/**
 * Flat black & white map pin — theme surfaces, square geometry, no accent fills.
 * `pinColor` is accepted for call-site compatibility but not used (monochrome UI).
 */
export default function WorkerMapMarker({
    worker,
    pinColor: _pinColor,
    estimatedDuration,
    onPress,
    displayCost = true,
}: WorkerMapMarkerProps) {
    const user = useAppSelector(selectUser);
    const currency = user?.settings?.currency || 'GHS';

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

    const muted = useThemeColor(
        {
            light: colors.light.secondary,
            dark: colors.dark.secondary,
        },
        'secondary',
    );

    const divider = useThemeColor(
        {
            light: colors.light.grey,
            dark: colors.dark.grey,
        },
        'grey',
    );

    const workerCost = useMemo(() => {
        if (!displayCost) {
            return 0;
        }
        return calculateWorkerCost(worker, estimatedDuration || 0);
    }, [displayCost, worker, estimatedDuration]);

    const initial = useMemo(() => {
        const n = worker.name?.trim();
        return n ? n.charAt(0).toUpperCase() : '?';
    }, [worker.name]);

    const resolvedAvatar = avatarSource(worker.avatar);

    return (
        <TouchableOpacity onPress={() => onPress?.(worker.id)} style={styles.container} activeOpacity={0.9}>
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
                    {displayCost ? (
                        <>
                            <ThemedText style={[styles.currency, { color: muted }]}>{currency}</ThemedText>
                            <ThemedText style={[styles.price, { color: textColor }]}>{formatPrice(workerCost)}</ThemedText>
                        </>
                    ) : (
                        <>
                            {worker.skills?.[0]?.icon ? (
                                <View style={[styles.skillIconWrap, { borderColor: border }]}>
                                    <Image source={worker.skills[0].icon} style={styles.skillIcon} />
                                </View>
                            ) : null}
                            <ThemedText style={[styles.skillLabel, { color: textColor }]} numberOfLines={1}>
                                {worker.skills?.[0]?.name ?? 'Worker'}
                            </ThemedText>
                        </>
                    )}
                </View>
            </View>
            <View style={[styles.mapFoot, { backgroundColor: border }]} />
        </TouchableOpacity>
    );
}

const AVATAR = widthPixel(32);

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: widthPixel(1.5),
        maxWidth: widthPixel(200),
        // flat — no radius
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
        // paddingVertical: heightPixel(8),
        flexShrink: 1,
    },
    currency: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    price: {
        fontSize: fontPixel(14),
        fontFamily: 'Bold',
        letterSpacing: -0.2,
    },
    skillLabel: {
        fontSize: fontPixel(11),
        fontFamily: 'SemiBold',
        maxWidth: widthPixel(110),
        letterSpacing: 0.2,
    },
    skillIconWrap: {
        width: widthPixel(22),
        height: widthPixel(22),
        borderWidth: widthPixel(1),
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: 'white',
    },
    skillIcon: {
        width: widthPixel(14),
        height: widthPixel(14),
    },
    mapFoot: {
        width: widthPixel(12),
        height: heightPixel(5),
        marginTop: heightPixel(-1),
    },
});
