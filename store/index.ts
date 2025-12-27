import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist';
import createSagaMiddleware from 'redux-saga';
import reducers from './reducers';
import rootSaga from './sagas';
import { createLogger } from 'redux-logger'

const sagaMiddleware = createSagaMiddleware()

const persistConfig = {
    key: 'root',
    storage: AsyncStorage
}

const logger = createLogger({
  collapsed: true,
  duration: true,
  timestamp: true,
  logErrors: true,
  diff: true,
  predicate: (_, action) => !action.type.includes('persist/')
});

const rootReducer = combineReducers(reducers);

const persistedReducer = persistReducer(persistConfig, rootReducer);


export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(sagaMiddleware).concat(logger),
})

export const persistor = persistStore(store, null, () => {
    if (__DEV__) {
        console.log('Redux Persist: Rehydration complete');
        console.log('Final State:', store.getState());
    }
});

sagaMiddleware.run(rootSaga)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch