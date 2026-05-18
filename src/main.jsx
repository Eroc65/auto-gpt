import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'
import App from './App.jsx'

if (typeof window !== 'undefined' && !window.storage) {
  window.storage = {
    async get(key) {
      return { value: window.localStorage.getItem(key) }
    },
    async set(key, value) {
      window.localStorage.setItem(key, value)
      return { ok: true }
    },
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
