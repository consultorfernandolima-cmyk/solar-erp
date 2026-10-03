import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import AccessGuard from './auth/AccessGuard.jsx'
import AppLayout from './layout/AppLayout.jsx'
import DashboardPage from './modules/dashboard/DashboardPage.jsx'
import ClientesPage from './modules/clientes/ClientesPage.jsx'
import ProdutosPage from './modules/produtos/ProdutosPage.jsx'
import UsinasPage from './modules/usinas/UsinasPage.jsx'
import UsinaCadastroPage from './modules/usinas/UsinaCadastroPage.jsx'
import PropostasPage from './modules/propostas/PropostasPage.jsx'
import ContratosPage from './modules/contratos/ContratosPage.jsx'
import FaturamentoPage from './modules/faturamento/FaturamentoPage.jsx'
import OrdensServicoPage from './modules/ordens-servico/OrdensServicoPage.jsx'
import OrdemServicoCadastroPage from './modules/ordens-servico/OrdemServicoCadastroPage.jsx'
import LoginPage from './modules/auth/LoginPage.jsx'
import ForgotPassword from './modules/auth/ForgotPassword.jsx'
import ResetPassword from './modules/auth/ResetPassword.jsx'
import EmpresasPage from './modules/empresas/EmpresasPage.jsx'
import UsuariosEmpresasPage from './modules/empresas/UsuariosEmpresasPage.jsx'
import ModuleGuard from './modules/modules/ModuleGuard.jsx'
import ModulePage from './modules/modules/ModulePage.jsx'
import RbacPage from './modules/rbac/RbacPage.jsx'

export default function App() {
  return <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route element={<ProtectedRoute />}><Route element={<AppLayout />}>
      <Route path="/" element={<DashboardPage />} />
      <Route element={<AccessGuard allowMaster allowCompanyAdmin={false} />}><Route path="/empresas" element={<EmpresasPage />} /></Route>
      <Route element={<AccessGuard allowMaster allowCompanyAdmin />}><Route path="/usuarios-empresas" element={<UsuariosEmpresasPage />} /></Route>
      <Route element={<AccessGuard allowMaster allowCompanyAdmin />}><Route path="/controle-acesso" element={<RbacPage />} /></Route>
      <Route element={<ModuleGuard code="CORE" />}>
        <Route path="/clientes" element={<ClientesPage />} /><Route path="/produtos" element={<ProdutosPage />} />
      </Route>
      <Route element={<ModuleGuard code="COMERCIO" />}>
        <Route path="/comercio" element={<ModulePage code="COMERCIO" />} />
      </Route>
      <Route element={<ModuleGuard code="SERVICOS" />}>
        <Route path="/servicos" element={<ModulePage code="SERVICOS" />} />
        <Route path="/ordens-servico" element={<OrdensServicoPage />} /><Route path="/ordens-servico/cadastro" element={<OrdemServicoCadastroPage />} />
        <Route element={<ModuleGuard code="PROPOSTAS" />}><Route path="/propostas" element={<PropostasPage />} /></Route>
        <Route element={<ModuleGuard code="CONTRATOS" />}><Route path="/contratos" element={<ContratosPage />} /></Route>
      </Route>
      <Route element={<ModuleGuard code="UFV" />}><Route path="/ufv" element={<ModulePage code="UFV" />} /><Route path="/usinas" element={<UsinasPage />} /><Route path="/usinas/cadastro" element={<UsinaCadastroPage />} /></Route>
      <Route element={<ModuleGuard code="FATURAMENTO" />}><Route path="/faturamento" element={<FaturamentoPage />} /></Route>
    </Route></Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
