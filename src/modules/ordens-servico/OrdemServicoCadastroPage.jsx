import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import FormField, { fieldClassName } from '../../components/FormField.jsx'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { useEmpresa } from '../../context/EmpresaProvider.jsx'

const initial = {
  cliente_id: '', usina_id: '', tipo: '', descricao: '', prioridade: 'MEDIA', status: 'PENDENTE',
  data_abertura: new Date().toISOString().slice(0, 10), data_agendada: '', data_conclusao: '',
  tecnico_id: '', cliente_aprovou: false, data_aprovacao_cliente: '', observacao_aprovacao_cliente: '', observacoes: '',
}

export default function OrdemServicoCadastroPage() {
  const { profile } = useAuth()
  const { empresaAtual, empresas, loading: empresaLoading } = useEmpresa()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const id = params.get('id')
  const [values, setValues] = useState(initial)
  const [clientes, setClientes] = useState([])
  const [usinas, setUsinas] = useState([])
  const [tecnicos, setTecnicos] = useState([])
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profile?.organizacao_id || !empresaAtual?.id) return
    async function loadOptions() {
      const [clientsResult, usinasResult, techsResult] = await Promise.all([
        supabase.from('parceiros').select('id,nome_razao_social,parceiro_papeis!inner(papel)').eq('organizacao_id', profile.organizacao_id).eq('ativo', true).eq('parceiro_papeis.papel', 'CLIENTE').order('nome_razao_social'),
        supabase.from('usinas').select('id,codigo,nome').eq('organizacao_id', profile.organizacao_id).eq('empresa_id', empresaAtual.id).order('nome'),
        supabase.from('perfis').select('id,nome').eq('organizacao_id', profile.organizacao_id).eq('ativo', true).order('nome'),
      ])
      if (!clientsResult.error) setClientes(clientsResult.data ?? [])
      if (!usinasResult.error) setUsinas(usinasResult.data ?? [])
      if (!techsResult.error) setTecnicos(techsResult.data ?? [])
      const firstError = clientsResult.error || usinasResult.error || techsResult.error
      if (firstError) setError(firstError.message)
    }
    loadOptions()
  }, [profile?.organizacao_id, empresaAtual?.id])

  useEffect(() => {
    if (!id || !profile?.organizacao_id || !empresaAtual?.id) { if (!id) setLoading(false); return }
    async function loadOrder() {
      setLoading(true); setError('')
      const { data, error: queryError } = await supabase.from('ordens_servico')
        .select('cliente_id,usina_id,tipo,descricao,prioridade,status,data_abertura,data_agendada,data_conclusao,tecnico_id,cliente_aprovou,data_aprovacao_cliente,observacao_aprovacao_cliente,observacoes')
        .eq('id', id).eq('organizacao_id', profile.organizacao_id).eq('empresa_id', empresaAtual.id).single()
      if (queryError) setError(queryError.message)
      else setValues({ ...initial, ...data, data_agendada: data.data_agendada ?? '', data_conclusao: data.data_conclusao ?? '', tecnico_id: data.tecnico_id ?? '', usina_id: data.usina_id ?? '', cliente_aprovou: Boolean(data.cliente_aprovou), data_aprovacao_cliente: data.data_aprovacao_cliente ?? '', observacao_aprovacao_cliente: data.observacao_aprovacao_cliente ?? '' })
      setLoading(false)
    }
    loadOrder()
  }, [id, profile?.organizacao_id, empresaAtual?.id])

  function change(event) {
    const { name, value } = event.target
    setValues(current => ({ ...current, [name]: value }))
  }

  async function save(event) {
    event.preventDefault(); setError('')
    if (!profile?.organizacao_id || !empresaAtual?.id) { setError('Selecione uma empresa no cabeçalho antes de salvar.'); return }
    if (!values.cliente_id) { setError('Selecione o cliente.'); return }
    if (!values.tipo.trim()) { setError('Informe o tipo de serviço.'); return }
    if (!values.descricao.trim()) { setError('Informe a descrição do serviço.'); return }
    if (values.data_conclusao && values.data_abertura && values.data_conclusao < values.data_abertura) { setError('A data de conclusão não pode ser anterior à abertura.'); return }

    setSaving(true)
    const payload = {
      organizacao_id: profile.organizacao_id,
      empresa_id: empresaAtual.id,
      cliente_id: values.cliente_id,
      usina_id: values.usina_id || null,
      tipo: values.tipo.trim(),
      descricao: values.descricao.trim(),
      prioridade: values.prioridade,
      status: values.status,
      data_abertura: values.data_abertura || new Date().toISOString().slice(0, 10),
      data_agendada: values.data_agendada || null,
      data_conclusao: values.data_conclusao || null,
      cliente_aprovou: Boolean(values.cliente_aprovou),
      data_aprovacao_cliente: values.cliente_aprovou ? (values.data_aprovacao_cliente || new Date().toISOString().slice(0, 10)) : null,
      observacao_aprovacao_cliente: values.cliente_aprovou ? (values.observacao_aprovacao_cliente.trim() || null) : null,
      tecnico_id: values.tecnico_id || null,
      observacoes: values.observacoes.trim() || null,
    }
    const result = id
      ? await supabase.from('ordens_servico').update(payload).eq('id', id).eq('empresa_id', empresaAtual.id)
      : await supabase.from('ordens_servico').insert(payload)
    if (result.error) setError(result.error.message)
    else navigate('/ordens-servico')
    setSaving(false)
  }

  if (empresaLoading || loading) return <div className="surface-card p-6 text-sm text-slate-500">Carregando cadastro...</div>
  if (!empresas.length || !empresaAtual) return <div className="surface-card p-6"><h2 className="page-title">Cadastro de OS</h2><p className="mt-2 text-sm text-slate-600">Selecione uma empresa atual no cabeçalho antes de cadastrar a OS.</p></div>

  return <section className="space-y-5">
    <div className="flex items-center gap-3"><Link to="/ordens-servico" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link><div><h2 className="page-title">{id ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}</h2><p className="page-subtitle">Empresa: {empresaAtual.nome_fantasia || empresaAtual.razao_social}</p></div></div>
    {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
    <form onSubmit={save} className="surface-card space-y-5 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField id="cliente_id" label="Cliente"><select id="cliente_id" name="cliente_id" value={values.cliente_id} onChange={change} className={fieldClassName(false)}><option value="">Selecione o cliente</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.nome_razao_social}</option>)}</select></FormField>
        <FormField id="usina_id" label="Usina (opcional)"><select id="usina_id" name="usina_id" value={values.usina_id} onChange={change} className={fieldClassName(false)}><option value="">Serviço geral</option>{usinas.map(u => <option key={u.id} value={u.id}>{u.codigo} · {u.nome}</option>)}</select></FormField>
        <FormField id="tipo" label="Tipo de Serviço"><input id="tipo" name="tipo" value={values.tipo} onChange={change} className={fieldClassName(false)} placeholder="Ex.: Limpeza de módulos" /></FormField>
        <FormField id="prioridade" label="Prioridade"><select id="prioridade" name="prioridade" value={values.prioridade} onChange={change} className={fieldClassName(false)}><option value="BAIXA">Baixa</option><option value="MEDIA">Média</option><option value="ALTA">Alta</option><option value="URGENTE">Urgente</option></select></FormField>
        <div className="md:col-span-2"><FormField id="descricao" label="Descrição"><textarea id="descricao" name="descricao" rows="4" value={values.descricao} onChange={change} className={fieldClassName(false)} placeholder="Descreva o atendimento, ocorrência ou atividade prevista." /></FormField></div>
        <FormField id="status" label="Status"><select id="status" name="status" value={values.status} onChange={change} className={fieldClassName(false)}><option value="PENDENTE">Pendente</option><option value="AGENDADA">Agendada</option><option value="EM_EXECUCAO">Em execução</option><option value="CONCLUIDA">Concluída</option><option value="CANCELADA">Cancelada</option></select></FormField>
        <FormField id="tecnico_id" label="Técnico responsável"><select id="tecnico_id" name="tecnico_id" value={values.tecnico_id} onChange={change} className={fieldClassName(false)}><option value="">Não definido</option>{tecnicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}</select></FormField>
        <FormField id="data_abertura" label="Data de Abertura"><input id="data_abertura" name="data_abertura" type="date" value={values.data_abertura} onChange={change} className={fieldClassName(false)} /></FormField>
        <FormField id="data_agendada" label="Data Agendada"><input id="data_agendada" name="data_agendada" type="date" value={values.data_agendada} onChange={change} className={fieldClassName(false)} /></FormField>
        <FormField id="data_conclusao" label="Data de Conclusão"><input id="data_conclusao" name="data_conclusao" type="date" value={values.data_conclusao} onChange={change} className={fieldClassName(false)} /></FormField>
        <div className="md:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-4"><label className="flex items-center gap-3 text-sm font-semibold text-navy-900"><input type="checkbox" name="cliente_aprovou" checked={values.cliente_aprovou} onChange={e => setValues(current => ({ ...current, cliente_aprovou: e.target.checked, data_aprovacao_cliente: e.target.checked ? (current.data_aprovacao_cliente || new Date().toISOString().slice(0, 10)) : '', observacao_aprovacao_cliente: e.target.checked ? current.observacao_aprovacao_cliente : '' }))} className="h-4 w-4 rounded border-slate-300" /> Cliente aprovou a Ordem de Serviço</label>{values.cliente_aprovou ? <div className="mt-3 grid gap-4 md:grid-cols-2"><FormField id="data_aprovacao_cliente" label="Data da aprovação"><input id="data_aprovacao_cliente" name="data_aprovacao_cliente" type="date" value={values.data_aprovacao_cliente} onChange={change} className={fieldClassName(false)} /></FormField><FormField id="observacao_aprovacao_cliente" label="Observação / evidência"><input id="observacao_aprovacao_cliente" name="observacao_aprovacao_cliente" value={values.observacao_aprovacao_cliente} onChange={change} className={fieldClassName(false)} placeholder="Ex.: aceite por e-mail" /></FormField></div> : <p className="mt-2 text-xs text-slate-500">Registro preparatório para futura regra de faturamento; não gera cobrança automaticamente.</p>}</div>
        <div className="md:col-span-2"><FormField id="observacoes" label="Observações"><textarea id="observacoes" name="observacoes" rows="3" value={values.observacoes} onChange={change} className={fieldClassName(false)} /></FormField></div>
      </div>
      <div className="flex justify-end gap-3"><Link to="/ordens-servico" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancelar</Link><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Save className="h-4 w-4 text-solar-yellow" />{saving ? 'Salvando...' : 'Salvar OS'}</button></div>
    </form>
  </section>
}
