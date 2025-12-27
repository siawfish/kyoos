import BackButton from '@/components/ui/BackButton'
import GhanaCardUploader from '@/components/ui/GhanaCardUploader'
import ImageThumbnailUploader from '@/components/ui/ImageThumbnailUploader'
import InputField from '@/components/ui/TextInput'
import { fontPixel, heightPixel, widthPixel } from '@/constants/normalize'
import { colors } from '@/constants/theme/colors'
import { useThemeColor } from '@/hooks/use-theme-color'
import { AssetModule, FormElement } from '@/redux/app/types'
import { selectRegisterFormAvatar, selectRegisterFormGhanaCard } from '@/redux/auth/selector'
import { actions } from '@/redux/auth/slice'
import { GhanaCardForm } from '@/redux/auth/types'
import { RootState } from '@/store'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import React from 'react'
import { ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native'

interface ProofOfIdentifyProps {
    mode?: 'auth' | 'account';
    selectGhanaCard?: (state: RootState) => GhanaCardForm;
    selectAvatar?: (state: RootState) => FormElement;
    onUpdateGhanaCardForm?: (params: {key: keyof GhanaCardForm, value: string}) => void;
    onSetAvatar?: (value: string) => void;
    headerConfig?: {
        stepLabel?: string;
        title: string;
        subtitle: string;
    };
    showBackButton?: boolean;
    onBack?: () => void;
    avatarDisabled?: boolean;
    cardNumberDisabled?: boolean;
    cardUploaderDisabled?: boolean;
    contentBottomPadding?: number;
}
    
export default function ProofOfIdentify({
    mode = 'auth',
    selectGhanaCard: propSelectGhanaCard,
    selectAvatar: propSelectAvatar,
    onUpdateGhanaCardForm: propOnUpdateGhanaCardForm,
    onSetAvatar: propOnSetAvatar,
    headerConfig,
    showBackButton = false,
    onBack,
    avatarDisabled = false,
    cardNumberDisabled = false,
    cardUploaderDisabled = false,
    contentBottomPadding,
}: ProofOfIdentifyProps = {}) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const inputBackground = useThemeColor({light: colors.light.white, dark: colors.dark.black}, 'background');
    const dispatch = useAppDispatch();

    // Always call hooks, then conditionally use the result
    const reduxGhanaCard = useAppSelector(selectRegisterFormGhanaCard);
    const reduxAvatar = useAppSelector(selectRegisterFormAvatar);
    const propGhanaCard = useAppSelector(propSelectGhanaCard || selectRegisterFormGhanaCard);
    const propAvatar = useAppSelector(propSelectAvatar || selectRegisterFormAvatar);
    
    const ghanaCard = propSelectGhanaCard ? propGhanaCard : reduxGhanaCard;
    const avatar = propSelectAvatar ? propAvatar : reduxAvatar;

    const textColor = isDark ? colors.dark.text : colors.light.text;
    const subtitleColor = isDark ? colors.dark.secondary : colors.light.secondary;
    const accentColor = isDark ? colors.dark.white : colors.light.black;

    // Default header config for auth mode
    const defaultHeaderConfig = {
        stepLabel: 'STEP 2',
        title: 'Prove Your\nIdentity',
        subtitle: 'Provide a valid means of identification',
    };

    const finalHeaderConfig = headerConfig || defaultHeaderConfig;

    const handleAvatarChange = (asset: any) => {
        if (propOnSetAvatar) {
            propOnSetAvatar(asset.url);
        } else {
            dispatch(actions.setRegisterFormValue({key: 'avatar', value: asset.url}));
        }
    };

    const handleGhanaCardNumberChange = (text: string) => {
        if (propOnUpdateGhanaCardForm) {
            propOnUpdateGhanaCardForm({key: 'number', value: text});
        } else {
            dispatch(actions.updateGhanaCardForm({key: 'number', value: text}));
        }
    };

    const handleGhanaCardFrontChange = (asset: any) => {
        if (propOnUpdateGhanaCardForm) {
            propOnUpdateGhanaCardForm({key: 'front', value: asset?.url || ''});
            // Also update avatar when front is selected (as per original logic)
            if (asset?.url && propOnSetAvatar) {
                propOnSetAvatar(asset.url);
            } else if (asset?.url) {
                dispatch(actions.setRegisterFormValue({key: 'avatar', value: asset.url}));
            }
        } else {
            dispatch(actions.updateGhanaCardForm({key: 'front', value: asset?.url || ''}));
            if (asset?.url) {
                dispatch(actions.setRegisterFormValue({key: 'avatar', value: asset.url}));
            }
        }
    };

    const handleGhanaCardBackChange = (asset: any) => {
        if (propOnUpdateGhanaCardForm) {
            propOnUpdateGhanaCardForm({key: 'back', value: asset?.url || ''});
        } else {
            dispatch(actions.updateGhanaCardForm({key: 'back', value: asset?.url || ''}));
        }
    };

    return (
        <>
            {showBackButton && onBack && (
                <View style={styles.header}>
                    <BackButton iconName='arrow-left' onPress={onBack} />
                </View>
            )}
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={contentBottomPadding ? { paddingBottom: contentBottomPadding } : undefined}
            >
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
                    <ImageThumbnailUploader 
                        module={AssetModule.PROFILE}
                        onChange={handleAvatarChange}
                        value={avatar.value}
                        error={avatar.error}
                        disabled={avatarDisabled}
                    />
                </View>

                <View style={styles.gap}>
                    <Text style={[styles.sectionTitle, { color: textColor }]}>
                        GHANA CARD DETAILS
                    </Text>
                    <InputField 
                        label='CARD NUMBER'
                        placeholder='Enter your Ghana Card Number'
                        style={{ backgroundColor: inputBackground }}
                        value={ghanaCard.number.value}
                        error={ghanaCard.number.error}
                        editable={!cardNumberDisabled}
                        onChangeText={handleGhanaCardNumberChange}
                    />
                    
                    <GhanaCardUploader 
                        front={ghanaCard.front.value}
                        back={ghanaCard.back.value}
                        frontError={ghanaCard.front.error}
                        backError={ghanaCard.back.error}
                        disabled={cardUploaderDisabled}
                        onChangeFront={handleGhanaCardFrontChange}
                        onChangeBack={handleGhanaCardBackChange}
                    />
                </View>
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(16),
        marginBottom: heightPixel(8),
    },
    contentContainer: {
        paddingHorizontal: widthPixel(20),
        paddingTop: heightPixel(24),
        marginBottom: heightPixel(24),
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
        marginBottom: heightPixel(20),
    },
    gap: {
        flexDirection: 'column',
        gap: heightPixel(16),
    },
    sectionTitle: {
        fontSize: fontPixel(11),
        fontFamily: 'SemiBold',
        letterSpacing: 2,
        paddingHorizontal: widthPixel(20),
        marginBottom: heightPixel(4),
    }
})

