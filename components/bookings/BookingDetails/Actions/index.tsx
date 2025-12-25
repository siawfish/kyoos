import { StyleSheet } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/ui/Themed/ThemedView'
import Button from '@/components/ui/Button'
import { Ionicons } from "@expo/vector-icons";
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';


interface ActionsProps {
    readonly onCancel?: () => void;
    readonly onReschedule?: () => void;   
}

const Actions = ({
    onCancel,
}:ActionsProps) => {

  return (
    <ThemedView style={styles.action}>
      <Button 
        onPress={onCancel}
        label="Cancel Booking"
        icon={<Ionicons name="close" size={fontPixel(20)} color={colors.light.white} />}  
        style={styles.cancelBtn}
        labelStyle={styles.cancelLabel}
      />
    </ThemedView>
  )
}

export default Actions

const styles = StyleSheet.create({
    action: {
      marginTop: 'auto',
      paddingBottom: heightPixel(20),
      paddingHorizontal: widthPixel(16),
    },
    cancelBtn: {
      marginHorizontal: 0,
      backgroundColor: colors.light.danger,
    },
    cancelLabel: {
      color: colors.light.white,
    },
})