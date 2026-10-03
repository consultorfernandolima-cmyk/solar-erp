import { useEffect, useMemo, useState } from 'react'
import { Edit3, Package, Plus, Search, X } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { StatusBadge } from '../../components/ui.jsx'
import FormField, { fieldClassName } from '../../components/FormField.jsx'

const blank = {
  codigo: '', codigo_externo: '', nome: '', descricao: '', tipo: 'PRODUTO',
  unidade_medida_id: '', grupo_id: '', familia_id: '', tipo_consumo: '',
  controla_estoque: false, controla_serial: false, ativo: true,
}
const clean = (value) => value?.trim() || null

export default function ProdutosPage() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [units, setUnits] = useState([])
  const [groups, setGroups] = useState([])
  const [families, setFamilies] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(blank)
  const [editingId, setEditingId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const load = async () => {
    if (!profile?.organizacao_id) return
    setLoading(true); setError('')
    const [products, unitRows, groupRows, familyRows] = await Promise.all([
      supabase.from('produtos_servicos').select('id,codigo,codigo_externo,nome,descricao,tipo,unidade_medida_id,grupo_id,familia_id,tipo_consumo,controla_estoque,controla_serial,ativo').eq('organizacao_id', profile.organizacao_id).order('nome'),
      supabase.from('unidades_medida').select('id,codigo,nome').or(`organizacao_id.is.null,organizacao_id.eq.${profile.organizacao_id}`).eq('ativo', true).order('codigo'),
      supabase.from('grupos_produto').select('id,codigo,nome').eq('organizacao_id', profile.organizacao_id).eq('ativo', true).order('nome'),
      supabase.from('familias_produto').select('id,codigo,nome,grupo_id').eq('organizacao_id', profile.organizacao_id).eq('ativo', true).order('nome'),
    ])
    const failure = products.error || unitRows.error || groupRows.error || familyRows.error
    if (failure) setError(failure.message)
    else { setItems(products.data ?? []); setUnits(unitRows.data ?? []); setGroups(groupRows.data ?? []); setFamilies(familyRows.data ?? []) }
    setLoading(false)
  }
  useEffect(() => { load() }, [profile?.organizacao_id])

  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR')
    return !term ? items : items.filter((item) => [item.codigo, item.codigo_externo, item.nome, item.tipo].some((v) => String(v ?? '').toLocaleLowerCase('pt-BR').includes(term)))
  }, [items, search])
  const availableFamilies = families.filter((family) => !form.grupo_id || family.grupo_id === form.grupo_id)

  const openNew = () => { setEditingId(null); setForm({ ...blank }); setError(''); setModalOpen(true) }
  const openEdit = (item) => {
    setEditingId(item.id)
    setForm({ ...blank, ...item, unidade_medida_id: item.unidade_medida_id ?? '', grupo_id: item.grupo_id ?? '', familia_id: item.familia_id ?? '', tipo_consumo: item.tipo_consumo ?? '' })
    setError(''); setModalOpen(true)
  }
  const close = () => { setModalOpen(false); setEditingId(null); setForm({ ...blank }) }
  const save = async (event) => {
    event.preventDefault()
    if (!profile?.organizacao_id || !form.nome.trim()) { setError('Informe o nome do produto ou serviço.'); return }
    setSaving(true); setError('')
    const payload = {
      organizacao_id: profile.organizacao_id, codigo: clean(form.codigo), codigo_externo: clean(form.codigo_externo),
      nome: form.nome.trim(), descricao: clean(form.descricao), tipo: form.tipo,
      unidade_medida_id: form.unidade_medida_id || null, grupo_id: form.grupo_id || null, familia_id: form.familia_id || null,
      tipo_consumo: clean(form.tipo_consumo), controla_estoque: form.tipo === 'PRODUTO' && form.controla_estoque,
      controla_serial: form.tipo === 'PRODUTO' && form.controla_serial, ativo: form.ativo,
    }
    const result = editingId
      ? await supabase.from('produtos_servicos').update(payload).eq('id', editingId).eq('organizacao_id', profile.organizacao_id)
      : await supabase.from('produtos_servicos').insert(payload)
    setSaving(false)
    if (result.error) { setError(result.error.message); return }
    close(); await load()
  }

  return <section className="space-y-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-green">Cadastro compartilhado · Core ERP</p><h2 className="page-title mt-1">Produtos e serviços</h2><p className="page-subtitle">Um único catálogo para Comércio, Serviços e Gestão de Usinas.</p></div>
      <button type="button" onClick={openNew} className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-navy-800"><Plus size={17}/> Novo cadastro</button>
    </div>
    <div className="surface-card p-4"><label className="relative block max-w-xl"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Buscar por código, nome ou tipo..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-navy-700 focus:bg-white focus:ring-2 focus:ring-solar-yellow/40"/></label></div>
    {error && !modalOpen ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
    <div className="surface-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm">
      <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500"><tr>{['Código','Produto / serviço','Tipo','Unidade','Grupo / família','Status',''].map((v)=><th key={v} className="px-5 py-3 font-medium">{v}</th>)}</tr></thead>
      <tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan="7" className="px-5 py-10 text-center text-slate-500">Carregando catálogo...</td></tr> : visible.length === 0 ? <tr><td colSpan="7" className="px-5 py-12 text-center"><Package className="mx-auto h-8 w-8 text-slate-300"/><p className="mt-2 font-medium text-navy-900">Nenhum cadastro encontrado</p><p className="mt-1 text-xs text-slate-500">Cadastre produtos e serviços para compartilhar entre os módulos.</p></td></tr> : visible.map((item)=><tr key={item.id} className="hover:bg-slate-50/70">
        <td className="px-5 py-3.5 font-medium text-navy-800">{item.codigo || '—'}</td><td className="px-5 py-3.5"><p className="font-medium text-navy-900">{item.nome}</p>{item.codigo_externo ? <p className="text-xs text-slate-500">Cód. externo: {item.codigo_externo}</p>:null}</td><td className="px-5 py-3.5 text-slate-600">{item.tipo === 'SERVICO' ? 'Serviço' : 'Produto'}</td><td className="px-5 py-3.5 text-slate-600">{units.find(u=>u.id===item.unidade_medida_id)?.codigo || '—'}</td><td className="px-5 py-3.5 text-slate-600">{groups.find(g=>g.id===item.grupo_id)?.nome || '—'}{item.familia_id ? ` / ${families.find(f=>f.id===item.familia_id)?.nome || ''}` : ''}</td><td className="px-5 py-3.5"><StatusBadge tone={item.ativo?'green':'slate'}>{item.ativo?'Ativo':'Inativo'}</StatusBadge></td><td className="px-5 py-3.5 text-right"><button type="button" onClick={()=>openEdit(item)} aria-label="Editar cadastro" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy-900"><Edit3 size={16}/></button></td>
      </tr>)}</tbody>
    </table></div></div>
    {modalOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm"><form onSubmit={save} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4"><div><h3 className="text-lg font-semibold text-navy-900">{editingId?'Editar cadastro':'Novo produto ou serviço'}</h3><p className="text-xs text-slate-500">Catálogo compartilhado do Core ERP</p></div><button type="button" onClick={close} aria-label="Fechar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button></div>
      <div className="grid gap-4 p-6 md:grid-cols-2">
        <FormField id="tipo" label="Tipo"><select id="tipo" value={form.tipo} onChange={e=>setForm({...form,tipo:e.target.value,controla_estoque:false,controla_serial:false})} className={fieldClassName(false)}><option value="PRODUTO">Produto</option><option value="SERVICO">Serviço</option></select></FormField>
        <FormField id="nome" label="Nome"><input id="nome" required value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} className={fieldClassName(false)}/></FormField>
        <FormField id="codigo" label="Código interno"><input id="codigo" value={form.codigo} onChange={e=>setForm({...form,codigo:e.target.value})} className={fieldClassName(false)}/></FormField>
        <FormField id="codigo_externo" label="Código externo / referência"><input id="codigo_externo" value={form.codigo_externo} onChange={e=>setForm({...form,codigo_externo:e.target.value})} className={fieldClassName(false)}/></FormField>
        <FormField id="unidade_medida_id" label="Unidade de medida"><select id="unidade_medida_id" value={form.unidade_medida_id} onChange={e=>setForm({...form,unidade_medida_id:e.target.value})} className={fieldClassName(false)}><option value="">Não definida</option>{units.map(u=><option key={u.id} value={u.id}>{u.codigo} — {u.nome}</option>)}</select></FormField>
        <FormField id="grupo_id" label="Grupo"><select id="grupo_id" value={form.grupo_id} onChange={e=>setForm({...form,grupo_id:e.target.value,familia_id:''})} className={fieldClassName(false)}><option value="">Não definido</option>{groups.map(g=><option key={g.id} value={g.id}>{g.codigo ? `${g.codigo} — ` : ''}{g.nome}</option>)}</select></FormField>
        <FormField id="familia_id" label="Família"><select id="familia_id" value={form.familia_id} onChange={e=>setForm({...form,familia_id:e.target.value})} className={fieldClassName(false)}><option value="">Não definida</option>{availableFamilies.map(f=><option key={f.id} value={f.id}>{f.codigo ? `${f.codigo} — ` : ''}{f.nome}</option>)}</select></FormField>
        <FormField id="tipo_consumo" label="Tipo de consumo"><input id="tipo_consumo" value={form.tipo_consumo} onChange={e=>setForm({...form,tipo_consumo:e.target.value})} placeholder="Ex.: próprio, revenda, aplicação" className={fieldClassName(false)}/></FormField>
        <div className="md:col-span-2"><FormField id="descricao" label="Descrição"><textarea id="descricao" rows="3" value={form.descricao} onChange={e=>setForm({...form,descricao:e.target.value})} className={fieldClassName(false)}/></FormField></div>
        {form.tipo==='PRODUTO' ? <div className="flex flex-wrap gap-6 md:col-span-2"><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.controla_estoque} onChange={e=>setForm({...form,controla_estoque:e.target.checked})} className="h-4 w-4 rounded border-slate-300"/>Controla estoque</label><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={form.controla_serial} onChange={e=>setForm({...form,controla_serial:e.target.checked})} className="h-4 w-4 rounded border-slate-300"/>Controla número de série</label></div>:null}
        <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2"><input type="checkbox" checked={form.ativo} onChange={e=>setForm({...form,ativo:e.target.checked})} className="h-4 w-4 rounded border-slate-300"/>Cadastro ativo</label>
        {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">{error}</div>:null}
      </div><div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button type="button" onClick={close} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancelar</button><button type="submit" disabled={saving} className="rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving?'Salvando...':'Salvar cadastro'}</button></div>
    </form></div>:null}
  </section>
}
