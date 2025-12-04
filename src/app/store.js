import { configureStore } from '@reduxjs/toolkit'
import authReducer from './reducers/authSlice'
import connectionReducer from './reducers/connectionSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        connection: connectionReducer
    }
})

export default store