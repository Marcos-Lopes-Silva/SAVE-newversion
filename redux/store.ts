import { configureStore } from '@reduxjs/toolkit'
import surveyReducer from './reducers'
import loadingReducer from './reducers/loading';
import surveyIdReducer from './reducers/surveyId';


const store = configureStore({
    reducer: {
        survey: surveyReducer,
        loading: loadingReducer,
        surveyId: surveyIdReducer
    }
})

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;