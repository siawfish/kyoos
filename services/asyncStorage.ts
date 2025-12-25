import AsyncStorage from '@react-native-async-storage/async-storage';

export const setItemToStorage = async (key: string, value: string) => {
    try {
        await AsyncStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.error('Error setting item:', error);
        return false;
    }
};

export const getItemFromStorage = async (key: string) => {
    try {
        const value = await AsyncStorage.getItem(key);
        return value;
    } catch (error) {
        console.error('Error getting item:', error);
        return null;
    }
};

export const removeItemFromStorage = async (key: string) => {
    try {
        await AsyncStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing item:', error);
        return false;
    }
};

