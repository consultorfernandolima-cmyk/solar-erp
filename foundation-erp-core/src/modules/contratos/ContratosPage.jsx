import { useEffect, useMemo, useState } from 'react'
import { Edit3, FileSignature, Plus, Search, Trash2, X } from 'lucide-react'
import { StatusBadge, formatCurrency, formatDate } from '../../components/ui.jsx'
import FormField, { fieldClassName } from '../../components/FormField.jsx'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { useEmpresa } from '../../context/EmpresaProvider.jsx'

const statusLabel = { RASCUNHO:'Rascunho', EM_NEGOCIACAO:'Em negociação', ASSINADO:'Assinado', ATIVO:'Ativo', SUSPENSO:'Suspenso', ENCERRADO:'Encerrado', CANCELADO:'Cancelado' }
const statusTone = { RASCUNHO:'slate', EM_NEGOCIACAO:'yellow', ASSINADO:'green', ATIVO:'green', SUSPENSO:'yellow', ENCERRADO:'slate', CANCELADO:'slate' }
const periodicidadeLabel = { UNICA:'Única', MENSAL:'Mensal', BIMESTRAL:'Bimestral', TRIMESTRAL:'Trimestral', SEMESTRAL:'Semestral', ANUAL:'Anual' }
const blank = { cliente_id:'', proposta_id:'', ordem_servico_id:'', usina_id:'', titulo:'', descricao:'', status:'RASCUNHO', data_emissao:new Date().toISOString().slice(0,10), data_assinatura:'', inicio_vigencia:'', fim_vigencia:'', renovacao_automatica:false, periodicidade_cobranca:'MENSAL', dia_vencimento:'', valor:'0', observacoes:'' }

