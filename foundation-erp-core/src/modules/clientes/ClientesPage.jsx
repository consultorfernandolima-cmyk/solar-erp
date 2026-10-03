import { useEffect, useMemo, useState } from 'react'
import { Edit3, Plus, Search, UserRound, X } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { StatusBadge } from '../../components/ui.jsx'
import FormField, { fieldClassName } from '../../components/FormField.jsx'

const emptyForm = {
  tipo_pessoa: 'PJ',
  nome_razao_social: '',
  nome_fantasia: '',
  documento: '',
  inscricao_estadual: '',
  email: '',
  telefone: '',
  whatsapp: '',
  observacoes: '',
  ativo: true,
}

function normalize(value) {
  return value?.trim() || null
}

export default function ClientesPage() {
  const { profile } = useAuth()
  const [clientes, setClientes] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const loadClientes = async () => {
    if (!profile?.organizacao_id) return
    setLoading(true)
    setError('')

    const { data, error: queryError } = await supabase
      .from('parceiros')
      .select('id,codigo,tipo_pessoa,nome_razao_social,nome_fantasia,documento,inscricao_estadual,email,telefone,whatsapp,observacoes,ativo,parceiro_papeis!inner(papel)')
      .eq('organizacao_id', profile.organizacao_id)
      .eq('parceiro_papeis.papel', 'CLIENTE')
      .order('nome_razao_social', { ascending: true })

    if (queryError) setError(queryError.message)
    else setClientes(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadClientes()
  }, [profile?.organizacao_id])

  const filteredClientes = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR')
    if (!term) return clientes

    return clientes.filter((cliente) =>
      [cliente.nome_razao_social, cliente.nome_fantasia, cliente.documento, String(cliente.codigo ?? '')]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(term)),
    )
  }, [clientes, search])

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
    setModalOpen(true)
    setError('')
  }

  const openEdit = (cliente) => {
    setEditingId(cliente.id)
    setForm({
      tipo_pessoa: cliente.tipo_pessoa,
      nome_razao_social: cliente.nome_razao_social ?? '',
      nome_fantasia: cliente.nome_fantasia ?? '',
      documento: cliente.documento ?? '',
      inscricao_estadual: cliente.inscricao_estadual ?? '',
      email: cliente.email ?? '',
      telefone: cliente.telefone ?? '',
      whatsapp: cliente.whatsapp ?? '',
      observacoes: cliente.observacoes ?? '',
      ativo: cliente.ativo,
    })
    setModalOpen(true)
    setError('')
  }

  const closeModal = () => {
    setEditingId(null)
    setForm({ ...emptyForm })
    setModalOpen(false)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (!profile?.organizacao_id || !form.nome_razao_social.trim()) {
      setError('Informe o nome ou razão social.')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      tipo_pessoa: form.tipo_pessoa,
      nome_razao_social: form.nome_razao_social.trim(),
      nome_fantasia: normalize(form.nome_fantasia),
      documento: normalize(form.documento),
      inscricao_estadual: normalize(form.inscricao_estadual),
      email: normalize(form.email),
      telefone: normalize(form.telefone),
      whatsapp: normalize(form.whatsapp),
      observacoes: normalize(form.observacoes),
      ativo: form.ativo,
      organizacao_id: profile.organizacao_id,
    }

    let partnerId = editingId
    let mutationError = null

    if (editingId) {
      const { error: updateError } = await supabase
        .from('parceiros')
        .update(payload)
        .eq('id', editingId)
        .eq('organizacao_id', profile.organizacao_id)
      mutationError = updateError
    } else {
      const { data, error: insertError } = await supabase
        .from('parceiros')
        .insert(payload)
        .select('id')
        .single()
      mutationError = insertError
      partnerId = data?.id ?? null
    }

    if (!mutationError && partnerId && !editingId) {
      const { error: roleError } = await supabase
        .from('parceiro_papeis')
        .insert({ parceiro_id: partnerId, papel: 'CLIENTE' })
      mutationError = roleError
    }

    setSaving(false)

    if (mutationError) {
      setError(mutationError.message)
      return
    }

    closeModal()
    await loadClientes()
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-green">Cadastro compartilhado</p>
          <h2 className="page-title mt-1">Clientes</h2>
          <p className="page-subtitle">Clientes são parceiros do Core com o papel CLIENTE — a mesma pessoa pode ter outros papéis no ERP.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-800"
        >
          <Plus size={17} />
          Novo cliente
        </button>
      </div>

      <div className="surface-card p-4">
        <label className="relative block max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, documento ou código..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-navy-700 focus:bg-white focus:ring-2 focus:ring-solar-yellow/40"
          />
        </label>
      </div>

      {error && !editingId ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="surface-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Código</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Documento</th>
                <th className="px-5 py-3 font-medium">Contato</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="7" className="px-5 py-10 text-center text-slate-500">Carregando clientes...</td></tr>
              ) : filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <UserRound className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm font-medium text-navy-900">Nenhum cliente cadastrado</p>
                    <p className="mt-1 text-xs text-slate-500">Use “Novo cliente” para criar o primeiro cadastro real.</p>
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-medium text-navy-800">{cliente.codigo}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-navy-900">{cliente.nome_razao_social}</p>
                      {cliente.nome_fantasia ? <p className="text-xs text-slate-500">{cliente.nome_fantasia}</p> : null}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{cliente.documento || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-600">{cliente.email || cliente.telefone || cliente.whatsapp || '—'}</td>
                    <td className="px-5 py-3.5">{cliente.tipo_pessoa}</td>
                    <td className="px-5 py-3.5"><StatusBadge tone={cliente.ativo ? 'green' : 'slate'}>{cliente.ativo ? 'Ativo' : 'Inativo'}</StatusBadge></td>
                    <td className="px-5 py-3.5 text-right">
                      <button type="button" onClick={() => openEdit(cliente)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy-900" aria-label="Editar cliente">
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-navy-900">{editingId ? 'Editar cliente' : 'Novo cliente'}</h3>
                <p className="text-xs text-slate-500">Cadastro compartilhado do Core ERP</p>
              </div>
              <button type="button" onClick={closeModal} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-navy-900" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <FormField id="tipo_pessoa" label="Tipo de pessoa">
                <select id="tipo_pessoa" value={form.tipo_pessoa} onChange={(event) => setForm({ ...form, tipo_pessoa: event.target.value })} className={fieldClassName(false)}>
                  <option value="PJ">Pessoa Jurídica</option>
                  <option value="PF">Pessoa Física</option>
                </select>
              </FormField>
              <FormField id="documento" label={form.tipo_pessoa === 'PJ' ? 'CNPJ' : 'CPF'}>
                <input id="documento" value={form.documento} onChange={(event) => setForm({ ...form, documento: event.target.value })} className={fieldClassName(false)} />
              </FormField>
              <FormField id="nome_razao_social" label={form.tipo_pessoa === 'PJ' ? 'Razão social' : 'Nome completo'}>
                <input id="nome_razao_social" required value={form.nome_razao_social} onChange={(event) => setForm({ ...form, nome_razao_social: event.target.value })} className={fieldClassName(false)} />
              </FormField>
              <FormField id="nome_fantasia" label="Nome fantasia">
                <input id="nome_fantasia" value={form.nome_fantasia} onChange={(event) => setForm({ ...form, nome_fantasia: event.target.value })} className={fieldClassName(false)} />
              </FormField>
              <FormField id="inscricao_estadual" label="Inscrição estadual">
                <input id="inscricao_estadual" value={form.inscricao_estadual} onChange={(event) => setForm({ ...form, inscricao_estadual: event.target.value })} className={fieldClassName(false)} />
              </FormField>
              <FormField id="email" label="E-mail">
                <input id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={fieldClassName(false)} />
              </FormField>
              <FormField id="telefone" label="Telefone">
                <input id="telefone" value={form.telefone} onChange={(event) => setForm({ ...form, telefone: event.target.value })} className={fieldClassName(false)} />
              </FormField>
              <FormField id="whatsapp" label="WhatsApp">
                <input id="whatsapp" value={form.whatsapp} onChange={(event) => setForm({ ...form, whatsapp: event.target.value })} className={fieldClassName(false)} />
              </FormField>
              <div className="md:col-span-2">
                <FormField id="observacoes" label="Observações">
                  <textarea id="observacoes" rows="3" value={form.observacoes} onChange={(event) => setForm({ ...form, observacoes: event.target.value })} className={fieldClassName(false)} />
                </FormField>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
                <input type="checkbox" checked={form.ativo} onChange={(event) => setForm({ ...form, ativo: event.target.checked })} className="h-4 w-4 rounded border-slate-300 text-navy-900 focus:ring-solar-yellow" />
                Cadastro ativo
              </label>
              {error ? <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button type="button" onClick={closeModal} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button type="submit" disabled={saving} className="rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? 'Salvando...' : 'Salvar cliente'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  )
}
