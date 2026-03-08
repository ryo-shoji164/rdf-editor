import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initializeDomains } from './store/initDomains'
import './lib/i18n/i18n'

// Register built-in domains and load default content
initializeDomains()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
