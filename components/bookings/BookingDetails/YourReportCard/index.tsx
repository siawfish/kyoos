import { format } from 'date-fns'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useAppTheme } from '@/hooks/use-app-theme'
import { BookingReport } from '@/redux/booking/types'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface YourReportCardProps {
    readonly report?: BookingReport | null
}

const YourReportCard = ({ report }: YourReportCardProps) => {
    const theme = useAppTheme()
    const isDark = theme === 'dark'

    const textColor = isDark ? colors.dark.text : colors.light.text
    const labelColor = isDark ? colors.dark.secondary : colors.light.secondary
    const accentColor = isDark ? colors.dark.white : colors.light.black

    if (!report?.id) {
        return null
    }

    const hasValidDate =
        Boolean(report.createdAt) &&
        !Number.isNaN(new Date(report.createdAt).getTime())

    return (
        <View style={styles.infoCard}>
            <View style={styles.infoRow}>
                <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { color: labelColor }]}>
                        YOUR REPORT
                    </Text>
                    <View style={styles.reasonRow}>
                        <Ionicons
                            name="flag"
                            size={fontPixel(18)}
                            color={colors.light.danger}
                        />
                        <Text style={[styles.reasonText, { color: textColor }]}>
                            {report.reason}
                        </Text>
                    </View>
                </View>
            </View>
            {!!report.comment?.trim() && (
                <>
                    <View
                        style={[styles.infoDivider, { backgroundColor: labelColor }]}
                    />
                    <View
                        style={[
                            styles.commentBox,
                            {
                                backgroundColor: isDark
                                    ? colors.dark.misc
                                    : colors.light.misc,
                                borderLeftColor: accentColor,
                            },
                        ]}
                    >
                        <Text style={[styles.commentQuote, { color: textColor }]}>
                            {report.comment.trim()}
                        </Text>
                    </View>
                </>
            )}
            {hasValidDate && (
                <>
                    <View
                        style={[styles.infoDivider, { backgroundColor: labelColor }]}
                    />
                    <View style={styles.metaRow}>
                        <Ionicons
                            name="time-outline"
                            size={fontPixel(14)}
                            color={labelColor}
                        />
                        <Text style={[styles.metaDate, { color: labelColor }]}>
                            {format(
                                new Date(report.createdAt),
                                "MMM d, yyyy '·' h:mm a"
                            )}
                        </Text>
                    </View>
                </>
            )}
        </View>
    )
}

export default YourReportCard

const styles = StyleSheet.create({
    infoCard: {
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: widthPixel(12),
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
    reasonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: widthPixel(10),
        marginTop: heightPixel(4),
    },
    reasonText: {
        fontSize: fontPixel(16),
        fontFamily: 'SemiBold',
        flex: 1,
    },
    infoDivider: {
        height: 1,
        marginVertical: heightPixel(12),
        opacity: 0.15,
    },
    commentBox: {
        borderLeftWidth: 3,
        paddingVertical: heightPixel(10),
        paddingHorizontal: widthPixel(12),
        marginTop: heightPixel(2),
    },
    commentQuote: {
        fontSize: fontPixel(14),
        fontFamily: 'Regular',
        lineHeight: fontPixel(21),
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(8),
    },
    metaDate: {
        fontSize: fontPixel(12),
        fontFamily: 'Regular',
        flex: 1,
    },
})
