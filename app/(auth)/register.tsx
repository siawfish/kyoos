import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import ProfileForm from '@/components/account/ProfileForm';
import { ScreenFooter } from '@/components/layout/ScreenFooter';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import BackButton from '@/components/ui/BackButton';
import { heightPixel, widthPixel } from '@/constants/normalize';
import { Link } from 'expo-router';
import { usePermissionsRequestQueue } from '@/hooks/use-permissions-request-queue';
import { PermissionRequestSheet } from '@/components/ui/PermissionRequestSheet';
import { actions } from '@/redux/auth/slice';
import { actions as appActions } from '@/redux/app/slice';
import * as Location from 'expo-location';
import { selectRegisterForm, selectRegisterFormIsLoading } from '@/redux/auth/selector';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import Button from '@/components/ui/Button';
import { validateBasicInformation } from '@/constants/helpers/validations';
import { useEffect, useCallback } from 'react';
import { StoreName } from '@/redux/app/types';

export default function RegisterScreen() {
    const dispatch = useAppDispatch();
    const registerForm = useAppSelector(selectRegisterForm);
    const isLoading = useAppSelector(selectRegisterFormIsLoading);
    
    const setCurrentLocation = useCallback(async () => {
        try {
            let { coords } = await Location.getCurrentPositionAsync({});
            dispatch(appActions.reverseGeocodeLocation({
                latlng: `${coords.latitude},${coords.longitude}`,
                store: StoreName.REGISTER,
            }));
        } catch (error: any) {
            Toast.show({
              type: 'error',
              text1: 'Error getting location',
              text2: error?.message || 'An error occurred while registering',
            });
        }
    }, [dispatch]);

    const { 
        currentPermission, 
        permissionsQueue, 
        handleOnPermissionDenied, 
        handleOnPermissionGranted,
        locationPermission,
    } = usePermissionsRequestQueue({
        onLocationPermissionGranted: () => {
          setCurrentLocation();
        }
    });

    useEffect(() => {
        if(locationPermission === 'granted') {
            setCurrentLocation();
        }
    }, [locationPermission, setCurrentLocation]);

    const handleSave = () => {
        const errors = validateBasicInformation(registerForm);
        if (errors.length > 0) {
            errors.forEach((error: { key: any; value: string }) => {
              dispatch(actions.setRegisterFormErrors({key: error.key, value: error.value}));
            });
            return;
        }
        dispatch(actions.submitRegisterForm());
    }

    return (
        <ScreenLayout style={styles.container} preset="auth">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[
                    styles.keyboardAvoid,
                ]}
                keyboardVerticalOffset={heightPixel(60)}
            >
                <Link asChild href="/(auth)">
                    <BackButton 
                        containerStyle={styles.backButton}
                        iconName="arrow-left"
                    />
                </Link>
                <View style={styles.formWrap}>
                    <ProfileForm 
                        registerForm={registerForm}
                        onSetFormValues={(key, value) => dispatch(actions.setRegisterFormValue({key, value}))}
                        onSetFormErrors={(key, value) => dispatch(actions.setRegisterFormErrors({key, value}))}
                        onSubmit={() => {}}
                    />
                </View>
                <ScreenFooter hideBorder style={styles.footer}>
                    <Button
                        label="SAVE"
                        isLoading={isLoading}
                        onPress={handleSave}
                        style={styles.button}
                    />
                </ScreenFooter>
            </KeyboardAvoidingView>
            <PermissionRequestSheet
                isOpen={permissionsQueue.length > 0}
                isOpenChange={(isOpen) => {}}
                permissionType={currentPermission}
                onDenied={handleOnPermissionDenied}
                onGranted={handleOnPermissionGranted}
            />
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoid: {
        flex: 1,
    },
    backButton: {
        marginHorizontal: widthPixel(16),
        marginTop: heightPixel(16),
    },
    formWrap: {
        flex: 1,
    },
    footer: {
        paddingHorizontal: widthPixel(16),
    },
    button: {
        marginHorizontal: 0,
    },
});
