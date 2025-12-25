import { ScrollView, StyleSheet, Image, View } from 'react-native'
import React from 'react'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { ThemedText } from '@/components/ui/Themed/ThemedText'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'
import Status from './Status'
import Thumbnails from '@/components/ui/Thumbnails'
import ContactCard from './ContactCard'
import { BookingStatuses, Media, MediaType } from '@/redux/app/types'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

const IMAGES:Media[] = [
    {
        uri: 'https://plus.unsplash.com/premium_photo-1723200799223-0095f042decb?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        type: MediaType.IMAGE,
        id: '1',
    },
    {
        uri: 'https://plus.unsplash.com/premium_photo-1723200799223-0095f042decb?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        type: MediaType.IMAGE,
        id: '2',
    },
    {
        uri: 'https://plus.unsplash.com/premium_photo-1723200799223-0095f042decb?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        type: MediaType.IMAGE,
        id: '3',
    },
    {
        uri: 'https://plus.unsplash.com/premium_photo-1723200799223-0095f042decb?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        type: MediaType.IMAGE,
        id: '4',
    },
    {
        uri: 'https://plus.unsplash.com/premium_photo-1723200799223-0095f042decb?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        type: MediaType.IMAGE,
        id: '5',
    },
]

const BookingDetails = () => {
    const labelColor = useThemeColor(
        {
          light: colors.light.secondary,
          dark: colors.dark.secondary,
        },
        "text"
    );
    const color = useThemeColor(
      {
        light: colors.light.text,
        dark: colors.dark.text,
      },
      "text"
    );
    return (
        <ScrollView 
            contentContainerStyle={styles.mainContainer}
            showsVerticalScrollIndicator={false}
        >

            <View style={styles.headerLeft}>
              <View>
                  <ThemedText type="title" style={styles.headerTitle}>Cleaning Appointment</ThemedText>
                  <View style={styles.headerSubtitle}>
                      <ThemedText 
                          type="defaultSemiBold" 
                          lightColor={colors.light.secondary}
                          darkColor={colors.dark.secondary}
                      >
                          with 
                      </ThemedText>
                      <Image 
                          source={require('@/assets/images/individual.png')} 
                          style={styles.avatar}
                      />
                      <ThemedText 
                          type="defaultSemiBold"
                          lightColor={colors.light.tint}
                          darkColor={colors.dark.tint}
                      >
                          John Smith
                      </ThemedText>
                  </View>
                </View>

                {/* Date and Time */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar" size={fontPixel(20)} color={color} /> 
                        <ThemedText darkColor={colors.dark.secondary} lightColor={colors.light.secondary} type="subtitle">
                            Today {' '}
                            <ThemedText style={styles.subtitle} type="title" darkColor={colors.dark.text} lightColor={colors.light.text}>12:00 PM</ThemedText>{' '}
                        </ThemedText>
                    </View>

                    {/* Duration */}
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={fontPixel(20)} color={color} />
                        <ThemedText darkColor={colors.dark.secondary} lightColor={colors.light.secondary} type="subtitle">
                            Duration: {' '}
                            <ThemedText style={styles.subtitle} type="title" darkColor={colors.dark.text} lightColor={colors.light.text}>2 hours</ThemedText>
                        </ThemedText>
                    </View>

                    {/* Required Tools */}
                    <View style={styles.infoRow}>
                        <MaterialCommunityIcons name="tools" size={fontPixel(20)} color={color} />
                        <ThemedText darkColor={colors.dark.secondary} lightColor={colors.light.secondary} type="subtitle">
                            Tools: {' '}
                            <ThemedText style={styles.subtitle} type="title" darkColor={colors.dark.text} lightColor={colors.light.text}>Vacuum, Mop, Cleaning supplies</ThemedText>
                        </ThemedText>
                    </View>
                </View>
            </View>
            <View style={styles.row}>
                <Status status={BookingStatuses.ONGOING} />
                <View>
                    <ThemedText style={[styles.label, { color:labelColor}]}>Estimated Fees: <ThemedText type='defaultSemiBold'>GHS 2.00</ThemedText></ThemedText>
                </View>
            </View>
            <View>
                <ThemedText>
                    Excepteur Lorem sunt mollit aliquip. Et consequat consequat ad in minim amet minim aliqua. Amet do voluptate proident tempor aute veniam ullamco. Voluptate dolore commodo in velit officia excepteur Lorem cupidatat ut sit quis occaecat exercitation anim. Est dolore commodo dolore duis sit aliqua nostrud elit sunt labore eu ex. Aliqua fugiat qui aliqua pariatur sunt.
                </ThemedText>
                <Thumbnails data={IMAGES} />
            </View>
            <ContactCard />
        </ScrollView>
    )
}

export default BookingDetails

const styles = StyleSheet.create({
    mainContainer: {
        paddingHorizontal: widthPixel(16),
        gap: heightPixel(20),
        paddingBottom: heightPixel(40),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerSubtitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(4),
    },
    label: {
        fontSize: fontPixel(14),
    },
    headerTitle: {
      fontSize: fontPixel(24),
      marginBottom: heightPixel(8),
    },
    avatar: {
        width: widthPixel(20),
        height: widthPixel(20),
        borderRadius: widthPixel(10),
    },
    headerLeft: {
        gap: widthPixel(16),
        flexDirection: 'column',
    },
    infoContainer: {
        gap: heightPixel(8),
    },
    infoRow: {
        flexDirection: "row",
        gap: widthPixel(8),
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: widthPixel(16),
        paddingBottom: heightPixel(16),
        paddingTop: heightPixel(16),
        gap: heightPixel(16),
    },
    title: {
        fontSize: fontPixel(24) 
    },
    subtitle: {
        fontSize: fontPixel(16),
        color: colors.dark.secondary,
    }
});