export default function ContratosPage() {
  const { profile } = useAuth()
  const { empresaAtual, empresas, loading: empresaLoading } = useEmpresa()
  const [rows,setRows]=useState([]), [clientes,setClientes]=useState([]), [propostas,setPropostas]=useState([]), [ordens,setOrdens]=useState([]), [usinas,setUsinas]=useState([])
  const [search,setSearch]=useState(''), [form,setForm]=useState(blank), [editing,setEditing]=useState(null), [modalOpen,setModalOpen]=useState(false)
  const [loading,setLoading]=useState(true), [saving,setSaving]=useState(false), [error,setError]=useState('')

  async function load() {
    if (!profile?.organizacao_id || !empresaAtual?.id) { setRows([]); setLoading(false); return }
    setLoading(true); setError('')
    const {data,error:e}=await supabase.from('contratos').select('id,numero,cliente_id,proposta_id,ordem_servico_id,usina_id,titulo,descricao,status,data_emissao,data_assinatura,inicio_vigencia,fim_vigencia,renovacao_automatica,periodicidade_cobranca,dia_vencimento,valor,observacoes').eq('organizacao_id',profile.organizacao_id).eq('empresa_id',empresaAtual.id).order('numero',{ascending:false})
    if(e)setError(e.message); else setRows(data??[])
    setLoading(false)
  }

  async function loadOptions() {
    if(!profile?.organizacao_id || !empresaAtual?.id) return
    const [c,p,o,u]=await Promise.all([
      supabase.from('parceiros').select('id,nome_razao_social,parceiro_papeis!inner(papel)').eq('organizacao_id',profile.organizacao_id).eq('ativo',true).eq('parceiro_papeis.papel','CLIENTE').order('nome_razao_social'),
      supabase.from('propostas').select('id,numero,cliente_id,status').eq('organizacao_id',profile.organizacao_id).eq('empresa_id',empresaAtual.id).eq('status','APROVADA').order('numero',{ascending:false}),
      supabase.from('ordens_servico').select('id,numero,cliente_id,status').eq('organizacao_id',profile.organizacao_id).eq('empresa_id',empresaAtual.id).order('numero',{ascending:false}),
      supabase.from('usinas').select('id,codigo,nome,cliente_id').eq('organizacao_id',profile.organizacao_id).eq('empresa_id',empresaAtual.id).eq('status','OPERANDO').order('nome'),
    ])
    const failure=c.error||p.error||o.error||u.error
    if(failure)setError(failure.message); else {setClientes(c.data??[]);setPropostas(p.data??[]);setOrdens(o.data??[]);setUsinas(u.data??[])}
  }

  useEffect(()=>{load()},[profile?.organizacao_id,empresaAtual?.id])
  useEffect(()=>{loadOptions()},[profile?.organizacao_id,empresaAtual?.id])

  const visible=useMemo(()=>{
    const q=search.trim().toLocaleLowerCase('pt-BR')
    return rows.filter(r=>!q||[r.numero,r.titulo,statusLabel[r.status],clientes.find(c=>c.id===r.cliente_id)?.nome_razao_social].filter(Boolean).some(v=>String(v).toLocaleLowerCase('pt-BR').includes(q)))
  },[rows,search,clientes])

  function open(row=null){
    setEditing(row?.id??null)
    setForm(row ? {
      ...blank, id: row.id, ...row, data_assinatura:row.data_assinatura??'', inicio_vigencia:row.inicio_vigencia??'', fim_vigencia:row.fim_vigencia??'', proposta_id:row.proposta_id??'', ordem_servico_id:row.ordem_servico_id??'', usina_id:row.usina_id??'', dia_vencimento:row.dia_vencimento??'', valor:String(row.valor??0), descricao:row.descricao??'', observacoes:row.observacoes??''
    } : {...blank})
    setError(''); setModalOpen(true)
  }
  function close(){setModalOpen(false);setEditing(null);setForm({...blank});setError('')}

  function change(e){ const {name,value,type,checked}=e.target; setForm(cur=>({...cur,[name]:type==='checkbox'?checked:value})) }
  const clientName=id=>clientes.find(c=>c.id===id)?.nome_razao_social||'—'

  async function save(e){
    e.preventDefault(); setError('')
    if(!form.cliente_id){setError('Selecione o cliente.');return}
    if(!form.titulo.trim()){setError('Informe o título do contrato.');return}
    if(form.data_assinatura && form.data_assinatura<form.data_emissao){setError('A data de assinatura não pode ser anterior à emissão.');return}
    if(form.inicio_vigencia && form.fim_vigencia && form.fim_vigencia<form.inicio_vigencia){setError('O fim da vigência não pode ser anterior ao início.');return}
    if(['ASSINADO','ATIVO','SUSPENSO','ENCERRADO'].includes(form.status)&&!form.data_assinatura){setError('Informe a data de assinatura para um contrato já assinado.');return}
    const valor=Number(String(form.valor).replace(',','.'))
    if(!Number.isFinite(valor)||valor<0){setError('Informe um valor válido.');return}
    setSaving(true)
    const payload={organizacao_id:profile.organizacao_id,empresa_id:empresaAtual.id,cliente_id:form.cliente_id,proposta_id:form.proposta_id||null,ordem_servico_id:form.ordem_servico_id||null,usina_id:form.usina_id||null,titulo:form.titulo.trim(),descricao:form.descricao.trim()||null,status:form.status,data_emissao:form.data_emissao,data_assinatura:form.data_assinatura||null,inicio_vigencia:form.inicio_vigencia||null,fim_vigencia:form.fim_vigencia||null,renovacao_automatica:Boolean(form.renovacao_automatica),periodicidade_cobranca:form.periodicidade_cobranca||null,dia_vencimento:form.dia_vencimento?Number(form.dia_vencimento):null,valor,observacoes:form.observacoes.trim()||null}
    const result=editing?await supabase.from('contratos').update(payload).eq('id',editing).eq('empresa_id',empresaAtual.id).select('id').single():await supabase.from('contratos').insert(payload).select('id').single()
    setSaving(false)
    if(result.error){setError(result.error.message);return}
    close(); await load()
  }

  async function remove(id){ if(!window.confirm('Excluir este contrato? Esta ação não poderá ser desfeita.'))return; const {error:e}=await supabase.from('contratos').delete().eq('id',id); if(e)setError(e.message); else await load() }

  if(empresaLoading)return <div className="surface-card p-6 text-sm text-slate-500">Carregando contexto da empresa...</div>
  if(!empresas.length||!empresaAtual)return <div className="surface-card p-6"><h2 className="page-title">Contratos</h2><p className="mt-2 text-sm text-slate-600">Cadastre e selecione uma empresa antes de trabalhar com contratos.</p></div>

  return <section className="space-y-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-green">Serviços · empresa atual</p><h2 className="page-title mt-1">Contratos</h2><p className="page-subtitle">Contratos licenciáveis, preparados para futura cobrança recorrente.</p></div><button onClick={()=>open()} className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white"><Plus size={17}/> Novo contrato</button></div>
    <div className="surface-card p-4"><label className="relative block max-w-xl"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por número, cliente, título ou status..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:bg-white"/></label></div>
    {error&&!modalOpen?<div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>:null}
    <div className="surface-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500"><tr>{['Código','Cliente','Título','Vigência','Cobrança','Valor','Status','Ações'].map(h=><th key={h} className="px-5 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{loading?<tr><td colSpan="8" className="p-8 text-center text-slate-500">Carregando contratos...</td></tr>:visible.length===0?<tr><td colSpan="8" className="p-10 text-center"><FileSignature className="mx-auto h-8 w-8 text-slate-300"/><p className="mt-2 font-medium text-navy-900">Nenhum contrato cadastrado</p></td></tr>:visible.map(r=><tr key={r.id} className="hover:bg-slate-50/60"><td className="px-5 py-3 font-semibold text-navy-900">CTR-{r.numero}</td><td className="px-5 py-3">{clientName(r.cliente_id)}</td><td className="px-5 py-3 font-medium text-navy-900">{r.titulo}</td><td className="px-5 py-3 text-slate-600">{r.inicio_vigencia?formatDate(r.inicio_vigencia):'—'}{r.fim_vigencia?' → '+formatDate(r.fim_vigencia):''}</td><td className="px-5 py-3 text-slate-600">{periodicidadeLabel[r.periodicidade_cobranca]||'—'}{r.dia_vencimento?' · dia '+r.dia_vencimento:''}</td><td className="px-5 py-3 font-medium">{formatCurrency(r.valor)}</td><td className="px-5 py-3"><StatusBadge tone={statusTone[r.status]??'slate'}>{statusLabel[r.status]??r.status}</StatusBadge></td><td className="px-5 py-3 text-right"><button onClick={()=>open(r)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Editar contrato"><Edit3 size={16}/></button><button onClick={()=>remove(r.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label="Excluir contrato"><Trash2 size={16}/></button></td></tr>)}</tbody></table></div></div>
    <ContractModal open={modalOpen} form={form} setForm={setForm} change={change} clientes={clientes} propostas={propostas} ordens={ordens} usinas={usinas} saving={saving} error={error} onClose={close} onSave={save}/>
  </section>
}

function ContractModal({open,form,change,clientes,propostas,ordens,usinas,saving,error,onClose,onSave}){
  if(!open)return null
  const selectedClient=form.cliente_id
  const clientProposals=propostas.filter(p=>p.cliente_id===selectedClient)
  const clientOrders=ordens.filter(o=>o.cliente_id===selectedClient)
  const clientUsinas=usinas.filter(u=>!u.cliente_id||u.cliente_id===selectedClient)
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm"><form onSubmit={onSave} className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4"><div><h3 className="text-lg font-semibold text-navy-900">{form.id?'Editar contrato':'Novo contrato'}</h3><p className="text-xs text-slate-500">Recurso licenciado de Serviços</p></div><button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button></div>
    <div className="space-y-5 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField id="cliente_id" label="Cliente"><select id="cliente_id" name="cliente_id" required value={form.cliente_id} onChange={change} className={fieldClassName(false)}><option value="">Selecione</option>{clientes.map(c=><option key={c.id} value={c.id}>{c.nome_razao_social}</option>)}</select></FormField>
        <FormField id="titulo" label="Título"><input id="titulo" name="titulo" required value={form.titulo} onChange={change} className={fieldClassName(false)} placeholder="Ex.: Manutenção preventiva da usina"/></FormField>
        <FormField id="status" label="Status"><select id="status" name="status" value={form.status} onChange={change} className={fieldClassName(false)}>{Object.entries(statusLabel).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></FormField>
        <FormField id="data_emissao" label="Data de emissão"><input id="data_emissao" name="data_emissao" type="date" value={form.data_emissao} onChange={change} className={fieldClassName(false)}/></FormField>
        <FormField id="proposta_id" label="Proposta aprovada (opcional)"><select id="proposta_id" name="proposta_id" value={form.proposta_id} onChange={change} className={fieldClassName(false)}><option value="">Sem proposta de origem</option>{clientProposals.map(p=><option key={p.id} value={p.id}>PROP-{p.numero}</option>)}</select></FormField>
        <FormField id="ordem_servico_id" label="Ordem de Serviço (opcional)"><select id="ordem_servico_id" name="ordem_servico_id" value={form.ordem_servico_id} onChange={change} className={fieldClassName(false)}><option value="">Sem OS de origem</option>{clientOrders.map(o=><option key={o.id} value={o.id}>OS-{o.numero} · {statusLabel[o.status]||o.status}</option>)}</select></FormField>
        <FormField id="usina_id" label="Usina (opcional)"><select id="usina_id" name="usina_id" value={form.usina_id} onChange={change} className={fieldClassName(false)}><option value="">Sem usina vinculada</option>{clientUsinas.map(u=><option key={u.id} value={u.id}>{u.codigo} · {u.nome}</option>)}</select></FormField>
        <FormField id="data_assinatura" label="Data de assinatura"><input id="data_assinatura" name="data_assinatura" type="date" value={form.data_assinatura} onChange={change} className={fieldClassName(false)}/></FormField>
        <FormField id="inicio_vigencia" label="Início da vigência"><input id="inicio_vigencia" name="inicio_vigencia" type="date" value={form.inicio_vigencia} onChange={change} className={fieldClassName(false)}/></FormField>
        <FormField id="fim_vigencia" label="Fim da vigência"><input id="fim_vigencia" name="fim_vigencia" type="date" value={form.fim_vigencia} onChange={change} className={fieldClassName(false)}/></FormField>
        <FormField id="periodicidade_cobranca" label="Periodicidade de cobrança"><select id="periodicidade_cobranca" name="periodicidade_cobranca" value={form.periodicidade_cobranca} onChange={change} className={fieldClassName(false)}>{Object.entries(periodicidadeLabel).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></FormField>
        <FormField id="dia_vencimento" label="Dia de vencimento"><input id="dia_vencimento" name="dia_vencimento" type="number" min="1" max="31" value={form.dia_vencimento} onChange={change} className={fieldClassName(false)} placeholder="Ex.: 10"/></FormField>
        <FormField id="valor" label="Valor"><input id="valor" name="valor" inputMode="decimal" value={form.valor} onChange={change} className={fieldClassName(false)} placeholder="0,00"/></FormField>
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700"><input type="checkbox" name="renovacao_automatica" checked={form.renovacao_automatica} onChange={change} className="h-4 w-4 rounded border-slate-300"/> Renovação automática</label>
        <div className="md:col-span-2"><FormField id="descricao" label="Descrição"><textarea id="descricao" name="descricao" rows="3" value={form.descricao} onChange={change} className={fieldClassName(false)} /></FormField></div>
        <div className="md:col-span-2"><FormField id="observacoes" label="Observações"><textarea id="observacoes" name="observacoes" rows="3" value={form.observacoes} onChange={change} className={fieldClassName(false)} /></FormField></div>
      </div>
      <div className="rounded-xl border border-solar-yellow/40 bg-solar-yellow/10 px-4 py-3 text-xs leading-relaxed text-slate-700"><strong>Preparação para faturamento:</strong> este cadastro registra vigência, assinatura, periodicidade, vencimento e valor. Em etapa futura, um contrato assinado/ativo poderá gerar eventos de cobrança e, se contratado, disponibilizar emissão de documentos fiscais.</div>
      {error?<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>:null}
    </div>
    <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Cancelar</button><button disabled={saving} className="rounded-xl bg-navy-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving?'Salvando...':'Salvar contrato'}</button></div>
  </form></div>
}
