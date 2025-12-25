import { StyleSheet, View } from 'react-native'
import React from 'react'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'
import Ionicons from '@expo/vector-icons/Ionicons'
import { Link } from 'expo-router'
import BackButton from '@/components/ui/BackButton'
import Button from '@/components/ui/Button'

const Header = ({
  onReschedule,
}: {
  onReschedule: () => void;
}) => {
    const color = useThemeColor(
      {
        light: colors.light.text,
        dark: colors.dark.text,
      },
      "text"
    );
    const borderColor = useThemeColor(
      {
        light: colors.light.black,
        dark: colors.dark.misc,
      },
      "text"
    );
    return (
        <View style={styles.header}>
            <View style={styles.backButtonContainer}>
              <Link href="../" asChild>
                <BackButton 
                  containerStyle={styles.backButton} 
                  iconName='arrow-left'
                />
              </Link>
              <Button 
                style={{...styles.chatButton, borderColor: borderColor}}
                labelStyle={{color: color}}
                icon={<Ionicons name="calendar" size={18} color={color} />}
                label="Reschedule"
                onPress={onReschedule}
              />
            </View>
        </View>
    )
}

export default Header

const styles = StyleSheet.create({
  backButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    headerSubtitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(4),
    },
    backButton: {
        // alignSelf: "flex-end",
    },
    chatButton: {
        backgroundColor: "transparent",
        borderRadius: 28,
        padding: widthPixel(10),
        borderWidth: 1,
        marginHorizontal: 0,
        height: 40,
        paddingHorizontal: widthPixel(16),
    },
})