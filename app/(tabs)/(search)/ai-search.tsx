import AISearchFlow from '@/components/home/AISearchFlow';
import { selectAiSearchBookingWorker } from '@/redux/search/selector';
import { actions } from '@/redux/search/slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';

export default function AISearchScreen() {
    const params = useLocalSearchParams<{ mode?: string }>();
    const mode = params.mode === 'booking' ? 'booking' : 'search';
    const bookingWorker = useAppSelector(selectAiSearchBookingWorker);
    const dispatch = useAppDispatch();

    useEffect(() => () => {
        dispatch(actions.setAiSearchBookingWorker(null));
    }, [dispatch]);

    return (
        <AISearchFlow
            mode={mode}
            artisan={mode === 'booking' ? bookingWorker : null}
            onRequestClose={() => {
                if (router.canGoBack()) {
                    router.back();
                } else {
                    router.replace('/(tabs)/(search)');
                }
            }}
        />
    );
}
