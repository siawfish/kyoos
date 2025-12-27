import BackButton from '@/components/ui/BackButton';
import MultiBottomSheetSelect from '@/components/ui/MultiBottomSheetSelect';
import { heightPixel, widthPixel } from '@/constants/normalize';
import { selectSkills, selectSkillsLoading } from '@/redux/app/selector';
import { actions as appActions } from '@/redux/app/slice';
import { Skill } from '@/redux/app/types';
import { selectRegisterFormSkills } from '@/redux/auth/selector';
import { SkillsForm } from '@/redux/auth/types';
import { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AddSkill from './components/AddSkill';
import SkillsContent from './components/SkillsContent';

interface RegisterSkillsProps {
    mode?: 'auth' | 'account';
    selectSkills?: (state: RootState) => SkillsForm[];
    onAddSkill?: (skill: Skill) => void;
    onRemoveSkill?: (skillId: string) => void;
    headerConfig?: {
        stepLabel?: string;
        title: string;
        subtitle: string;
    };
    showBackButton?: boolean;
    onBack?: () => void;
    contentBottomPadding?: number;
}

const RegisterSkills = ({
    mode = 'auth',
    selectSkills: propSelectSkills,
    onAddSkill: propOnAddSkill,
    onRemoveSkill: propOnRemoveSkill,
    headerConfig,
    showBackButton = false,
    onBack,
    contentBottomPadding,
}: RegisterSkillsProps = {}) => {
    const [addSkill, setAddSkill] = useState(false);
    const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
    const dispatch = useAppDispatch();

    // Use provided selector or default to auth selector (backward compatibility)
    const skillsSelector = propSelectSkills || selectRegisterFormSkills;
    const selectedSkills = useAppSelector(skillsSelector);

    useEffect(() => {
        dispatch(appActions.getSkills());
    }, [dispatch]);

    const skills = useAppSelector(selectSkills);
    const selectedSkillsIds = selectedSkills.map((skill) => skill.id);
    const skillsWithoutSelected = skills.filter((skill) => !selectedSkillsIds.includes(skill.id));
    const skillsLoading = useAppSelector(selectSkillsLoading);

    return (
        <>
            {showBackButton && onBack && (
                <View style={styles.header}>
                    <BackButton iconName='arrow-left' onPress={onBack} />
                </View>
            )}
            <SkillsContent 
                setAddSkill={setAddSkill}
                selectSkills={propSelectSkills}
                onRemoveSkill={propOnRemoveSkill}
                headerConfig={headerConfig}
                contentBottomPadding={contentBottomPadding}
            />
            {currentSkill ? (
                <AddSkill 
                    skill={currentSkill}
                    onClose={() => {
                        setCurrentSkill(null)
                        setAddSkill(false)
                    }} 
                    onChange={(skill) => {
                        setCurrentSkill(skill);
                    }}
                    onAddSkill={propOnAddSkill}
                />
            ) : (
                <MultiBottomSheetSelect
                    isLoading={skillsLoading}
                    title='Choose a skill'
                    options={skillsWithoutSelected.map((skill) => ({label: skill.name, value: skill.id, icon: skill?.icon}))}
                    selectedOptions={[]}
                    closeOnSelect={true}
                    onOptionsChange={(options) => {
                        setAddSkill(false);
                        setCurrentSkill(skills.find((skill) => skill.id === options[0]) || null);
                    }}
                    open={addSkill}
                    handleSheetChanges={(index) => {
                        setAddSkill(index === -1 ? false : true);
                    }}
                />
            )}
        </>
    )
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(16),
        marginBottom: heightPixel(8),
    },
});

export default RegisterSkills;

