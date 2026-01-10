import { Share } from 'react-native';

export const useSharing = () => {
    const share = async (url: string) => {
        if (!url) {
            console.error('Cannot share: URL is empty');
            return;
        }

        try {
            const result = await Share.share({
                message: url,
            });
            
            if (result.action === Share.sharedAction) {
                console.log('Content shared successfully');
            } else if (result.action === Share.dismissedAction) {
                console.log('Share dismissed');
            }
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };
    return { share };
};