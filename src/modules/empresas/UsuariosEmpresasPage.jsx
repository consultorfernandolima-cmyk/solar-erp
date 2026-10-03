import { useEffect, useMemo, useState } from 'react'
import { Building2, Check, Loader2, Save, ShieldCheck, Users } from 'lucide-react'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { supabase } from '../../lib/supabase.js'

export default function UsuariosEmpresasPage() {
  const { profile } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [empresas, setEmpresas] = useState([])
  const [grupos, setGrupos] = useState([])
  const [usuarioId, setUsuarioId] = useState('')
  const [acessos, setAcessos] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [canManage, setCanManage] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const usuarioAtual = useMemo(
    () => usuarios.find((usuario) => usuario.id === usuarioId) ?? null,
    [usuarios, usuarioId],
  )
  const masterSelecionado = usuarioAtual?.is_master === true

  async function carregar() {
    if (!profile?.id) return

    setLoading(true)
    setError('')

    const { data: meuAcesso, error: meuAcessoError } = await supabase
      .from('usuario_empresas')
      .select('empresa_id,is_administrador,grupo_id')
      .eq('usuario_id', profile.id)

    if (meuAcessoError) {
      setError(meuAcessoError.message)
      setLoading(false)
      return
    }

    const podeAdministrar = profile.is_master === true || (meuAcesso ?? []).some((row) => row.is_administrador)
    setCanManage(podeAdministrar)

    if (!podeAdministrar) {
      setLoading(false)
      return
    }

    const [usuariosResult, empresasResult, gruposResult] = await Promise.all([
      supabase
        .from('perfis')
        .select('id,nome,username,email,ativo,is_master')
        .eq('organizacao_id', profile.organizacao_id)
        .eq('ativo', true)
        .order('nome'),
      supabase
        .from('empresas')
        .select('id,codigo,razao_social,nome_fantasia,tipo,ativo,empresa_matriz_id')
        .eq('organizacao_id', profile.organizacao_id)
        .eq('ativo', true)
        .order('tipo')
        .order('razao_social'),
      supabase
        .from('grupos_permissao')
        .select('id,nome,descricao,ativo,escopo,empresa_id')
        .eq('organizacao_id', profile.organizacao_id)
        .eq('ativo', true)
        .eq('escopo', 'EMPRESA')
        .order('nome'),
    ])

    const firstError = [usuariosResult, empresasResult, gruposResult].find((result) => result.error)?.error

    if (firstError) {
      setError(firstError.message)
      setLoading(false)
      return
    }

    setUsuarios(usuariosResult.data ?? [])
    setEmpresas(empresasResult.data ?? [])
    setGrupos(gruposResult.data ?? [])

    if (!usuarioId && usuariosResult.data?.[0]) {
      setUsuarioId(usuariosResult.data[0].id)
    }

    setLoading(false)
  }

  async function carregarAcessos(usuario) {
    if (!usuario) {
      setAcessos({})
      return
    }

    const { data, error: acessoError } = await supabase
      .from('usuario_empresas')
      .select('empresa_id,grupo_id,is_administrador')
      .eq('usuario_id', usuario)

    if (acessoError) {
      setError(acessoError.message)
      return
    }

    const mapa = {}
    for (const row of data ?? []) {
      mapa[row.empresa_id] = {
        grupo_id: row.grupo_id ?? '',
        is_administrador: row.is_administrador === true,
      }
    }

    setAcessos(mapa)
  }

  useEffect(() => {
    carregar()
  }, [profile?.id, profile?.organizacao_id])

  useEffect(() => {
    if (canManage && usuarioId) {
      carregarAcessos(usuarioId)
    }
  }, [canManage, usuarioId])

  function alternarEmpresa(empresaId) {
    setAcessos((current) => {
      const next = { ...current }

      if (next[empresaId]) {
        delete next[empresaId]
      } else {
        next[empresaId] = {
          grupo_id: '',
          is_administrador: false,
        }
      }

      return next
    })

    setMessage('')
    setError('')
  }

  function atualizarAcesso(empresaId, patch) {
    setAcessos((current) => ({
      ...current,
      [empresaId]: {
        ...current[empresaId],
        ...patch,
      },
    }))

    setMessage('')
    setError('')
  }

  async function salvarAcessos() {
    if (!usuarioId || masterSelecionado || saving) return

    setSaving(true)
    setMessage('')
    setError('')

    try {
      const { data: existentes, error: existentesError } = await supabase
        .from('usuario_empresas')
        .select('empresa_id')
        .eq('usuario_id', usuarioId)

      if (existentesError) throw existentesError

      const idsExistentes = (existentes ?? []).map((row) => row.empresa_id)

      if (idsExistentes.length > 0) {
        const { error: deleteError } = await supabase
          .from('usuario_empresas')
          .delete()
          .eq('usuario_id', usuarioId)
          .in('empresa_id', idsExistentes)

        if (deleteError) throw deleteError
      }

      const novosAcessos = Object.entries(acessos).map(([empresa_id, acesso]) => ({
        usuario_id: usuarioId,
        empresa_id,
        grupo_id: acesso.grupo_id || null,
        is_administrador: acesso.is_administrador === true,
        concedido_por: profile.id,
      }))

      if (novosAcessos.length > 0) {
        const { error: insertError } = await supabase
          .from('usuario_empresas')
          .insert(novosAcessos)

        if (insertError) throw insertError
      }

      setMessage('Acesso por empresa, perfil e administração atualizado com sucesso.')
      await carregar()
      await carregarAcessos(usuarioId)
    } catch (saveError) {
      setError(saveError.message || 'Não foi possível salvar os acessos.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Carregando controle de acesso…
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-lg font-semibold text-navy-900">Acesso restrito</h1>
          <p className="mt-2 text-sm text-slate-500">
            Somente Master ou Administrador de uma empresa pode configurar acessos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-yellow">
          Administração
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-navy-950">Usuários e empresas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Defina empresa, perfil e nível de administração para usuários operacionais. O Master possui acesso integral à organização e às empresas e não depende de vínculo em usuario_empresas.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-500" />
            <h2 className="font-semibold text-navy-900">Usuário</h2>
          </div>

          <div className="mt-4 space-y-2">
            {usuarios.map((usuario) => (
              <button
                key={usuario.id}
                type="button"
                onClick={() => {
                  setUsuarioId(usuario.id)
                  setMessage('')
                }}
                className={[
                  'w-full rounded-xl border px-4 py-3 text-left',
                  usuario.id === usuarioId
                    ? 'border-solar-yellow bg-yellow-50'
                    : 'border-slate-200 hover:bg-slate-50',
                ].join(' ')}
              >
                <p className="text-sm font-medium text-navy-900">{usuario.nome}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  @{usuario.username}
                  {usuario.is_master ? ' · Master' : ''}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-slate-500" />
                <h2 className="font-semibold text-navy-900">Acesso por empresa</h2>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {usuarioAtual?.nome ?? 'Selecione um usuário'}
              </p>
            </div>

            <button
              type="button"
              onClick={salvarAcessos}
              disabled={!usuarioAtual || masterSelecionado || saving}
              className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </button>
          </div>

          {masterSelecionado && (
            <div className="mt-5 rounded-xl border border-solar-yellow/50 bg-yellow-50 px-4 py-3 text-sm text-navy-900">
              <strong>Master:</strong> este usuário já possui acesso integral à organização e às empresas. O vínculo operacional em <code>usuario_empresas</code> não é necessário.
            </div>
          )}

          <div className="mt-5 space-y-3">
            {empresas.map((empresa) => {
              const selecionada = Boolean(acessos[empresa.id])
              const acesso = acessos[empresa.id]
              const label = empresa.nome_fantasia || empresa.razao_social

              return (
                <div
                  key={empresa.id}
                  className={[
                    'rounded-xl border p-4',
                    selecionada ? 'border-solar-yellow bg-yellow-50/40' : 'border-slate-200',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      disabled={masterSelecionado}
                      onClick={() => alternarEmpresa(empresa.id)}
                      className="flex min-w-0 items-center gap-3 text-left"
                    >
                      <span
                        className={[
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border',
                          selecionada
                            ? 'border-navy-900 bg-navy-900 text-white'
                            : 'border-slate-300 text-transparent',
                        ].join(' ')}
                      >
                        <Check className="h-4 w-4" />
                      </span>

                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-navy-900">
                          {empresa.codigo ? `${empresa.codigo} · ` : ''}{label}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {empresa.tipo === 'FILIAL' ? 'Filial' : 'Matriz'}
                        </span>
                      </span>
                    </button>

                    {selecionada && (
                      <label className="flex items-center gap-2 text-xs font-semibold text-navy-900">
                        <input
                          type="checkbox"
                          disabled={masterSelecionado}
                          checked={acesso.is_administrador}
                          onChange={(event) =>
                            atualizarAcesso(empresa.id, {
                              is_administrador: event.target.checked,
                              grupo_id: event.target.checked ? null : acesso.grupo_id,
                            })
                          }
                          className="h-4 w-4 accent-solar-yellow"
                        />
                        <ShieldCheck size={15} />
                        Administrador
                      </label>
                    )}
                  </div>

                  {selecionada && !acesso.is_administrador && (
                    <div className="mt-3 pl-9">
                      <label className="block text-xs font-semibold text-slate-600">
                        Perfil da empresa
                      </label>

                      <select
                        disabled={masterSelecionado}
                        value={acesso.grupo_id}
                        onChange={(event) =>
                          atualizarAcesso(empresa.id, { grupo_id: event.target.value })
                        }
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-navy-900"
                      >
                        <option value="">Selecione o perfil</option>
                        {grupos.filter((grupo) => grupo.empresa_id === empresa.id).map((grupo) => (
                          <option key={grupo.id} value={grupo.id}>
                            {grupo.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selecionada && acesso.is_administrador && (
                    <p className="mt-2 pl-9 text-xs text-slate-500">
                      Administrador possui acesso total operacional nesta empresa, respeitando os módulos licenciados.
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
