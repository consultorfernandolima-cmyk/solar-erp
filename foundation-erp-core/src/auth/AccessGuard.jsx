import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthProvider.jsx'

export default function AccessGuard({ allowMaster = true, allowCompanyAdmin = true }) {
  const { profile, isCompanyAdmin, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Validando acesso…</div>
  }

  const allowed = (allowMaster && profile?.is_master === true) || (allowCompanyAdmin && isCompanyAdmin === true)
  return allowed ? <Outlet /> : <Navigate to="/" replace />
}
