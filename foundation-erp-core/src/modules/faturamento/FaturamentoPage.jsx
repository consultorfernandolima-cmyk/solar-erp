import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, CircleDollarSign, Edit3, Plus, Receipt, Search, Trash2, X } from 'lucide-react'
import { StatusBadge, formatCurrency, formatDate } from '../../components/ui.jsx'
import FormField, { fieldClassName } from '../../components/FormField.jsx'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { useEmpresa } from '../../context/EmpresaProvider.jsx'

const statusLabel = { RASCUNHO:'Rascunho', ABERTO:'Em aberto', PARCIAL:'Parcial', PAGO:'Pago', CANCELADO:'Cancelado' }
const statusTone = { RASCUNHO:'slate', ABERTO:'yellow', PARCIAL:'yellow', PAGO:'green', CANCELADO:'slate' }
const blank = { cliente_id:'', contrato_id:'', ordem_servico_id:'', proposta_id:'', competencia:new Date().toISOString().slice(0,10), emissao:new Date().toISOString().slice(0,10), descricao:'', valor_bruto:'0', desconto:'0', acrescimos:'0', observacoes:'', parcelas:'1', primeiro_vencimento:new Date().toISOString().slice(0,10) }

export default function FaturamentoPage() {
  const { profile } = useAuth()
  const { empresaAtual, empresas, loading: empresaLoading } = useEmpresa()
  const [rows,setRows]=useState([]),[clientes,setClientes]=useState([]),[contratos,setContratos]=useState([]),[ordens,setOrdens]=useState([]),[propostas,setPropostas]=useState([])
  const [search,setSearch]=useState(''),[form,setForm]=useState(blank),[editing,setEditing]=useState(null),[modalOpen,setModalOpen]=useState(false)
  const [parcelas,setParcelas]=useState(null),[parcelaModal,setParcelaModal]=useState(false)
  const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState('')

  async function load(){
    if(!profile?.organizacao_id||!empresaAtual?.id){setRows([]);setLoading(false);return}
    setLoading(true);setError('')
    const {data,error:e}=await supabase.from('faturamentos').select('id,numero,cliente_id,contrato_id,ordem_servico_id,proposta_id,competencia,emissao,descricao,valor_bruto,desconto,acrescimos,valor_total,status,observacoes').eq('organizacao_id',profile.organizacao_id).eq('empresa_id',empresaAtual.id).order('numero',{ascending:false})
    if(e)setError(e.message);else setRows(data??[]);setLoading(false)
  }
  async function loadOptions(){
    if(!profile?.organizacao_id||!empresaAtual?.id)return
    const [c,k,o,p]=await Promise.all([
      supabase.from('parceiros').select('id,nome_razao_social,parceiro_papeis!inner(papel)').eq('organizacao_id',profile.organizacao_id).eq('ativo',true).eq('parceiro_papeis.papel','CLIENTE').order('nome_razao_social'),
      supabase.from('contratos').select('id,numero,cliente_id,titulo,valor,status').eq('organizacao_id',profile.organizacao_id).eq('empresa_id',empresaAtual.id).in('status',['ASSINADO','ATIVO']).order('numero',{ascending:false}),
      supabase.from('ordens_servico').select('id,numero,cliente_id,descricao,status,cliente_aprovou').eq('organizacao_id',profile.organizacao_id).eq('empresa_id',empresaAtual.id).eq('cliente_aprovou',true).order('numero',{ascending:false}),
      supabase.from('propostas').select('id,numero,cliente_id,observacoes,status').eq('organizacao_id',profile.organizacao_id).eq('empresa_id',empresaAtual.id).eq('status','APROVADA').order('numero',{ascending:false}),
    ])
    const failure=c.error||k.error||o.error||p.error
    if(failure)setError(failure.message);else{setClientes(c.data??[]);setContratos(k.data??[]);setOrdens(o.data??[]);setPropostas(p.data??[])}
  }
  useEffect(()=>{load()},[profile?.organizacao_id,empresaAtual?.id])
  useEffect(()=>{loadOptions()},[profile?.organizacao_id,empresaAtual?.id])

  const visible=useMemo(()=>{const q=search.trim().toLocaleLowerCase('pt-BR');return rows.filter(r=>!q||[r.numero,r.descricao,statusLabel[r.status],clientes.find(c=>c.id===r.cliente_id)?.nome_razao_social].filter(Boolean).some(v=>String(v).toLocaleLowerCase('pt-BR').includes(q)))},[rows,search,clientes])
  const clientName=id=>clientes.find(c=>c.id===id)?.nome_razao_social||'—'
  const change=e=>{const{name,value}=e.target;setForm(f=>{if(name==='cliente_id')return {...f,cliente_id:value,contrato_id:'',ordem_servico_id:'',proposta_id:''};return {...f,[name]:value}})}
  const close=()=>{setModalOpen(false);setEditing(null);setForm({...blank});setError('')}
  function open(row=null){
    setEditing(row?.id??null)
    setForm(row?{...blank,...row,valor_bruto:String(row.valor_bruto??0),desconto:String(row.desconto??0),acrescimos:String(row.acrescimos??0),parcelas:'1'}:{...blank})
    setError('');setModalOpen(true)
  }

  async function save(e){
    e.preventDefault();setError('')
    if(!form.cliente_id||!form.descricao.trim()){setError('Informe cliente e descrição.');return}
    const bruto=Number(String(form.valor_bruto).replace(',','.')),desconto=Number(String(form.desconto).replace(',','.')),acrescimos=Number(String(form.acrescimos).replace(',','.')),n=Number(form.parcelas)
    const total=bruto-desconto+acrescimos
    if(![bruto,desconto,acrescimos,total].every(Number.isFinite)||bruto<0||desconto<0||desconto>bruto||acrescimos<0||total<0){setError('Confira os valores do faturamento.');return}
    if(!form.contrato_id&&!form.ordem_servico_id&&!form.proposta_id){setError('Vincule contrato, OS aprovada ou proposta aprovada.');return}
    if(!editing&&(!Number.isInteger(n)||n<1||n>120)){setError('Informe de 1 a 120 parcelas.');return}
    setSaving(true)
    const payload={organizacao_id:profile.organizacao_id,empresa_id:empresaAtual.id,cliente_id:form.cliente_id,contrato_id:form.contrato_id||null,ordem_servico_id:form.ordem_servico_id||null,proposta_id:form.proposta_id||null,competencia:form.competencia,emissao:form.emissao,descricao:form.descricao.trim(),valor_bruto:bruto,desconto,acrescimos,status:editing?undefined:'RASCUNHO',observacoes:form.observacoes.trim()||null}
    let result
    if(editing){delete payload.status;result=await supabase.from('faturamentos').update(payload).eq('id',editing).eq('empresa_id',empresaAtual.id).select('id').single()}
    else result=await supabase.from('faturamentos').insert(payload).select('id').single()
    if(result.error){setSaving(false);setError(result.error.message);return}
    if(!editing){
      const id=result.data.id
      const base=Math.floor((total/n)*100)/100
      const rest=Math.round((total-base*(n-1))*100)/100
      const first=new Date(form.primeiro_vencimento+'T12:00:00')
      const items=Array.from({length:n},(_,i)=>{const d=new Date(first);const targetMonth=d.getMonth()+i;const targetYear=d.getFullYear()+Math.floor(targetMonth/12);const monthIndex=((targetMonth%12)+12)%12;const lastDay=new Date(targetYear,monthIndex+1,0).getDate();d.setFullYear(targetYear,monthIndex,Math.min(first.getDate(),lastDay));return{faturamento_id:id,numero_parcela:i+1,vencimento:d.toISOString().slice(0,10),valor:i===n-1?rest:base}})
      const pr=await supabase.from('faturamento_parcelas').insert(items)
      if(pr.error){await supabase.from('faturamentos').delete().eq('id',id);setSaving(false);setError(pr.error.message);return}
      const up=await supabase.from('faturamentos').update({status:'ABERTO'}).eq('id',id)
      if(up.error){setSaving(false);setError(up.error.message);return}
    }
    setSaving(false);close();await load()
  }

  async function remove(id){if(!window.confirm('Excluir este faturamento em rascunho?'))return;const{error:e}=await supabase.from('faturamentos').delete().eq('id',id);if(e)setError(e.message);else await load()}
  async function showParcelas(row){setError('');const{data,error:e}=await supabase.from('faturamento_parcelas').select('*').eq('faturamento_id',row.id).order('numero_parcela');if(e)setError(e.message);else{setParcelas({faturamento:row,items:data??[]});setParcelaModal(true)}}

  async function receber(item){
    const data=window.prompt('Data do recebimento (AAAA-MM-DD):',new Date().toISOString().slice(0,10));if(!data)return
    const forma=window.prompt('Forma de recebimento (ex.: PIX, TED, boleto):','PIX');if(!forma)return
    const{error:e}=await supabase.from('faturamento_parcelas').update({status:'PAGA',data_recebimento:data,valor_recebido:item.valor,forma_recebimento:forma}).eq('id',item.id)
    if(e){setError(e.message);return}
    const{data:all,error:ae}=await supabase.from('faturamento_parcelas').select('status').eq('faturamento_id',item.faturamento_id)
    if(!ae){const status=all.every(p=>p.status==='PAGA')?'PAGO':all.some(p=>p.status==='PAGA')?'PARCIAL':'ABERTO';await supabase.from('faturamentos').update({status}).eq('id',item.faturamento_id)}
    await showParcelas(parcelas.faturamento);await load()
  }

  if(empresaLoading)return <div className="surface-card p-6 text-sm text-slate-500">Carregando contexto da empresa...</div>
  if(!empresas.length||!empresaAtual)return <div className="surface-card p-6"><h2 className="page-title">Faturamento</h2><p className="mt-2 text-sm text-slate-600">Cadastre e selecione uma empresa antes de faturar.</p></div>

  return <section className="space-y-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-green">Financeiro · empresa atual</p><h2 className="page-title mt-1">Faturamento</h2><p className="page-subtitle">Gere cobranças, parcelas e registre recebimentos a partir de eventos comerciais ou de serviços aprovados.</p></div><button onClick={()=>open()} className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white"><Plus size={17}/> Novo faturamento</button></div>
    <div className="surface-card p-4"><label className="relative block max-w-xl"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por número, cliente, descrição ou status..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:bg-white"/></label></div>
    {error&&!modalOpen&&!parcelaModal?<div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>:null}
    <div className="surface-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500"><tr>{['Código','Cliente','Descrição','Competência','Valor','Status','Ações'].map(h=><th key={h} className="px-5 py-3">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{loading?<tr><td colSpan="7" className="p-8 text-center text-slate-500">Carregando faturamentos...</td></tr>:visible.length===0?<tr><td colSpan="7" className="p-10 text-center"><Receipt className="mx-auto h-8 w-8 text-slate-300"/><p className="mt-2 font-medium text-navy-900">Nenhum faturamento cadastrado</p></td></tr>:visible.map(r=><tr key={r.id} className="hover:bg-slate-50/60"><td className="px-5 py-3 font-semibold text-navy-900">FAT-{r.numero}</td><td className="px-5 py-3">{clientName(r.cliente_id)}</td><td className="px-5 py-3 font-medium text-navy-900">{r.descricao}</td><td className="px-5 py-3 text-slate-600">{formatDate(r.competencia)}</td><td className="px-5 py-3 font-medium">{formatCurrency(r.valor_total)}</td><td className="px-5 py-3"><StatusBadge tone={statusTone[r.status]??'slate'}>{statusLabel[r.status]??r.status}</StatusBadge></td><td className="px-5 py-3 text-right"><button onClick={()=>showParcelas(r)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Ver parcelas"><CalendarDays size={16}/></button>{r.status==='RASCUNHO'&&<><button onClick={()=>open(r)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Editar faturamento"><Edit3 size={16}/></button><button onClick={()=>remove(r.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label="Excluir faturamento"><Trash2 size={16}/></button></>}</td></tr>)}</tbody></table></div></div>
    <BillingModal open={modalOpen} form={form} change={change} clientes={clientes} contratos={contratos} ordens={ordens} propostas={propostas} saving={saving} error={error} onClose={close} onSave={save}/>
    <ParcelModal open={parcelaModal} data={parcelas} error={error} onClose={()=>setParcelaModal(false)} onReceive={receber}/>
  </section>
}

function BillingModal({open,form,change,clientes,contratos,ordens,propostas,saving,error,onClose,onSave}){
 if(!open)return null
 const client= form.cliente_id
 const list=(items,key='cliente_id')=>items.filter(x=>x[key]===client)
 return <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm"><form onSubmit={onSave} className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4"><div><h3 className="text-lg font-semibold text-navy-900">{form.id?'Editar faturamento':'Novo faturamento'}</h3><p className="text-xs text-slate-500">Cobrança operacional · sem emissão fiscal automática</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button></div><div className="space-y-5 p-6"><div className="grid gap-4 md:grid-cols-2">
 <FormField id="cliente_id" label="Cliente"><select id="cliente_id" name="cliente_id" required value={form.cliente_id} onChange={change} className={fieldClassName(false)}><option value="">Selecione</option>{clientes.map(c=><option key={c.id} value={c.id}>{c.nome_razao_social}</option>)}</select></FormField>
 <FormField id="descricao" label="Descrição"><input id="descricao" name="descricao" required value={form.descricao} onChange={change} className={fieldClassName(false)} placeholder="Ex.: Mensalidade contrato de manutenção"/></FormField>
 <FormField id="contrato_id" label="Contrato assinado/ativo"><select id="contrato_id" name="contrato_id" value={form.contrato_id} onChange={change} className={fieldClassName(false)}><option value="">Sem contrato</option>{list(contratos).map(c=><option key={c.id} value={c.id}>CTR-{c.numero} · {c.titulo}</option>)}</select></FormField>
 <FormField id="ordem_servico_id" label="OS aprovada pelo cliente"><select id="ordem_servico_id" name="ordem_servico_id" value={form.ordem_servico_id} onChange={change} className={fieldClassName(false)}><option value="">Sem OS</option>{list(ordens).map(o=><option key={o.id} value={o.id}>OS-{o.numero}</option>)}</select></FormField>
 <FormField id="proposta_id" label="Proposta aprovada"><select id="proposta_id" name="proposta_id" value={form.proposta_id} onChange={change} className={fieldClassName(false)}><option value="">Sem proposta</option>{list(propostas).map(p=><option key={p.id} value={p.id}>PROP-{p.numero}</option>)}</select></FormField>
 <FormField id="competencia" label="Competência"><input id="competencia" name="competencia" type="date" value={form.competencia} onChange={change} className={fieldClassName(false)}/></FormField>
 <FormField id="emissao" label="Data de emissão"><input id="emissao" name="emissao" type="date" value={form.emissao} onChange={change} className={fieldClassName(false)}/></FormField>
 <FormField id="valor_bruto" label="Valor bruto"><input id="valor_bruto" name="valor_bruto" inputMode="decimal" value={form.valor_bruto} onChange={change} className={fieldClassName(false)} placeholder="0,00"/></FormField>
 <FormField id="desconto" label="Desconto"><input id="desconto" name="desconto" inputMode="decimal" value={form.desconto} onChange={change} className={fieldClassName(false)} placeholder="0,00"/></FormField>
 <FormField id="acrescimos" label="Acréscimos"><input id="acrescimos" name="acrescimos" inputMode="decimal" value={form.acrescimos} onChange={change} className={fieldClassName(false)} placeholder="0,00"/></FormField>
 {!form.id&&<><FormField id="parcelas" label="Quantidade de parcelas"><input id="parcelas" name="parcelas" type="number" min="1" max="120" value={form.parcelas} onChange={change} className={fieldClassName(false)}/></FormField><FormField id="primeiro_vencimento" label="Primeiro vencimento"><input id="primeiro_vencimento" name="primeiro_vencimento" type="date" value={form.primeiro_vencimento} onChange={change} className={fieldClassName(false)}/></FormField></>}
 <div className="md:col-span-2"><FormField id="observacoes" label="Observações"><textarea id="observacoes" name="observacoes" rows="3" value={form.observacoes} onChange={change} className={fieldClassName(false)}/></FormField></div>
 </div><div className="rounded-xl border border-solar-yellow/40 bg-solar-yellow/10 px-4 py-3 text-xs leading-relaxed text-slate-700"><strong>Regra de origem:</strong> o banco só permite faturar contrato assinado/ativo, OS com aprovação do cliente ou proposta aprovada. Isso impede cobrança baseada apenas em cadastro operacional.</div>{error?<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>:null}</div><div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Cancelar</button><button disabled={saving} className="rounded-xl bg-navy-900 px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving?'Salvando...':'Salvar faturamento'}</button></div></form></div>
}

function ParcelModal({open,data,error,onClose,onReceive}){
 if(!open||!data)return null
 const total=data.items.reduce((s,p)=>s+Number(p.valor),0),received=data.items.reduce((s,p)=>s+Number(p.valor_recebido||0),0)
 return <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm"><div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-4"><div><h3 className="text-lg font-semibold text-navy-900">FAT-{data.faturamento.numero} · Parcelas</h3><p className="text-xs text-slate-500">{data.faturamento.descricao} · {formatCurrency(total)} · recebido {formatCurrency(received)}</p></div><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button></div><div className="p-6">{error?<div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>:null}<div className="overflow-x-auto"><table className="w-full text-sm"><thead className="border-b border-slate-100 text-xs uppercase text-slate-500"><tr><th className="px-3 py-3 text-left">Parcela</th><th className="px-3 py-3 text-left">Vencimento</th><th className="px-3 py-3 text-right">Valor</th><th className="px-3 py-3 text-left">Status</th><th className="px-3 py-3 text-left">Recebimento</th><th/></tr></thead><tbody className="divide-y divide-slate-100">{data.items.map(p=><tr key={p.id}><td className="px-3 py-3 font-medium">{p.numero_parcela}</td><td className="px-3 py-3">{formatDate(p.vencimento)}</td><td className="px-3 py-3 text-right">{formatCurrency(p.valor)}</td><td className="px-3 py-3"><StatusBadge tone={p.status==='PAGA'?'green':p.status==='CANCELADA'?'slate':'yellow'}>{p.status==='PAGA'?'Paga':p.status==='CANCELADA'?'Cancelada':'Aberta'}</StatusBadge></td><td className="px-3 py-3">{p.data_recebimento?formatDate(p.data_recebimento)+' · '+(p.forma_recebimento||''): '—'}</td><td className="px-3 py-3 text-right">{p.status==='ABERTA'&&<button onClick={()=>onReceive(p)} className="inline-flex items-center gap-1 rounded-lg bg-navy-900 px-3 py-1.5 text-xs font-semibold text-white"><CircleDollarSign size={14}/> Receber</button>}</td></tr>)}</tbody></table></div></div><div className="flex justify-end border-t border-slate-100 px-6 py-4"><button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">Fechar</button></div></div></div>
}
