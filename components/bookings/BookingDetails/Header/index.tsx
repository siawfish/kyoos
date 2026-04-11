import BackButton from '@/components/ui/BackButton'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import React from 'react'
import { StyleSheet, View } from 'react-native'

const Header = ({
  onBack
}: {
  onBack: () => void;
}) => {
    return (
        <View style={styles.header}>
            <View style={styles.backButtonContainer}>
              <BackButton 
                containerStyle={styles.backButton} 
                iconName='arrow-left'
                onPress={onBack}
              />
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
