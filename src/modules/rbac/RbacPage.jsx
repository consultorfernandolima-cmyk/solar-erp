import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronRight, Shield, Users, KeyRound, Save, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../auth/AuthProvider.jsx'

const labelAction = { visualizar: 'Visualizar', criar: 'Criar', editar: 'Editar', excluir: 'Excluir' }

function normalizeSet(rows, key) {
  return new Set((rows ?? []).map((row) => row[key]))
}

export default function RbacPage() {
  const { profile, isCompanyAdmin } = useAuth()
  const [tab, setTab] = useState('usuarios')
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [companies, setCompanies] = useState([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [newGroupName, setNewGroupName] = useState('')
  const [permissions, setPermissions] = useState([])
  const [userGroups, setUserGroups] = useState([])
  const [groupPermissions, setGroupPermissions] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [draftUserGroups, setDraftUserGroups] = useState(new Set())
  const [draftGroupPermissions, setDraftGroupPermissions] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [accessAllowed, setAccessAllowed] = useState(null)

  const canAccess = profile?.is_master || isCompanyAdmin
  const visibleGroups = groups.filter((group) => isCompanyAdmin ? (group.escopo === 'EMPRESA' && group.empresa_id === selectedCompanyId) : (group.escopo === 'ORGANIZACAO' || (group.escopo === 'EMPRESA' && group.empresa_id === selectedCompanyId)))

  useEffect(() => {
    if (isCompanyAdmin) setTab('grupos')
  }, [isCompanyAdmin])

  useEffect(() => {
    let mounted = true
    async function checkAccess() {
      if (!profile?.id) return
      if (canAccess) {
        if (mounted) setAccessAllowed(true)
        return
      }
      const [permissionResult, companyAdminResult] = await Promise.all([
        supabase.rpc('has_permission', { p_permission: 'core.grupos.visualizar' }),
        supabase.rpc('is_any_company_admin'),
      ])
      if (mounted) setAccessAllowed(
        !permissionResult.error && permissionResult.data === true
        || !companyAdminResult.error && companyAdminResult.data === true
      )
    }
    checkAccess()
    return () => { mounted = false }
  }, [profile?.id, canAccess])

  async function load() {
    if (!profile?.organizacao_id || !accessAllowed) return
    setLoading(true)
    setMessage(null)

    const [usersResult, companiesResult, groupsResult, permissionsResult, userGroupsResult, groupPermissionsResult] = await Promise.all([
      supabase.from('perfis').select('id,nome,username,email,ativo,is_admin,is_master').eq('organizacao_id', profile.organizacao_id).order('nome'),
      supabase.from('empresas').select('id,codigo,razao_social,nome_fantasia,tipo,ativo').eq('organizacao_id', profile.organizacao_id).eq('ativo', true).order('tipo').order('razao_social'),
      supabase.from('grupos_permissao').select('id,nome,descricao,ativo,escopo,empresa_id').eq('organizacao_id', profile.organizacao_id).eq('ativo', true).order('escopo').order('nome'),
      supabase.from('permissoes').select('id,chave,modulo,recurso,acao,descricao,modulo_codigo').order('modulo').order('recurso').order('acao'),
      supabase.from('usuario_grupos').select('usuario_id,grupo_id'),
      supabase.from('grupo_permissoes').select('grupo_id,permissao_id'),
    ])

    const firstError = [usersResult, companiesResult, groupsResult, permissionsResult, userGroupsResult, groupPermissionsResult].find((result) => result.error)?.error
    if (firstError) {
      setMessage({ type: 'error', text: firstError.message })
      setLoading(false)
      return
    }

    setUsers(usersResult.data ?? [])
    const companyRows = companiesResult.data ?? []
    setCompanies(companyRows)
    setSelectedCompanyId((current) => current && companyRows.some((company) => company.id === current) ? current : companyRows[0]?.id ?? '')
    setGroups(groupsResult.data ?? [])
    setPermissions(permissionsResult.data ?? [])
    setUserGroups(userGroupsResult.data ?? [])
    setGroupPermissions(groupPermissionsResult.data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    let mounted = true
    if (accessAllowed) load()
    return () => { mounted = false }
  }, [accessAllowed, profile?.organizacao_id])

  useEffect(() => {
    if (!selectedUserId && users[0]) setSelectedUserId(users[0].id)
    if (selectedUserId && !users.some((user) => user.id === selectedUserId)) setSelectedUserId(users[0]?.id ?? '')
  }, [users, selectedUserId])

  useEffect(() => {
    if (!selectedGroupId && visibleGroups[0]) setSelectedGroupId(visibleGroups[0].id)
    if (selectedGroupId && !visibleGroups.some((group) => group.id === selectedGroupId)) setSelectedGroupId(visibleGroups[0]?.id ?? '')
  }, [visibleGroups, selectedGroupId])

  useEffect(() => {
    setDraftUserGroups(normalizeSet(userGroups.filter((row) => row.usuario_id === selectedUserId), 'grupo_id'))
  }, [selectedUserId, userGroups])

  useEffect(() => {
    setDraftGroupPermissions(normalizeSet(groupPermissions.filter((row) => row.grupo_id === selectedGroupId), 'permissao_id'))
  }, [selectedGroupId, groupPermissions])

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null
  const selectedGroup = visibleGroups.find((group) => group.id === selectedGroupId) ?? null

  const permissionGroups = useMemo(() => {
    const grouped = new Map()
    for (const permission of permissions) {
      const key = permission.modulo || 'Outros'
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key).push(permission)
    }
    return [...grouped.entries()]
  }, [permissions])

  async function createCompanyProfile() {
    const name = newGroupName.trim()
    if (!name || !selectedCompanyId || saving) return
    setSaving(true)
    setMessage(null)
    try {
      const { data, error } = await supabase.from('grupos_permissao').insert({
        organizacao_id: profile.organizacao_id,
        empresa_id: selectedCompanyId,
        nome: name,
        escopo: 'EMPRESA',
        ativo: true,
      }).select('id,nome,descricao,ativo,escopo,empresa_id').single()
      if (error) throw error
      setGroups((current) => [...current, data])
      setSelectedGroupId(data.id)
      setNewGroupName('')
      setTab('grupos')
      setMessage({ type: 'success', text: 'Perfil da empresa criado. Agora configure suas permissões.' })
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Não foi possível criar o perfil.' })
    } finally {
      setSaving(false)
    }
  }

  function toggle(setter, value) {
    setter((current) => {
      const next = new Set(current)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  async function saveUserGroups() {
    if (!selectedUser || !selectedGroupId || saving) return
    setSaving(true)
    setMessage(null)
    try {
      const organizationGroups = groups.filter((group) => group.escopo === 'ORGANIZACAO').map((group) => group.id)
      const current = normalizeSet(userGroups.filter((row) => row.usuario_id === selectedUser.id && organizationGroups.includes(row.grupo_id)), 'grupo_id')
      const allowed = new Set(groups.filter((group) => group.escopo === 'ORGANIZACAO').map((group) => group.id))
      const draftOrganization = new Set([...draftUserGroups].filter((id) => allowed.has(id)))
      const add = [...draftOrganization].filter((id) => !current.has(id))
      const remove = [...current].filter((id) => !draftOrganization.has(id))

      if (remove.length) {
        const { error } = await supabase.from('usuario_grupos').delete().eq('usuario_id', selectedUser.id).in('grupo_id', remove)
        if (error) throw error
      }
      if (add.length) {
        const { error } = await supabase.from('usuario_grupos').insert(add.map((grupo_id) => ({ usuario_id: selectedUser.id, grupo_id })))
        if (error) throw error
      }
      setMessage({ type: 'success', text: 'Grupos do usuário atualizados.' })
      await load()
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Não foi possível salvar os grupos.' })
    } finally {
      setSaving(false)
    }
  }

  async function saveGroupPermissions() {
    if (!selectedGroup || saving) return
    setSaving(true)
    setMessage(null)
    try {
      const current = normalizeSet(groupPermissions.filter((row) => row.grupo_id === selectedGroup.id), 'permissao_id')
      const add = [...draftGroupPermissions].filter((id) => !current.has(id))
      const remove = [...current].filter((id) => !draftGroupPermissions.has(id))

      if (remove.length) {
        const { error } = await supabase.from('grupo_permissoes').delete().eq('grupo_id', selectedGroup.id).in('permissao_id', remove)
        if (error) throw error
      }
      if (add.length) {
        const { error } = await supabase.from('grupo_permissoes').insert(add.map((permissao_id) => ({ grupo_id: selectedGroup.id, permissao_id })))
        if (error) throw error
      }
      setMessage({ type: 'success', text: 'Permissões do grupo atualizadas.' })
      await load()
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Não foi possível salvar as permissões.' })
    } finally {
      setSaving(false)
    }
  }

  if (accessAllowed === null || loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Carregando controle de acesso…</div>
  }

  if (!accessAllowed) {
    return <div className="mx-auto max-w-3xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900"><div className="flex items-center gap-2 font-semibold"><AlertCircle size={18}/>Acesso não autorizado</div><p className="mt-2">Seu perfil não possui permissão para administrar o RBAC.</p></div>
  }

  return <div className="space-y-6">
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-solar-green">Administração</p>
      <h2 className="page-title">Controle de acesso</h2>
      <p className="page-subtitle">Gerencie usuários, grupos e permissões da organização atual.</p>
    </div>

    {message && <div className={message.type === 'success' ? 'rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800' : 'rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800'}>{message.text}</div>}

    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-card">
      <label className="ml-2 text-xs font-semibold text-slate-500">Empresa</label>
      <select value={selectedCompanyId} onChange={(event) => setSelectedCompanyId(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-navy-900">
        <option value="">Selecione a empresa</option>
        {companies.map((company) => <option key={company.id} value={company.id}>{company.codigo ? company.codigo + ' · ' : ''}{company.nome_fantasia || company.razao_social}</option>)}
      </select>
      <button type="button" disabled={isCompanyAdmin} onClick={() => setTab('usuarios')} className={tab === 'usuarios' ? 'flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white' : 'flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100'}><Users size={16}/>Usuários e grupos</button>
      <button type="button" onClick={() => setTab('grupos')} className={tab === 'grupos' ? 'flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white' : 'flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100'}><Shield size={16}/>Grupos</button>
      <button type="button" onClick={() => setTab('permissoes')} className={tab === 'permissoes' ? 'flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white' : 'flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100'}><KeyRound size={16}/>Permissões</button>
    </div>

    {tab === 'usuarios' && !isCompanyAdmin && <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <section className="surface-card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4"><p className="text-sm font-semibold text-navy-900">Usuários</p><p className="text-xs text-slate-500">{users.length} perfil(is) na organização</p></div>
        <div className="divide-y divide-slate-100">
          {users.map((user) => <button key={user.id} type="button" onClick={() => setSelectedUserId(user.id)} className={['flex w-full items-center justify-between px-5 py-4 text-left', selectedUserId === user.id ? 'bg-slate-50' : 'hover:bg-slate-50'].join(' ')}>
            <span className="min-w-0"><span className="block truncate text-sm font-semibold text-navy-900">{user.nome}</span><span className="block truncate text-xs text-slate-500">@{user.username}</span></span>
            <span className={user.ativo ? 'rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700' : 'rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500'}>{user.ativo ? 'Ativo' : 'Inativo'}</span>
          </button>)}
        </div>
      </section>
      <section className="surface-card p-6">
        {selectedUser ? <><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-lg font-semibold text-navy-900">{selectedUser.nome}</p><p className="text-sm text-slate-500">{selectedUser.email || selectedUser.username}</p></div><div className="flex gap-2">{selectedUser.is_master && <span className="rounded-full bg-solar-yellow/20 px-3 py-1 text-xs font-semibold text-navy-900">Master</span>}{selectedUser.is_admin && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Administrador</span>}</div></div>
          <div className="mt-6 space-y-2">{groups.filter((group) => group.escopo === 'ORGANIZACAO').map((group) => <label key={group.id} className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50"><span><span className="block text-sm font-medium text-navy-900">{group.nome}</span><span className="text-xs text-slate-500">{group.escopo === 'ORGANIZACAO' ? 'Organização' : 'Empresa'}</span></span><input type="checkbox" checked={draftUserGroups.has(group.id)} onChange={() => toggle(setDraftUserGroups, group.id)} className="h-4 w-4 accent-solar-yellow"/></label>)}</div>
          <div className="mt-5 flex justify-end"><button type="button" disabled={saving} onClick={saveUserGroups} className="flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save size={16}/>{saving ? 'Salvando…' : 'Salvar grupos'}</button></div>
        </> : <p className="text-sm text-slate-500">Nenhum usuário encontrado.</p>}
      </section>
    </div>}

    {tab !== 'usuarios' && <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <section className="surface-card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4"><p className="text-sm font-semibold text-navy-900">Perfis</p><p className="text-xs text-slate-500">{visibleGroups.length} perfil(is) disponível(is) nesta empresa</p><div className="mt-3 flex gap-2"><input value={newGroupName} onChange={(event) => setNewGroupName(event.target.value)} placeholder="Novo perfil" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs" /><button type="button" disabled={!selectedCompanyId || !newGroupName.trim() || saving} onClick={createCompanyProfile} className="rounded-xl bg-navy-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Criar</button></div></div>
        <div className="divide-y divide-slate-100">{visibleGroups.map((group) => <button key={group.id} type="button" onClick={() => setSelectedGroupId(group.id)} className={['flex w-full items-center justify-between px-5 py-4 text-left', selectedGroupId === group.id ? 'bg-slate-50' : 'hover:bg-slate-50'].join(' ')}><span><span className="block text-sm font-semibold text-navy-900">{group.nome}</span><span className="text-xs text-slate-500">{group.escopo === 'ORGANIZACAO' ? 'Organização' : 'Empresa'}</span></span><ChevronRight size={16} className="text-slate-400"/></button>)}</div>
      </section>
      <section className="surface-card p-6">
        {selectedGroup ? <><div className="flex items-start justify-between gap-4"><div><p className="text-lg font-semibold text-navy-900">{selectedGroup.nome}</p><p className="text-sm text-slate-500">{selectedGroup.descricao || (selectedGroup.escopo === 'ORGANIZACAO' ? 'Grupo de organização' : 'Grupo de empresa')}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{selectedGroup.escopo}</span></div>
          <div className="mt-6 space-y-6">{permissionGroups.map(([module, items]) => <div key={module}><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold text-navy-900">{module}</h3><span className="text-xs text-slate-400">{items.filter((item) => draftGroupPermissions.has(item.id)).length}/{items.length}</span></div><div className="grid gap-2 md:grid-cols-2">{items.map((permission) => <label key={permission.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50"><input type="checkbox" checked={draftGroupPermissions.has(permission.id)} onChange={() => toggle(setDraftGroupPermissions, permission.id)} className="mt-0.5 h-4 w-4 accent-solar-yellow"/><span><span className="block text-xs font-semibold text-navy-900">{permission.recurso} · {labelAction[permission.acao] || permission.acao}</span><span className="block text-[11px] text-slate-500">{permission.chave}</span></span></label>)}</div></div>)}</div>
          <div className="mt-6 flex justify-end"><button type="button" disabled={saving} onClick={saveGroupPermissions} className="flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save size={16}/>{saving ? 'Salvando…' : 'Salvar permissões'}</button></div>
        </> : <p className="text-sm text-slate-500">Nenhum grupo encontrado.</p>}
      </section>
    </div>}
  </div>
}
