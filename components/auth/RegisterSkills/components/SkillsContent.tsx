import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize';
import { colors } from '@/constants/theme/colors';
import { selectRegisterFormSkills } from '@/redux/auth/selector';
import { actions } from '@/redux/auth/slice';
import { SkillsForm } from '@/redux/auth/types';
import { RootState } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { FlashList } from '@shopify/flash-list';
import React, { useCallback } from 'react';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import AddSkillPill from './AddSKillPill';
import SkillPill from './SkillPill';

interface SkillsContentProps {
    setAddSkill: (value: boolean) => void;
    selectSkills?: (state: RootState) => SkillsForm[];
    onRemoveSkill?: (skillId: string) => void;
    headerConfig?: {
        stepLabel?: string;
        title: string;
        subtitle: string;
    };
    contentBottomPadding?: number;
}

const SkillsContent = ({ 
    setAddSkill, 
    selectSkills: propSelectSkills,
    onRemoveSkill,
    headerConfig,
    contentBottomPadding,
}: SkillsContentProps) => {
    const reduxSelectedSkills = useAppSelector(selectRegisterFormSkills);
    // Always call the hook, but only use it if propSelectSkills is provided
    const propSelectedSkills = useAppSelector(propSelectSkills || selectRegisterFormSkills);
    const dispatch = useAppDispatch();
    const selectedSkills = propSelectSkills ? propSelectedSkills : reduxSelectedSkills;
    
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const textColor = isDark ? colors.dark.text : colors.light.text;
    const subtitleColor = isDark ? colors.dark.secondary : colors.light.secondary;
    const accentColor = isDark ? colors.dark.white : colors.light.black;

    // Default header config
    const defaultHeaderConfig = {
        stepLabel: 'STEP 3',
        title: 'Register\nYour Skills',
        subtitle: 'Add your skills to your profile',
    };

    const finalHeaderConfig = headerConfig || defaultHeaderConfig;

    const renderItem = useCallback(({ item }: { item: typeof selectedSkills[0] }) => {
        const handleRemove = () => {
            if (onRemoveSkill) {
                onRemoveSkill(item.id);
            } else {
                // Default to Redux action (backward compatibility)
                dispatch(actions.removeRegisterFormSkill(item.id));
            }
        };

        return (
            <SkillPill 
                skill={item.name.value} 
                rate={`GHS ${item.rate.value}/hr`}
                icon={item.icon}
                onRemove={handleRemove} 
            />
        );
    }, [onRemoveSkill, dispatch]);

    const renderHeader = useCallback(() => {
        return (
            <View style={styles.contentContainer}>
                <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                {finalHeaderConfig.stepLabel && (
                    <Text style={[styles.label, { color: subtitleColor }]}>
                        {finalHeaderConfig.stepLabel}
                    </Text>
                )}
                <Text style={[styles.title, { color: textColor }]}>
                    {finalHeaderConfig.title}
                </Text>
                <Text style={[styles.subtitle, { color: subtitleColor }]}>
                    {finalHeaderConfig.subtitle}
                </Text>
            </View>
        );
    }, [accentColor, subtitleColor, textColor, finalHeaderConfig]);

    const renderFooter = useCallback(() => {
        return (
            <View style={styles.footerContainer}>
                <AddSkillPill onPress={() => setAddSkill(true)} />
            </View>
        );
    }, [setAddSkill]);

    const renderSeparator = useCallback(() => {
        return <View style={styles.separator} />;
    }, []);

    return (
        <FlashList
            data={selectedSkills}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            ItemSeparatorComponent={renderSeparator}
            contentContainerStyle={[
                styles.listContent,
                contentBottomPadding ? { paddingBottom: contentBottomPadding } : undefined
            ]}
        />
    )
};

export default SkillsContent;

const styles = StyleSheet.create({
    contentContainer: {
        marginBottom: heightPixel(24),
        marginTop: heightPixel(8),
    },
    accentBar: {
        width: widthPixel(40),
        height: heightPixel(4),
        marginBottom: heightPixel(20),
    },
    label: {
        fontSize: fontPixel(11),
        fontFamily: 'SemiBold',
        letterSpacing: 2,
        marginBottom: heightPixel(8),
    },
    title: {
        fontSize: fontPixel(32),
        fontFamily: 'Bold',
        lineHeight: fontPixel(38),
        letterSpacing: -1,
        marginBottom: heightPixel(12),
    },
    subtitle: {
        fontSize: fontPixel(15),
        fontFamily: 'Regular',
        lineHeight: fontPixel(22),
    },
    listContent: {
        paddingTop: heightPixel(16),
        paddingHorizontal: widthPixel(20),
    },
    separator: {
        height: heightPixel(12),
    },
    footerContainer: {
        marginTop: heightPixel(12),
    },
})

