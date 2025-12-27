import { ThemedText } from '@/components/ui/Themed/ThemedText';
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { useThemeColor } from '@/hooks/use-theme-color';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface AddSkillPillProps {
    onPress: () => void;
}

const AddSkillPill = ({ onPress }: AddSkillPillProps) => {
    const addBackgroundColor = useThemeColor({ light: colors.light.tint, dark: colors.dark.tint }, 'tint');
    const iconColor = useThemeColor({ light: colors.light.white, dark: colors.dark.black }, 'text');
    
    return (
        <TouchableOpacity 
            onPress={onPress} 
            style={[styles.add, { backgroundColor: addBackgroundColor }]}
        >
            <ThemedText
                style={styles.addText}
                type='defaultSemiBold'
                lightColor={colors.light.white}
                darkColor={colors.dark.black}
            >
                Add Skill
            </ThemedText>
            <MaterialIcons name="add" size={20} color={iconColor} />
        </TouchableOpacity>
    )
}

export default AddSkillPill;

const styles = StyleSheet.create({
    addText: {
        fontSize: fontPixel(16),
    },
    add: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: heightPixel(12),
        paddingHorizontal: widthPixel(16),
        borderRadius: 0,
        minHeight: heightPixel(48),
        width: '100%',
        gap: widthPixel(8),
    }
})

