import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx'
import { ModuleProvider } from './modules/modules/ModuleProvider.jsx'
import { EmpresaProvider } from './context/EmpresaProvider.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ModuleProvider>
          <EmpresaProvider>
            <App />
          </EmpresaProvider>
        </ModuleProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
