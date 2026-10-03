import { Navigate, Outlet } from 'react-router-dom'
import { useModules } from './ModuleProvider.jsx'

export default function ModuleGuard({ code }) {
  const { loading, hasModule } = useModules()

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">Carregando módulos…</div>
  }

  if (!hasModule(code)) return <Navigate to="/" replace />
  return <Outlet />
}
