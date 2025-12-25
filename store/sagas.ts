/**
 *  Redux saga class init
 * Import every feature saga here
 *
 */
import { appSaga } from '@/redux/app/saga';
import { authSaga } from '@/redux/auth/saga';
import { all } from 'redux-saga/effects';
import { searchSaga } from '@/redux/search/saga';
import { bookingSaga } from '@/redux/booking/saga';
import { settingsSaga } from '@/redux/settings/saga';

// export default [loginSaga];

export default function* rootSaga() {
  yield all([
    appSaga(),
    authSaga(),
    searchSaga(),
    bookingSaga(),
    settingsSaga(),
  ]);
}
