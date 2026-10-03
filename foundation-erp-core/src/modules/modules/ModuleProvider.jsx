import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../auth/AuthProvider.jsx'

const ModuleContext = createContext(null)

function isModuleActive(item) {
  const now = new Date()
  const start = item.inicio_em ? new Date(item.inicio_em + 'T00:00:00') : null
  const end = item.fim_em ? new Date(item.fim_em + 'T23:59:59') : null
  return item.status === 'ATIVO' && item.modulo?.ativo && item.modulo?.status !== 'INATIVO' && (!start || now >= start) && (!end || now <= end)
}

export function ModuleProvider({ children }) {
  const { profile, loading: authLoading } = useAuth()
  const [modules, setModules] = useState([])
  const [hasCompanyAccess, setHasCompanyAccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const loadModules = async () => {
      if (authLoading) return
      if (!profile?.organizacao_id) {
        if (mounted) {
          setModules([])
          setHasCompanyAccess(false)
          setLoading(false)
        }
        return
      }

      setLoading(true)
      setError(null)

      const { data: accessRows, error: accessError } = await supabase
        .from('usuario_empresas')
        .select('empresa_id')
        .eq('usuario_id', profile.id)

      if (accessError) {
        if (mounted) {
          setError(accessError)
          setModules([])
          setHasCompanyAccess(false)
          setLoading(false)
        }
        return
      }

      // Master is organization-wide and does not require a usuario_empresas
      // row. Operational users remain company-scoped through that relation.
      const operationalAccess = profile.is_master === true || (accessRows ?? []).length > 0
      setHasCompanyAccess(operationalAccess)
      if (!operationalAccess) {
        setModules([])
        setLoading(false)
        return
      }

      const { data, error: queryError } = await supabase
        .from('organizacao_modulos')
        .select('id,status,inicio_em,fim_em,modulo:modulos_sistema(id,codigo,nome,descricao,icone,tipo,modulo_pai_id,status,ordem,ativo)')
        .eq('organizacao_id', profile.organizacao_id)
        .eq('status', 'ATIVO')
        .order('ordem', { foreignTable: 'modulo', ascending: true })

      if (!mounted) return

      if (queryError) {
        setError(queryError)
        setModules([])
      } else {
        setModules(
          (data ?? []).filter(isModuleActive).map((item) => item.modulo).filter(Boolean),
        )
      }
      setLoading(false)
    }

    loadModules()
    return () => {
      mounted = false
    }
  }, [profile?.id, profile?.organizacao_id, profile?.is_master, authLoading])

  const value = useMemo(() => ({
    modules,
    hasCompanyAccess,
    loading: authLoading || loading,
    error,
    hasModule: (code) => modules.some((module) => module.codigo === code),
    getModule: (code) => modules.find((module) => module.codigo === code) ?? null,
  }), [modules, hasCompanyAccess, loading, authLoading, error])

  return <ModuleContext.Provider value={value}>{children}</ModuleContext.Provider>
}

export function useModules() {
  const context = useContext(ModuleContext)
  if (!context) throw new Error('useModules deve ser usado dentro de ModuleProvider.')
  return context
}
