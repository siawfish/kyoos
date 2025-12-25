import { StyleSheet } from 'react-native';
import ProfileForm from '@/components/account/ProfileForm';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import { useDispatch, useSelector } from 'react-redux';
import { selectProfileForm, selectProfileFormIsLoading } from '@/redux/settings/selector';
import { actions } from '@/redux/settings/slice';
import { useEffect, useMemo } from 'react';
import { selectUser } from '@/redux/app/selector';

export default function ProfileScreen() {
    const isLoading = useSelector(selectProfileFormIsLoading);
    const profileForm = useSelector(selectProfileForm);
    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    const hasUserChanged = useMemo(() => {
        return user?.name !== profileForm?.name?.value || user?.email !== profileForm?.email?.value || user?.gender !== profileForm?.gender?.value || user?.avatar !== profileForm?.avatar?.value;
    }, [user, profileForm]);

    useEffect(() => {
        if (user) {
            dispatch(actions.setProfileFormValue({key: 'name', value: user.name}));
            dispatch(actions.setProfileFormValue({key: 'email', value: user.email}));
            dispatch(actions.setProfileFormValue({key: 'gender', value: user.gender}));
            dispatch(actions.setProfileFormValue({key: 'avatar', value: user.avatar}));
        }
    }, [user]);

    return (
        <ThemedSafeAreaView 
            style={styles.container}
        >
            <ProfileForm 
                isLoading={isLoading} 
                onSetFormValues={(key, value) => dispatch(actions.setProfileFormValue({key, value}))} 
                onSetFormErrors={(key, value) => dispatch(actions.setProfileFormErrors({key, value}))} 
                onSubmit={() => {
                    if(!hasUserChanged) return;
                    dispatch(actions.submitProfileForm())
                }} 
                registerForm={profileForm} 
                submitOnBlur
            />
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
