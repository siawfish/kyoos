import BackButton from '@/components/ui/BackButton'
import Button from '@/components/ui/Button'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'
import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { StyleSheet, View } from 'react-native'

const Header = ({
  onReschedule,
  onBack
}: {
  onReschedule?: {
    onPress: () => void;
    label: string;
  };
  onBack: () => void;
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
        dark: colors.dark.white,
      },
      "text"
    );
    return (
        <View style={styles.header}>
            <View style={styles.backButtonContainer}>
              <BackButton 
                containerStyle={styles.backButton} 
                iconName='arrow-left'
                onPress={onBack}
              />
              {
                onReschedule && (
                  <Button 
                    style={{...styles.rescheduleButton, borderColor: borderColor}}
                    labelStyle={{...styles.rescheduleLabel, color: color}}
                    icon={<Ionicons name="calendar" size={fontPixel(16)} color={color} />}
                    label={onReschedule.label}
                    onPress={onReschedule.onPress}
                  />
                )
              }
            </View>
        </View>
    )
}

export default Header

const styles = StyleSheet.create({
    header: {
      paddingHorizontal: widthPixel(16),
      paddingBottom: heightPixel(12),
    },
    backButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backButton: {
        // Sharp edges handled by BackButton component
    },
    rescheduleButton: {
        backgroundColor: "transparent",
        borderRadius: 0,
        borderWidth: 1,
        marginHorizontal: 0,
        height: heightPixel(40),
        paddingHorizontal: widthPixel(14),
    },
    rescheduleLabel: {
        fontSize: fontPixel(10),
        fontFamily: 'SemiBold',
        letterSpacing: 1,
    },
})
