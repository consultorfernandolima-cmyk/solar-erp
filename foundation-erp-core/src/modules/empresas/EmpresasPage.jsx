import { useEffect, useMemo, useState } from 'react'
import { Building2, Pencil, Plus, Power, Save, X } from 'lucide-react'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { supabase } from '../../lib/supabase.js'

const emptyForm = { codigo: '', razao_social: '', nome_fantasia: '', cnpj: '', tipo: 'MATRIZ', empresa_matriz_id: '' }

export default function EmpresasPage() {
  const { profile } = useAuth()
  const [empresas, setEmpresas] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const matrizes = useMemo(() => empresas.filter((empresa) => empresa.tipo === 'MATRIZ'), [empresas])

  const load = async () => {
    if (!profile?.organizacao_id) return
    setLoading(true); setError('')
    const { data, error: queryError } = await supabase.from('empresas').select('id,codigo,razao_social,nome_fantasia,cnpj,tipo,empresa_matriz_id,ativo').eq('organizacao_id', profile.organizacao_id).order('tipo').order('codigo').order('razao_social')
    if (queryError) setError(queryError.message); else setEmpresas(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [profile?.organizacao_id])

  if (!profile?.is_master) return <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"><h2 className="text-xl font-semibold text-navy-900">Acesso restrito</h2><p className="mt-2 text-sm text-slate-500">O cadastro de empresas e filiais é uma rotina administrativa.</p></section>

  const reset = () => { setForm(emptyForm); setEditingId(null); setError('') }
  const submit = async (event) => {
    event.preventDefault()
    if (!form.razao_social.trim()) return setError('Informe a razão social.')
    if (form.tipo === 'FILIAL' && !form.empresa_matriz_id) return setError('Selecione a empresa matriz da filial.')
    setSaving(true); setError('')
    const payload = { codigo: form.codigo.trim() || null, razao_social: form.razao_social.trim(), nome_fantasia: form.nome_fantasia.trim() || null, cnpj: form.cnpj.trim() || null, tipo: form.tipo, empresa_matriz_id: form.tipo === 'FILIAL' ? form.empresa_matriz_id : null }
    const query = editingId ? supabase.from('empresas').update(payload).eq('id', editingId).eq('organizacao_id', profile.organizacao_id) : supabase.from('empresas').insert({ ...payload, organizacao_id: profile.organizacao_id })
    const { error: saveError } = await query
    if (saveError) setError(saveError.message); else { reset(); await load() }
    setSaving(false)
  }
  const edit = (empresa) => { setEditingId(empresa.id); setForm({ codigo: empresa.codigo ?? '', razao_social: empresa.razao_social ?? '', nome_fantasia: empresa.nome_fantasia ?? '', cnpj: empresa.cnpj ?? '', tipo: empresa.tipo ?? 'MATRIZ', empresa_matriz_id: empresa.empresa_matriz_id ?? '' }) }
  const toggleActive = async (empresa) => {
    setError('')
    const { error: updateError } = await supabase.from('empresas').update({ ativo: !empresa.ativo }).eq('id', empresa.id).eq('organizacao_id', profile.organizacao_id)
    if (updateError) setError(updateError.message); else await load()
  }

  return <section className="space-y-5">
    <div className="flex flex-col gap-4 rounded-2xl bg-navy-950 p-6 text-white md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-solar-yellow text-navy-950"><Building2 size={22}/></div><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-mint">Cadastros do CORE</p><h2 className="text-2xl font-semibold">Empresas e filiais</h2></div></div>
      <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl bg-solar-yellow px-4 py-2.5 text-sm font-semibold text-navy-950"><Plus size={17}/> Nova empresa</button>
    </div>
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="p-6 text-sm text-slate-500">Carregando empresas...</p> : empresas.length === 0 ? <div className="p-8 text-center"><p className="font-semibold text-navy-900">Nenhuma empresa cadastrada</p><p className="mt-1 text-sm text-slate-500">Cadastre a matriz antes de cadastrar suas filiais.</p></div> : <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Código</th><th className="px-4 py-3">Empresa</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">CNPJ</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Ações</th></tr></thead><tbody className="divide-y divide-slate-100">{empresas.map((empresa) => <tr key={empresa.id}><td className="px-4 py-3 font-medium">{empresa.codigo || '—'}</td><td className="px-4 py-3"><p className="font-semibold text-navy-900">{empresa.nome_fantasia || empresa.razao_social}</p>{empresa.nome_fantasia && <p className="text-xs text-slate-500">{empresa.razao_social}</p>}</td><td className="px-4 py-3">{empresa.tipo}</td><td className="px-4 py-3">{empresa.cnpj || '—'}</td><td className="px-4 py-3">{empresa.ativo ? 'Ativa' : 'Inativa'}</td><td className="px-4 py-3 text-right"><button onClick={() => edit(empresa)} className="mr-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil size={16}/></button><button onClick={() => toggleActive(empresa)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Power size={16}/></button></td></tr>)}</tbody></table></div>}
      </div>
      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><h3 className="font-semibold text-navy-900">{editingId ? 'Editar empresa' : 'Cadastrar empresa'}</h3>{editingId && <button type="button" onClick={reset} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X size={17}/></button>}</div>
        <div className="mt-4 space-y-3">
          {[['codigo','Código'],['razao_social','Razão social'],['nome_fantasia','Nome fantasia'],['cnpj','CNPJ']].map(([name,label]) => <label key={name} className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">{label}{name === 'razao_social' && ' *'}</span><input value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-solar-yellow" /></label>)}
          <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Tipo</span><select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value, empresa_matriz_id: '' })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option value="MATRIZ">Matriz</option><option value="FILIAL">Filial</option></select></label>
          {form.tipo === 'FILIAL' && <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-600">Empresa matriz *</span><select value={form.empresa_matriz_id} onChange={(e) => setForm({ ...form, empresa_matriz_id: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option value="">Selecione</option>{matrizes.filter((m) => m.id !== editingId).map((m) => <option key={m.id} value={m.id}>{m.codigo ? m.codigo + ' — ' : ''}{m.nome_fantasia || m.razao_social}</option>)}</select></label>}
        </div>
        {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <button disabled={saving} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Save size={16}/>{saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Cadastrar empresa'}</button>
      </form>
    </div>
  </section>
}
