import { StyleSheet, View } from 'react-native';
import ProfileForm from '@/components/account/ProfileForm';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectProfileForm, selectProfileFormIsLoading } from '@/redux/settings/selector';
import { actions } from '@/redux/settings/slice';
import { useEffect, useMemo } from 'react';
import { selectUser } from '@/redux/app/selector';
import BackButton from '@/components/ui/BackButton';
import { router } from 'expo-router';
import { heightPixel, widthPixel } from '@/constants/normalize';
import Button from '@/components/ui/Button';

export default function ProfileScreen() {
    const isLoading = useAppSelector(selectProfileFormIsLoading);
    const formValues = useAppSelector(selectProfileForm);
    const user = useAppSelector(selectUser);
    const dispatch = useAppDispatch();

    const hasUserChanged = useMemo(() => {
        return user?.name !== formValues?.name?.value || user?.email !== formValues?.email?.value || user?.gender !== formValues?.gender?.value || user?.avatar !== formValues?.avatar?.value;
    }, [user, formValues]);

    useEffect(() => {
        if (user) {
            dispatch(actions.setProfileFormValue({key: 'name', value: user.name}));
            dispatch(actions.setProfileFormValue({key: 'email', value: user.email}));
            dispatch(actions.setProfileFormValue({key: 'gender', value: user.gender}));
            dispatch(actions.setProfileFormValue({key: 'avatar', value: user.avatar}));
        }
    }, [user, dispatch]);

    const handleSave = () => {
        if(!hasUserChanged) return;
        dispatch(actions.submitProfileForm())
    }

    return (
        <ThemedSafeAreaView 
            style={styles.container}
        >
            <BackButton
                containerStyle={styles.backButton}
                iconName="arrow-left"
                onPress={() => router.back()}
            />
            <ProfileForm 
                onSetFormValues={(key, value) => dispatch(actions.setProfileFormValue({key, value}))} 
                onSetFormErrors={(key, value) => dispatch(actions.setProfileFormErrors({key, value}))} 
                onSubmit={() => {
                    if(!hasUserChanged) return;
                    dispatch(actions.submitProfileForm())
                }} 
                registerForm={formValues} 
                submitOnBlur
            />
            <View style={styles.footer}>
                <Button
                    label="SAVE"
                    isLoading={isLoading}
                    onPress={handleSave}
                    style={styles.button}
                />
            </View>
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        marginHorizontal: widthPixel(16),
        // marginTop: heightPixel(16),
    },
    footer: {
        paddingHorizontal: widthPixel(16),
        paddingBottom: heightPixel(20),
    },
    button: {
        marginHorizontal: 0,
    },
});
