import { StyleSheet } from 'react-native';
import ProfileForm from '@/components/account/ProfileForm';
import { ThemedSafeAreaView } from '@/components/ui/Themed/ThemedSafeAreaView';
import BackButton from '@/components/ui/BackButton';
import { heightPixel, widthPixel } from '@/constants/normalize';
import { Link } from 'expo-router';
import { usePermissionsRequestQueue } from '@/hooks/use-permissions-request-queue';
import { PermissionRequestSheet } from '@/components/ui/PermissionRequestSheet';
import { Location as LocationType } from '@/redux/auth/types';
import { actions } from '@/redux/auth/slice';
import { actions as appActions } from '@/redux/app/slice';
import * as Location from 'expo-location';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectRegisterForm, selectRegisterFormIsLoading } from '@/redux/auth/selector';
import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
    const { 
        currentPermission, 
        permissionsQueue, 
        handleOnPermissionDenied, 
        handleOnPermissionGranted,
    } = usePermissionsRequestQueue({
        onLocationPermissionGranted: () => {
            setCurrentLocation();
        }
    });
    const dispatch = useAppDispatch();
    const registerForm = useAppSelector(selectRegisterForm);
    const isLoading = useAppSelector(selectRegisterFormIsLoading);

    const setCurrentLocation = async () => {
        try {
            let { coords } = await Location.getCurrentPositionAsync({});
            dispatch(appActions.reverseGeocodeLocation({
                latlng: `${coords.latitude},${coords.longitude}`,
                callback: (loc: LocationType) => {
                    dispatch(actions.setLocation(loc));
                }
            }));
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Error getting location',
                text2: error?.message || 'An error occurred while registering',
            });
        }
    }

    return (
        <ThemedSafeAreaView style={styles.container}>
            <Link asChild href="/(auth)/login">
                <BackButton 
                    containerStyle={styles.backButton}
                    iconName="arrow-left"
                />
            </Link>
            <ProfileForm 
                registerForm={registerForm}
                isLoading={isLoading}
                onSetFormValues={(key, value) => dispatch(actions.setRegisterFormValue({key, value}))}
                onSetFormErrors={(key, value) => dispatch(actions.setRegisterFormErrors({key, value}))}
                onSubmit={() => dispatch(actions.submitRegisterForm())}
            />
            <PermissionRequestSheet
                isOpen={permissionsQueue.length > 0}
                isOpenChange={(isOpen) => {}}
                permissionType={currentPermission}
                onDenied={handleOnPermissionDenied}
                onGranted={handleOnPermissionGranted}
            />
        </ThemedSafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        marginHorizontal: widthPixel(16),
        marginTop: heightPixel(16),
    },
    button: {
        marginTop: 'auto',
    },
});
