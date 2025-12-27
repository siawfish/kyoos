import { reducer as appReducer } from '@/redux/app/slice';
import { reducer as authReducer } from '@/redux/auth/slice';
import { reducer as searchReducer } from '@/redux/search/slice';
import { reducer as bookingReducer } from '@/redux/booking/slice';
import { reducer as settingsReducer } from '@/redux/settings/slice';
import { reducer as portfolioReducer } from '@/redux/portfolio/slice';
import { reducer as messagingReducer } from '@/redux/messaging/slice';

const reducers = {
  app: appReducer,
  auth: authReducer,
  search: searchReducer,
  booking: bookingReducer,
  settings: settingsReducer,
  portfolio: portfolioReducer,  
  messaging: messagingReducer,
};

export default reducers;