import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from './app/store.js'
import { Provider } from 'react-redux'
import { HealthProvider } from './context/HealthContext.jsx'
import { GoalsProvider } from './context/GoalsContext.jsx'
import { ConnectionProvider } from './context/ConnectionContext.jsx'

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ConnectionProvider>
      <GoalsProvider>
        <HealthProvider>
          <App />
        </HealthProvider>
      </GoalsProvider>
    </ConnectionProvider>
  </Provider>
)