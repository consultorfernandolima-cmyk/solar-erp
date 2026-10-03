import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import FormField, { fieldClassName } from '../../components/FormField.jsx'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { useEmpresa } from '../../context/EmpresaProvider.jsx'

const initial = {
  cliente_id: '', nome: '', endereco: '', potencia_kwp: '', quantidade_paineis: '',
  marca_paineis: '', marca_inversor: '', numero_serie_inversor: '', data_instalacao: '',
  periodicidade_limpeza_meses: '', status: 'IMPLANTACAO', observacoes: '',
}

export default function UsinaCadastroPage() {
  const { profile } = useAuth()
  const { empresaAtual, empresas, loading: empresaLoading } = useEmpresa()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const id = params.get('id')
  const [values, setValues] = useState(initial)
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profile?.organizacao_id) return
    async function loadClients() {
      const { data: roles, error: roleError } = await supabase
        .from('parceiro_papeis')
        .select('parceiro_id')
        .eq('papel', 'CLIENTE')
      if (roleError) return
      const ids = (roles ?? []).map((row) => row.parceiro_id)
      if (!ids.length) { setClientes([]); return }
      const { data, error: queryError } = await supabase
        .from('parceiros')
        .select('id,nome_razao_social')
        .eq('organizacao_id', profile.organizacao_id)
        .eq('ativo', true)
        .in('id', ids)
        .order('nome_razao_social')
      if (!queryError) setClientes(data ?? [])
    }
    loadClients()
  }, [profile?.organizacao_id])

  useEffect(() => {
    if (!id || !profile?.organizacao_id || !empresaAtual?.id) { if (!id) setLoading(false); return }
    async function loadUsina() {
      setLoading(true); setError('')
      const { data, error: queryError } = await supabase.from('usinas')
        .select('cliente_id,nome,endereco,potencia_kwp,quantidade_paineis,marca_paineis,marca_inversor,numero_serie_inversor,data_instalacao,periodicidade_limpeza_meses,status,observacoes')
        .eq('id', id).eq('organizacao_id', profile.organizacao_id).eq('empresa_id', empresaAtual.id).single()
      if (queryError) setError(queryError.message)
      else setValues({ ...initial, ...data, potencia_kwp: data.potencia_kwp ?? '', quantidade_paineis: data.quantidade_paineis ?? '', periodicidade_limpeza_meses: data.periodicidade_limpeza_meses ?? '' })
      setLoading(false)
    }
    loadUsina()
  }, [id, profile?.organizacao_id, empresaAtual?.id])

  function change(e) {
    const { name, value } = e.target
    setValues(v => ({ ...v, [name]: value }))
  }

  async function save(e) {
    e.preventDefault(); setError('')
    if (!empresaAtual?.id) { setError('Selecione uma empresa no cabeçalho antes de salvar.'); return }
    if (!values.nome.trim()) { setError('Informe o nome da usina.'); return }
    if (values.potencia_kwp && Number(values.potencia_kwp) < 0) { setError('A potência não pode ser negativa.'); return }
    setSaving(true)
    const payload = {
      ...values,
      organizacao_id: profile.organizacao_id,
      empresa_id: empresaAtual.id,
      cliente_id: values.cliente_id || null,
      potencia_kwp: values.potencia_kwp === '' ? null : Number(values.potencia_kwp),
      quantidade_paineis: values.quantidade_paineis === '' ? null : Number(values.quantidade_paineis),
      periodicidade_limpeza_meses: values.periodicidade_limpeza_meses === '' ? null : Number(values.periodicidade_limpeza_meses),
    }
    const result = id
      ? await supabase.from('usinas').update(payload).eq('id', id).eq('empresa_id', empresaAtual.id)
      : await supabase.from('usinas').insert(payload)
    if (result.error) setError(result.error.message)
    else navigate('/usinas')
    setSaving(false)
  }

  if (empresaLoading || loading) return <div className="surface-card p-6 text-sm text-slate-500">Carregando cadastro...</div>
  if (!empresas.length || !empresaAtual) return <div className="surface-card p-6"><h2 className="page-title">Cadastro de Usina</h2><p className="mt-2 text-sm text-slate-600">Selecione uma empresa atual no cabeçalho antes de cadastrar a usina.</p></div>

  return <section className="space-y-5">
    <div className="flex items-center gap-3"><Link to="/usinas" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></Link><div><h2 className="page-title">{id ? 'Editar usina' : 'Cadastro de Usina Solar'}</h2><p className="page-subtitle">Empresa: {empresaAtual.nome_fantasia || empresaAtual.razao_social}</p></div></div>
    {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
    <form onSubmit={save} className="surface-card space-y-5 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField id="nome" label="Nome da Usina" error={!values.nome.trim() ? undefined : undefined}><input id="nome" name="nome" value={values.nome} onChange={change} className={fieldClassName(false)} placeholder="Ex.: Usina Fazenda Santa Luz" /></FormField>
        <FormField id="cliente_id" label="Cliente"><select id="cliente_id" name="cliente_id" value={values.cliente_id} onChange={change} className={fieldClassName(false)}><option value="">Selecione o cliente</option>{clientes.map(c => <option key={c.id} value={c.id}>{c.nome_razao_social}</option>)}</select></FormField>
        <div className="md:col-span-2"><FormField id="endereco" label="Endereço de Instalação"><input id="endereco" name="endereco" value={values.endereco} onChange={change} className={fieldClassName(false)} /></FormField></div>
        <FormField id="potencia_kwp" label="Potência do Kit (kWp)"><input id="potencia_kwp" name="potencia_kwp" type="number" min="0" step="0.001" value={values.potencia_kwp} onChange={change} className={fieldClassName(false)} /></FormField>
        <FormField id="quantidade_paineis" label="Quantidade de Painéis"><input id="quantidade_paineis" name="quantidade_paineis" type="number" min="0" step="1" value={values.quantidade_paineis} onChange={change} className={fieldClassName(false)} /></FormField>
        <FormField id="marca_paineis" label="Marca dos Painéis"><input id="marca_paineis" name="marca_paineis" value={values.marca_paineis} onChange={change} className={fieldClassName(false)} /></FormField>
        <FormField id="marca_inversor" label="Marca do Inversor"><input id="marca_inversor" name="marca_inversor" value={values.marca_inversor} onChange={change} className={fieldClassName(false)} /></FormField>
        <FormField id="numero_serie_inversor" label="Número de Série do Inversor"><input id="numero_serie_inversor" name="numero_serie_inversor" value={values.numero_serie_inversor} onChange={change} className={fieldClassName(false)} /></FormField>
        <FormField id="data_instalacao" label="Data da Instalação"><input id="data_instalacao" name="data_instalacao" type="date" value={values.data_instalacao ?? ''} onChange={change} className={fieldClassName(false)} /></FormField>
        <FormField id="periodicidade_limpeza_meses" label="Periodicidade de Limpeza"><select id="periodicidade_limpeza_meses" name="periodicidade_limpeza_meses" value={values.periodicidade_limpeza_meses} onChange={change} className={fieldClassName(false)}><option value="">Selecione</option><option value="6">6 meses</option><option value="12">12 meses</option></select></FormField>
        <FormField id="status" label="Status"><select id="status" name="status" value={values.status} onChange={change} className={fieldClassName(false)}><option value="IMPLANTACAO">Em implantação</option><option value="OPERANDO">Operando</option><option value="INATIVA">Inativa</option></select></FormField>
        <div className="md:col-span-2"><FormField id="observacoes" label="Observações"><textarea id="observacoes" name="observacoes" rows="4" value={values.observacoes} onChange={change} className={fieldClassName(false)} /></FormField></div>
      </div>
      <div className="flex justify-end gap-3"><Link to="/usinas" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Cancelar</Link><button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Save className="h-4 w-4 text-solar-yellow" />{saving ? 'Salvando...' : 'Salvar Usina'}</button></div>
    </form>
  </section>
}