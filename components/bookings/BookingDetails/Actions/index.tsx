import Button from '@/components/ui/Button';
import { fontPixel, heightPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { StyleSheet, View } from 'react-native';


interface ActionsProps {
    readonly onCancel?: () => void;
    readonly onReschedule?: () => void;   
}

const Actions = ({
    onCancel,
}:ActionsProps) => {

  return (
    <View style={styles.action}>
      <Button 
        onPress={onCancel}
        label="CANCEL BOOKING"
        icon={<Ionicons name="close" size={fontPixel(16)} color={colors.light.white} />}  
        style={styles.cancelBtn}
        labelStyle={styles.cancelLabel}
      />
    </View>
  )
}

export default Actions

const styles = StyleSheet.create({
    action: {
    },
    cancelBtn: {
      marginHorizontal: 0,
      backgroundColor: colors.light.danger,
      borderRadius: 0,
    },
    cancelLabel: {
      color: colors.light.white,
      fontSize: fontPixel(12),
      fontFamily: 'SemiBold',
      letterSpacing: 1.5,
    },
})
