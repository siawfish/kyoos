import { format } from 'date-fns'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useAppTheme } from '@/hooks/use-app-theme'
import { BookingRating } from '@/redux/booking/types'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Rating from '../Rating'

interface YourRatingCardProps {
    readonly rating?: BookingRating | null
}

const YourRatingCard = ({ rating }: YourRatingCardProps) => {
    const theme = useAppTheme()
    const isDark = theme === 'dark'

    const textColor = isDark ? colors.dark.text : colors.light.text
    const labelColor = isDark ? colors.dark.secondary : colors.light.secondary
    const accentColor = isDark ? colors.dark.white : colors.light.black

    if (!rating?.id) {
        return null
    }

    const hasValidDate =
        Boolean(rating.createdAt) &&
        !Number.isNaN(new Date(rating.createdAt).getTime())

    return (
        <View style={[styles.infoCard]}>
            <View style={styles.infoRow}>
                <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: labelColor }]}>
                        YOUR RATING
                    </Text>
                    <View style={styles.ratingStarsRow}>
                        <Rating rating={rating.rating} size={fontPixel(22)} />
                        <Text style={[styles.ratingScore, { color: textColor }]}>
                            {rating.rating}
                            <Text style={[styles.ratingScoreMax, { color: labelColor }]}>
                                {' '}
                                / 5
                            </Text>
                        </Text>
                    </View>
                </View>
            </View>
            {!!rating.comment?.trim() && (
                <>
                    <View
                        style={[styles.infoDivider, { backgroundColor: labelColor }]}
                    />
                    <View
                        style={[
                            styles.ratingCommentBox,
                            {
                                backgroundColor: isDark
                                    ? colors.dark.misc
                                    : colors.light.misc,
                                borderLeftColor: accentColor,
                            },
                        ]}
                    >
                        <Text style={[styles.ratingCommentQuote, { color: textColor }]}>
                            {rating.comment.trim()}
                        </Text>
                    </View>
                </>
            )}
            {hasValidDate && (
                <>
                    <View
                        style={[styles.infoDivider, { backgroundColor: labelColor }]}
                    />
                    <View style={styles.ratingMetaRow}>
                        <Ionicons
                            name="time-outline"
                            size={fontPixel(14)}
                            color={labelColor}
                        />
                        <Text style={[styles.ratingDate, { color: labelColor }]}>
                            {format(
                                new Date(rating.createdAt),
                                "MMM d, yyyy '·' h:mm a"
                            )}
                        </Text>
                    </View>
                </>
            )}
        </View>
    )
}

export default YourRatingCard

const styles = StyleSheet.create({
    infoCard: {
        overflow: 'hidden',
    },
    infoAccent: {
        height: heightPixel(3),
        width: '100%',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: widthPixel(12),
    },
    infoIconContainer: {
        width: widthPixel(24),
        alignItems: 'center',
        paddingTop: heightPixel(2),
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: fontPixel(9),
        fontFamily: 'SemiBold',
        letterSpacing: 1.2,
        marginBottom: heightPixel(2),
    },
    infoDivider: {
        height: 1,
        marginVertical: heightPixel(12),
        opacity: 0.15,
    },
    ratingStarsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: widthPixel(12),
        marginTop: heightPixel(4),
    },
    ratingScore: {
        fontSize: fontPixel(18),
        fontFamily: 'Bold',
        letterSpacing: -0.3,
    },
    ratingScoreMax: {
        fontSize: fontPixel(14),
        fontFamily: 'Medium',
    },
    ratingCommentBox: {
        borderLeftWidth: 3,
        paddingVertical: heightPixel(10),
        paddingHorizontal: widthPixel(12),
        marginTop: heightPixel(2),
    },
    ratingCommentQuote: {
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
        lineHeight: fontPixel(21),
    },
    ratingMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
    },
    ratingDate: {
        fontSize: fontPixel(12),
        fontFamily: 'Regular',
        flex: 1,
    },
})
