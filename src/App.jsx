import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout.jsx'
import DashboardPage from './modules/dashboard/DashboardPage.jsx'
import ClientesPage from './modules/clientes/ClientesPage.jsx'
import UsinasPage from './modules/usinas/UsinasPage.jsx'
import UsinaCadastroPage from './modules/usinas/UsinaCadastroPage.jsx'
import PropostasPage from './modules/propostas/PropostasPage.jsx'
import OrdensServicoPage from './modules/ordens-servico/OrdensServicoPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/usinas" element={<UsinasPage />} />
        <Route path="/usinas/cadastro" element={<UsinaCadastroPage />} />
        <Route path="/propostas" element={<PropostasPage />} />
        <Route path="/ordens-servico" element={<OrdensServicoPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
