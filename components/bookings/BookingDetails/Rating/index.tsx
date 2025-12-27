import { heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { AntDesign } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, View } from 'react-native'

interface RatingProps {
    rating?: number;
}

const Rating = ({
    rating=0
}: RatingProps) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((_, index) => {
        return (    
            <View key={_}>
                {index < rating ? (
                    <AntDesign 
                        name='star' 
                        size={15} 
                        color={colors.light.green}
                    />
                ) : (
                    <AntDesign 
                        name='star' 
                        size={15} 
                        color={colors.light.grey}
                    />
                )}
            </View>
        )
      })}
    </View>
  )
}

export default Rating

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: widthPixel(1),
        paddingVertical: heightPixel(5),
    },
})
