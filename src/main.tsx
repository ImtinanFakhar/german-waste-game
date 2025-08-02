import React from 'react'
import ReactDOM from 'react-dom/client'
import ProfessionalApp from './ProfessionalApp.tsx'
import './style.css'
import './i18n'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProfessionalApp />
  </React.StrictMode>
)
