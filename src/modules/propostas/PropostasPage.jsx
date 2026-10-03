import { useEffect, useMemo, useState } from 'react'
import { Edit3, FileText, Plus, Search, Trash2, X } from 'lucide-react'
import { StatusBadge, formatCurrency, formatDate } from '../../components/ui.jsx'
import FormField, { fieldClassName } from '../../components/FormField.jsx'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { useEmpresa } from '../../context/EmpresaProvider.jsx'

const statusLabel={EM_ELABORACAO:'Em elaboração',ENVIADA:'Enviada',NEGOCIACAO:'Negociação',APROVADA:'Aprovada',RECUSADA:'Recusada',CANCELADA:'Cancelada'}
const tone={EM_ELABORACAO:'slate',ENVIADA:'navy',NEGOCIACAO:'yellow',APROVADA:'green',RECUSADA:'slate',CANCELADA:'slate'}
const blank={cliente_id:'',data_emissao:new Date().toISOString().slice(0,10),validade:'',status:'EM_ELABORACAO',observacoes:''}
const emptyItem=()=>({id:'',produto_id:'',quantidade:'1',valor_unitario:'',desconto:'0',observacoes:''})
const money=v=>Number(String(v??'').replace(',','.'))||0
const itemTotal=i=>Math.max(0,money(i.quantidade)*money(i.valor_unitario)-money(i.desconto))

