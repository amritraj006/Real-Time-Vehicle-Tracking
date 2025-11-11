import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import { ClerkProvider } from '@clerk/clerk-react'
import { AppProvider } from './contexts/AppContext.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <AppProvider>   {/* ✅ Wrap your app here */}
          <App />
        </AppProvider>
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>
)
