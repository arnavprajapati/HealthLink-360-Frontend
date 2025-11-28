import { configureStore } from '@reduxjs/toolkit'
import authReducer from './reducers/authSlice'
import healthLogReducer from './reducers/healthLogSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        healthLog: healthLogReducer
    }
})
export default store