export default function PropostasPage(){
 const {profile}=useAuth(); const {empresaAtual,empresas,loading:empresaLoading}=useEmpresa()
 const [rows,setRows]=useState([]),[clientes,setClientes]=useState([]),[produtos,setProdutos]=useState([]),[search,setSearch]=useState(''),[form,setForm]=useState(blank),[items,setItems]=useState([emptyItem()]),[editing,setEditing]=useState(null),[modalOpen,setModalOpen]=useState(false),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState('')
 async function load(){
  if(!profile?.organizacao_id||!empresaAtual?.id){setRows([]);setLoading(false);return}
  setLoading(true);setError('')
  const {data,error:e}=await supabase.from('propostas').select('id,numero,cliente_id,data_emissao,validade,status,observacoes,proposta_itens(id,quantidade,valor_unitario,desconto)').eq('organizacao_id',profile.organizacao_id).eq('empresa_id',empresaAtual.id).order('numero',{ascending:false})
  if(e)setError(e.message);else setRows(data??[]);setLoading(false)
 }
 async function loadCatalog(){
  if(!profile?.organizacao_id)return
  const [c,p]=await Promise.all([
   supabase.from('parceiros').select('id,nome_razao_social,parceiro_papeis!inner(papel)').eq('organizacao_id',profile.organizacao_id).eq('ativo',true).eq('parceiro_papeis.papel','CLIENTE').order('nome_razao_social'),
   supabase.from('produtos_servicos').select('id,codigo,nome,tipo,ativo').eq('organizacao_id',profile.organizacao_id).eq('ativo',true).order('nome')
  ])
  const failure=c.error||p.error;if(failure)setError(failure.message);else{setClientes(c.data??[]);setProdutos(p.data??[])}
 }
 useEffect(()=>{load()},[profile?.organizacao_id,empresaAtual?.id])
 useEffect(()=>{loadCatalog()},[profile?.organizacao_id])
 const visible=useMemo(()=>{const q=search.trim().toLocaleLowerCase('pt-BR');return rows.filter(r=>!q||[r.numero,statusLabel[r.status],clientes.find(c=>c.id===r.cliente_id)?.nome_razao_social].filter(Boolean).some(v=>String(v).toLocaleLowerCase('pt-BR').includes(q)))},[rows,search,clientes])
 const total=r=>(r.proposta_itens??[]).reduce((s,i)=>s+itemTotal(i),0)
 const formTotal=items.reduce((s,i)=>s+itemTotal(i),0)
 const open=async(r=null)=>{
  setEditing(r?.id??null);setForm(r?{cliente_id:r.cliente_id,data_emissao:r.data_emissao,validade:r.validade??'',status:r.status,observacoes:r.observacoes??''}:{...blank});setItems([emptyItem()]);setError('')
  if(r){const {data,error:e}=await supabase.from('proposta_itens').select('id,produto_id,quantidade,valor_unitario,desconto,observacoes').eq('proposta_id',r.id).order('created_at');if(e)setError(e.message);else setItems(data?.length?data.map(i=>({...i,quantidade:String(i.quantidade),valor_unitario:String(i.valor_unitario),desconto:String(i.desconto??0)})):[emptyItem()])}
  setModalOpen(true)
 }
 const close=()=>{setModalOpen(false);setEditing(null);setForm({...blank});setItems([emptyItem()]);setError('')}
 const updateItem=(index,patch)=>setItems(cur=>cur.map((item,i)=>i===index?{...item,...patch}:item))
 const addItem=()=>setItems(cur=>[...cur,emptyItem()])
 const removeItem=index=>setItems(cur=>cur.length===1?[emptyItem()]:cur.filter((_,i)=>i!==index))
 async function save(e){
  e.preventDefault()
  if(!form.cliente_id){setError('Selecione o cliente.');return}
  if(form.validade&&form.validade<form.data_emissao){setError('A validade não pode ser anterior à emissão.');return}
  const prepared=items.filter(i=>i.produto_id).map(i=>({produto_id:i.produto_id,quantidade:money(i.quantidade),valor_unitario:money(i.valor_unitario),desconto:money(i.desconto),observacoes:i.observacoes?.trim()||null}))
  if(!prepared.length){setError('Inclua pelo menos um produto ou serviço na proposta.');return}
  if(prepared.some(i=>i.quantidade<=0)){setError('A quantidade deve ser maior que zero.');return}
  if(prepared.some(i=>i.valor_unitario<0||i.desconto<0||i.desconto>i.quantidade*i.valor_unitario)){setError('Revise os valores e descontos dos itens.');return}
  setSaving(true);setError('')
  const payload={organizacao_id:profile.organizacao_id,empresa_id:empresaAtual.id,cliente_id:form.cliente_id,data_emissao:form.data_emissao,validade:form.validade||null,status:form.status,observacoes:form.observacoes.trim()||null}
  const result=editing?await supabase.from('propostas').update(payload).eq('id',editing).eq('empresa_id',empresaAtual.id).select('id').single():await supabase.from('propostas').insert(payload).select('id').single()
  if(result.error){setSaving(false);setError(result.error.message);return}
  const proposalId=result.data.id
  const deleted=await supabase.from('proposta_itens').delete().eq('proposta_id',proposalId)
  if(deleted.error){setSaving(false);setError('A proposta foi salva, mas os itens não puderam ser atualizados: '+deleted.error.message);return}
  const inserted=await supabase.from('proposta_itens').insert(prepared.map(i=>({...i,proposta_id:proposalId})))
  setSaving(false);if(inserted.error){setError('A proposta foi salva, mas os itens não puderam ser gravados: '+inserted.error.message);return}
  close();await load()
 }
 async function remove(id){if(!confirm('Excluir esta proposta e seus itens?'))return;const {error:e}=await supabase.from('propostas').delete().eq('id',id);if(e)setError(e.message);else await load()}
 if(empresaLoading)return <div className="surface-card p-6 text-sm text-slate-500">Carregando contexto da empresa...</div>
 if(!empresas.length||!empresaAtual)return <div className="surface-card p-6"><h2 className="page-title">Propostas</h2><p className="mt-2 text-sm text-slate-600">Cadastre e selecione uma empresa antes de trabalhar com propostas.</p></div>
 return <section className="space-y-5">
  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-green">Comércio · empresa atual</p><h2 className="page-title mt-1">Propostas</h2><p className="page-subtitle">Propostas comerciais persistidas, vinculadas a clientes e ao catálogo compartilhado.</p></div><button onClick={()=>open()} className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white"><Plus size={17}/> Nova proposta</button></div>
  <div className="surface-card p-4"><label className="relative block max-w-xl"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por número, cliente ou etapa..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:bg-white"/></label></div>
  {error&&!modalOpen?<div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>:null}
  <div className="surface-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500"><tr>{['Código','Cliente','Emissão','Validade','Valor','Etapa','Ações'].map(h=><th key={h} className="px-5 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{loading?<tr><td colSpan="7" className="p-8 text-center text-slate-500">Carregando propostas...</td></tr>:visible.length===0?<tr><td colSpan="7" className="p-10 text-center"><FileText className="mx-auto h-8 w-8 text-slate-300"/><p className="mt-2 font-medium text-navy-900">Nenhuma proposta cadastrada</p></td></tr>:visible.map(r=><tr key={r.id} className="hover:bg-slate-50/60"><td className="px-5 py-3 font-semibold text-navy-900">PROP-{r.numero}</td><td className="px-5 py-3">{clientes.find(c=>c.id===r.cliente_id)?.nome_razao_social||'—'}</td><td className="px-5 py-3 text-slate-600">{formatDate(r.data_emissao)}</td><td className="px-5 py-3 text-slate-600">{r.validade?formatDate(r.validade):'—'}</td><td className="px-5 py-3 font-medium">{formatCurrency(total(r))}</td><td className="px-5 py-3"><StatusBadge tone={tone[r.status]??'slate'}>{statusLabel[r.status]??r.status}</StatusBadge></td><td className="px-5 py-3 text-right"><button onClick={()=>open(r)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Editar proposta"><Edit3 size={16}/></button><button onClick={()=>remove(r.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label="Excluir proposta"><Trash2 size={16}/></button></td></tr>)}</tbody></table></div></div>
  <ProposalModal open={modalOpen} form={form} setForm={setForm} clientes={clientes} items={items} produtos={produtos} formTotal={formTotal} updateItem={updateItem} addItem={addItem} removeItem={removeItem} saving={saving} error={error} onClose={close} onSave={save} editing={editing}/>
 </section>
}
function ProposalModal({open,form,setForm,clientes,items,produtos,formTotal,updateItem,addItem,removeItem,saving,error,onClose,onSave,editing}){
 if(!open)return null
 return <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm"><form onSubmit={onSave} className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
  <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4"><div><h3 className="text-lg font-semibold text-navy-900">{editing?'Editar proposta':'Nova proposta'}</h3><p className="text-xs text-slate-500">Composição comercial da empresa atual</p></div><button type="button" onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button></div>
  <div className="space-y-6 p-6">
   <div className="grid gap-4 md:grid-cols-2">
    <FormField id="cliente_id" label="Cliente"><select id="cliente_id" required value={form.cliente_id} onChange={e=>setForm({...form,cliente_id:e.target.value})} className={fieldClassName(false)}><option value="">Selecione</option>{clientes.map(c=><option key={c.id} value={c.id}>{c.nome_razao_social}</option>)}</select></FormField>
    <FormField id="status" label="Etapa"><select id="status" value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className={fieldClassName(false)}>{Object.entries(statusLabel).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></FormField>
    <FormField id="data_emissao" label="Data de emissão"><input type="date" id="data_emissao" value={form.data_emissao} onChange={e=>setForm({...form,data_emissao:e.target.value})} className={fieldClassName(false)}/></FormField>
    <FormField id="validade" label="Validade"><input type="date" id="validade" value={form.validade} onChange={e=>setForm({...form,validade:e.target.value})} className={fieldClassName(false)}/></FormField>
   </div>
   <div><div className="mb-3 flex items-center justify-between"><div><h4 className="text-sm font-semibold text-navy-900">Itens da proposta</h4><p className="text-xs text-slate-500">Produtos e serviços do catálogo compartilhado.</p></div><button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-navy-800 hover:bg-slate-50"><Plus size={15}/> Adicionar item</button></div>
    <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[900px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-2">Produto / serviço</th><th className="w-28 px-3 py-2">Qtd.</th><th className="w-36 px-3 py-2">Vlr. unitário</th><th className="w-32 px-3 py-2">Desconto</th><th className="w-36 px-3 py-2 text-right">Total</th><th className="w-10"></th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((item,index)=><tr key={item.id||('new-'+index)}><td className="px-3 py-2"><select required value={item.produto_id} onChange={e=>updateItem(index,{produto_id:e.target.value})} className={fieldClassName(false)}><option value="">Selecione</option>{produtos.map(p=><option key={p.id} value={p.id}>{p.codigo?p.codigo+' — ':''}{p.nome} ({p.tipo==='SERVICO'?'Serviço':'Produto'})</option>)}</select></td><td className="px-3 py-2"><input required min="0.001" step="0.001" type="number" value={item.quantidade} onChange={e=>updateItem(index,{quantidade:e.target.value})} className={fieldClassName(false)}/></td><td className="px-3 py-2"><input required min="0" step="0.01" type="number" value={item.valor_unitario} onChange={e=>updateItem(index,{valor_unitario:e.target.value})} className={fieldClassName(false)}/></td><td className="px-3 py-2"><input min="0" step="0.01" type="number" value={item.desconto} onChange={e=>updateItem(index,{desconto:e.target.value})} className={fieldClassName(false)}/></td><td className="px-3 py-2 text-right font-semibold text-navy-900">{formatCurrency(itemTotal(item))}</td><td className="px-2 py-2"><button type="button" onClick={()=>removeItem(index)} aria-label="Remover item" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15}/></button></td></tr>)}</tbody><tfoot className="border-t border-slate-200 bg-slate-50"><tr><td colSpan="4" className="px-3 py-3 text-right text-sm font-semibold text-slate-600">Total da proposta</td><td className="px-3 py-3 text-right text-base font-bold text-navy-900">{formatCurrency(formTotal)}</td><td></td></tr></tfoot></table></div>
   </div>
   <FormField id="observacoes" label="Observações"><textarea id="observacoes" rows="4" value={form.observacoes} onChange={e=>setForm({...form,observacoes:e.target.value})} className={fieldClassName(false)}/></FormField>
   {error?<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>:null}
  </div>
  <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Cancelar</button><button disabled={saving} className="rounded-xl bg-navy-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving?'Salvando...':'Salvar proposta'}</button></div>
 </form></div>
}