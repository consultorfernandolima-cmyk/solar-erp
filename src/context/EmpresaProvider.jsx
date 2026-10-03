import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../auth/AuthProvider.jsx'

const EmpresaContext = createContext(null)

const storageKey = (profile) => (
  profile?.id && profile?.organizacao_id
    ? `solar-erp:empresa-atual:${profile.organizacao_id}:${profile.id}`
    : null
)

export function EmpresaProvider({ children }) {
  const { profile, loading: authLoading } = useAuth()
  const [empresas, setEmpresas] = useState([])
  const [empresaAtualId, setEmpresaAtualId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const loadEmpresas = async () => {
      if (authLoading) return

      if (!profile?.id || !profile?.organizacao_id) {
        if (mounted) {
          setEmpresas([])
          setEmpresaAtualId(null)
          setLoading(false)
          setError(null)
        }
        return
      }

      setLoading(true)
      setError(null)

      // Master has organization-wide access. is_admin is reserved for
      // compatibility with legacy profiles; company administrators are
      // intentionally resolved through usuario_empresas below.
      const hasOrganizationWideCompanyAccess = profile.is_master === true || profile.is_admin === true

      const query = hasOrganizationWideCompanyAccess
        ? supabase
            .from('empresas')
            .select('id,codigo,razao_social,nome_fantasia,cnpj,tipo,empresa_matriz_id,ativo')
            .eq('organizacao_id', profile.organizacao_id)
            .order('tipo', { ascending: true })
            .order('razao_social', { ascending: true })
        : supabase
            .from('usuario_empresas')
            .select('empresa:empresas!inner(id,codigo,razao_social,nome_fantasia,cnpj,tipo,empresa_matriz_id,ativo,organizacao_id)')
            .eq('usuario_id', profile.id)
            .eq('empresa.organizacao_id', profile.organizacao_id)

      const { data, error: queryError } = await query

      if (!mounted) return

      if (queryError) {
        setEmpresas([])
        setEmpresaAtualId(null)
        setError(queryError)
        setLoading(false)
        return
      }

      const available = (data ?? [])
        .map((item) => hasOrganizationWideCompanyAccess ? item : item.empresa)
        .filter(Boolean)
        .filter((empresa) => empresa.ativo)

      const key = storageKey(profile)
      const storedId = key ? window.localStorage.getItem(key) : null
      const storedIsAvailable = storedId && available.some((empresa) => empresa.id === storedId)

      setEmpresas(available)
      setEmpresaAtualId(storedIsAvailable ? storedId : available.length === 1 ? available[0].id : null)
      setLoading(false)
    }

    loadEmpresas()

    return () => {
      mounted = false
    }
  }, [profile?.id, profile?.organizacao_id, profile?.is_master, profile?.is_admin, authLoading])

  const selecionarEmpresa = (empresaId) => {
    const empresa = empresas.find((item) => item.id === empresaId)
    if (!empresa) return

    setEmpresaAtualId(empresa.id)
    const key = storageKey(profile)
    if (key) window.localStorage.setItem(key, empresa.id)
  }

  const limparEmpresaAtual = () => {
    setEmpresaAtualId(null)
    const key = storageKey(profile)
    if (key) window.localStorage.removeItem(key)
  }

  const empresaAtual = empresas.find((empresa) => empresa.id === empresaAtualId) ?? null

  const value = useMemo(() => ({
    empresas,
    empresaAtual,
    empresaAtualId,
    selecionarEmpresa,
    limparEmpresaAtual,
    loading: authLoading || loading,
    error,
  }), [empresas, empresaAtual, empresaAtualId, loading, authLoading, error])

  return <EmpresaContext.Provider value={value}>{children}</EmpresaContext.Provider>
}

export function useEmpresa() {
  const context = useContext(EmpresaContext)
  if (!context) throw new Error('useEmpresa deve ser usado dentro de EmpresaProvider.')
  return context
}
