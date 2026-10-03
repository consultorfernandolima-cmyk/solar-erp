import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

async function loadProfile(userId) {
  const { data, error } = await supabase
    .from('perfis')
    .select('id, organizacao_id, username, nome, email, is_admin, is_master, ativo')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isCompanyAdmin, setIsCompanyAdmin] = useState(false)

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      try {
        // Primeiro confirma o usuário autenticado. Isso evita liberar a árvore
        // protegida apenas com base em um getSession() que ainda pode estar
        // sincronizando a sessão local.
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          if (mounted) {
            setSession(null)
            setProfile(null)
            setIsCompanyAdmin(false)
          }
          return
        }

        const {
          data: { session: nextSession },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) throw sessionError
        if (!mounted) return

        setSession(nextSession)

        const nextProfile = await loadProfile(user.id)
        if (!mounted) return

        if (!nextProfile?.ativo) {
          await supabase.auth.signOut()
          if (mounted) {
            setSession(null)
            setProfile(null)
            setIsCompanyAdmin(false)
          }
          return
        }

        setProfile(nextProfile)
        const { data: companyAccess } = await supabase.from('usuario_empresas').select('is_administrador').eq('usuario_id', user.id)
        if (mounted) setIsCompanyAdmin((companyAccess ?? []).some((row) => row.is_administrador === true))
      } catch (error) {
        console.error('Falha ao inicializar autenticação do SOLAR ERP:', error)
        if (mounted) {
          setSession(null)
          setProfile(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void bootstrap()

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return

      setSession(nextSession)

      if (!nextSession) {
        setProfile(null)
        setIsCompanyAdmin(false)
        return
      }

      // Não recarregar o perfil em cada refresh/token event.
      // O perfil já foi carregado no bootstrap ou no signIn.
      // Isso evita corrida entre AuthProvider, ModuleProvider e EmpresaProvider.
      if (event === 'SIGNED_OUT') setProfile(null)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    const currentProfile = await loadProfile(data.user.id)
    if (!currentProfile?.ativo) {
      await supabase.auth.signOut()
      throw new Error('Usuário sem perfil ativo no SOLAR ERP.')
    }

    setSession(data.session)
    setProfile(currentProfile)
    const { data: companyAccess } = await supabase.from('usuario_empresas').select('is_administrador').eq('usuario_id', data.user.id)
    setIsCompanyAdmin((companyAccess ?? []).some((row) => row.is_administrador === true))
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setSession(null)
    setProfile(null)
    setIsCompanyAdmin(false)
  }

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, profile, loading, isCompanyAdmin, signIn, signOut }),
    [session, profile, loading, isCompanyAdmin],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  return context
}
