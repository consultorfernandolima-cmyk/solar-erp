import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { StatusBadge } from '../../components/ui.jsx'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { useEmpresa } from '../../context/EmpresaProvider.jsx'

const statusLabel = { IMPLANTACAO: 'Em implantação', OPERANDO: 'Operando', INATIVA: 'Inativa' }
const statusTone = { IMPLANTACAO: 'yellow', OPERANDO: 'green', INATIVA: 'slate' }

export default function UsinasPage() {
  const { profile } = useAuth()
  const { empresaAtual, empresas, loading: empresaLoading } = useEmpresa()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    if (!profile?.organizacao_id || !empresaAtual?.id) { setRows([]); setLoading(false); return }
    setLoading(true); setError('')
    const { data, error: queryError } = await supabase.from('usinas')
      .select('id,codigo,nome,potencia_kwp,status,data_instalacao,cliente:parceiros(nome_razao_social)')
      .eq('organizacao_id', profile.organizacao_id).eq('empresa_id', empresaAtual.id).order('nome')
    if (queryError) setError(queryError.message)
    setRows(data ?? []); setLoading(false)
  }

  useEffect(() => { load() }, [profile?.organizacao_id, empresaAtual?.id])

  async function handleDelete(id) {
    if (!window.confirm('Excluir esta usina? Esta ação não poderá ser desfeita.')) return
    const { error: deleteError } = await supabase.from('usinas').delete().eq('id', id)
    if (deleteError) setError(deleteError.message)
    else await load()
  }

  if (empresaLoading) return <div className="surface-card p-6 text-sm text-slate-500">Carregando contexto da empresa...</div>
  if (!empresas.length) return <div className="surface-card p-6"><h2 className="page-title">Usinas</h2><p className="mt-2 text-sm text-slate-600">Cadastre uma empresa ou filial antes de registrar uma usina.</p></div>
  if (!empresaAtual) return <div className="surface-card p-6"><h2 className="page-title">Usinas</h2><p className="mt-2 text-sm text-slate-600">Selecione a empresa atual no cabeçalho para consultar e cadastrar usinas.</p></div>

  return <section className="space-y-4">
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div><h2 className="page-title">Usinas</h2><p className="page-subtitle">Usinas da empresa <strong>{empresaAtual.nome_fantasia || empresaAtual.razao_social}</strong>.</p></div>
      <Link to="/usinas/cadastro" className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white shadow-card"><Plus className="h-4 w-4 text-solar-yellow" />Cadastrar usina</Link>
    </div>
    {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
    <div className="surface-card overflow-hidden">
      {loading ? <div className="p-6 text-sm text-slate-500">Carregando usinas...</div> : rows.length === 0 ? <div className="p-8 text-center text-sm text-slate-600">Nenhuma usina cadastrada nesta empresa.</div> : (
        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500"><tr>
            <th className="px-5 py-3">Código</th><th className="px-5 py-3">Usina</th><th className="px-5 py-3">Cliente</th><th className="px-5 py-3">Potência</th><th className="px-5 py-3">Instalação</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Ações</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">{rows.map(row => <tr key={row.id} className="hover:bg-slate-50/60">
            <td className="px-5 py-3 font-medium text-slate-700">{row.codigo}</td>
            <td className="px-5 py-3 font-semibold text-navy-900">{row.nome}</td>
            <td className="px-5 py-3 text-slate-600">{row.cliente?.nome_razao_social || '—'}</td>
            <td className="px-5 py-3 text-slate-600">{row.potencia_kwp ? row.potencia_kwp + ' kWp' : '—'}</td>
            <td className="px-5 py-3 text-slate-600">{row.data_instalacao ? new Date(row.data_instalacao + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
            <td className="px-5 py-3"><StatusBadge tone={statusTone[row.status] ?? 'slate'}>{statusLabel[row.status] ?? row.status}</StatusBadge></td>
            <td className="px-5 py-3"><div className="flex justify-end gap-1">
              <Link to={'/usinas/cadastro?id=' + row.id} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy-900" aria-label={'Editar ' + row.nome}><Pencil className="h-4 w-4" /></Link>
              <button type="button" onClick={() => handleDelete(row.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label={'Excluir ' + row.nome}><Trash2 className="h-4 w-4" /></button>
            </div></td>
          </tr>)}</tbody>
        </table></div>
      )}
    </div>
  </section>
}