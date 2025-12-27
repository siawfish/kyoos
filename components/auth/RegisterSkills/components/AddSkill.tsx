import AmountInput from "@/components/ui/AmountInput";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/TextInput";
import { ThemedText } from "@/components/ui/Themed/ThemedText";
import { fontPixel, heightPixel, widthPixel } from "@/constants/normalize";
import { colors } from "@/constants/theme/colors";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Skill } from "@/redux/app/types";
import { actions } from "@/redux/auth/slice";
import { useAppDispatch } from "@/store/hooks";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { BlurView } from "expo-blur";
import React, { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

interface AddSkillProps {
  skill: Skill;
  onClose: () => void;
  onChange: (skill: Skill) => void;
  onAddSkill?: (skill: Skill) => void;
}

const AddSkill = ({skill, onClose, onChange, onAddSkill}: AddSkillProps) => {
  // Set default values when skill is first set
  useEffect(() => {
    const updatedSkill = {
      ...skill,
      rate: skill.rate || 5,
      yearsOfExperience: skill.yearsOfExperience || 1,
    };
    if (updatedSkill.rate !== skill.rate || updatedSkill.yearsOfExperience !== skill.yearsOfExperience) {
      onChange(updatedSkill);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill.id]);
  const dispatch = useAppDispatch();
  const backgroundColor = useThemeColor(
    {
      light: colors.light.white,
      dark: colors.dark.black,
    },
    "background"
  );
  const handleColor = useThemeColor(
    {
      light: colors.light.secondary,
      dark: colors.dark.secondary,
    },
    "background"
  );
  const inputBackgroundColor = useThemeColor(
    {
      light: colors.light.background,
      dark: colors.dark.background,
    },
    "background"
  );
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Snap to 60% when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (bottomSheetRef.current) {
        bottomSheetRef.current.snapToIndex(0);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [skill.id]);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);
  
  const renderFooter = useCallback(() => {
    const handleAdd = () => {
      onClose();
      if (onAddSkill) {
        onAddSkill(skill);
      } else {
        // Default to Redux action (backward compatibility)
        dispatch(actions.addRegisterFormSkill(skill));
      }
    };

    return (
      <Button
        style={[styles.button]}
        label='Add Skill'
        onPress={handleAdd}
      />
    )
  }, [skill, onClose, onAddSkill, dispatch])

  // renders
  return (
    <>

      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />

      <Portal>
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          onChange={handleSheetChanges}
          footerComponent={renderFooter}
          onClose={onClose}
          enablePanDownToClose={true}
          snapPoints={['60%']}
          enableDynamicSizing={false}
          style={[{ backgroundColor }, styles.container]}
          backgroundStyle={[{ backgroundColor }]}
          handleIndicatorStyle={[{ backgroundColor: handleColor }, styles.handle]}
          handleStyle={[{ backgroundColor: backgroundColor }, styles.handle]}
        >
          <BottomSheetView style={[styles.contentContainer, { backgroundColor }]}>
            <ThemedText
                type='title'
                lightColor={colors.light.text} 
                darkColor={colors.dark.text} 
                style={styles?.title}
            >
                Add A Skill
            </ThemedText>
            <InputField
              label='Skill Name'
              placeholder='Enter the name of the skill'
              style={{ backgroundColor: inputBackgroundColor }}
              value={skill.name}
            />
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.long]}>
                <AmountInput 
                  label='Rate (1/hr)'
                  placeholder='1000'
                  prefix='GHS'
                  initialValue={skill.rate || 5}
                  onChange={(value) => {
                    onChange({...skill, rate: value});
                  }}
                />
              </View>
              <View style={styles.inputContainer}>
                <AmountInput 
                  label='Experience'
                  placeholder='1'
                  initialValue={skill.yearsOfExperience || 1}
                  onChange={(value) => {
                    onChange({...skill, yearsOfExperience: value});
                  }}
                />
              </View>
              </View>
          </BottomSheetView>
        </BottomSheet>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  contentContainer: {
    // flex: 1,
    gap: heightPixel(10),
  },
  handle: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  title: {
    fontSize: fontPixel(24),
    paddingHorizontal: widthPixel(16),
    marginBottom: widthPixel(16),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  inputContainer: {
      flex: 1,
  },
  button: {
    marginTop: 'auto',
    marginBottom: heightPixel(40),
  },
  long: {
    flex: 1,
  },
  textarea: {
      height: heightPixel(100)
  },
});

export default AddSkill;

