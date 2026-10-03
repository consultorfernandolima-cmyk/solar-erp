import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { StatusBadge } from '../../components/ui.jsx'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../auth/AuthProvider.jsx'
import { useEmpresa } from '../../context/EmpresaProvider.jsx'

const statusLabel = { PENDENTE: 'Pendente', AGENDADA: 'Agendada', EM_EXECUCAO: 'Em execução', CONCLUIDA: 'Concluída', CANCELADA: 'Cancelada' }
const statusTone = { PENDENTE: 'yellow', AGENDADA: 'navy', EM_EXECUCAO: 'navy', CONCLUIDA: 'green', CANCELADA: 'slate' }

export default function OrdensServicoPage() {
  const { profile } = useAuth()
  const { empresaAtual, empresas, loading: empresaLoading } = useEmpresa()
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    if (!profile?.organizacao_id || !empresaAtual?.id) { setRows([]); setLoading(false); return }
    setLoading(true); setError('')
    const { data, error: queryError } = await supabase
      .from('ordens_servico')
      .select('id,numero,tipo,prioridade,status,data_abertura,data_agendada,cliente:parceiros(nome_razao_social),usina:usinas(nome),tecnico:perfis(nome)')
      .eq('organizacao_id', profile.organizacao_id)
      .eq('empresa_id', empresaAtual.id)
      .order('numero', { ascending: false })
    if (queryError) setError(queryError.message)
    setRows(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [profile?.organizacao_id, empresaAtual?.id])

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR')
    if (!term) return rows
    return rows.filter((row) => [
      String(row.numero ?? ''),
      row.tipo,
      row.status,
      row.cliente?.nome_razao_social,
      row.usina?.nome,
      row.tecnico?.nome,
    ].filter(Boolean).some((value) => String(value).toLocaleLowerCase('pt-BR').includes(term)))
  }, [rows, search])

  async function handleDelete(id) {
    if (!window.confirm('Excluir esta ordem de serviço? Esta ação não poderá ser desfeita.')) return
    const { error: deleteError } = await supabase.from('ordens_servico').delete().eq('id', id)
    if (deleteError) setError(deleteError.message)
    else await load()
  }

  if (empresaLoading) return <div className="surface-card p-6 text-sm text-slate-500">Carregando contexto da empresa...</div>
  if (!empresas.length) return <div className="surface-card p-6"><h2 className="page-title">Ordens de Serviço</h2><p className="mt-2 text-sm text-slate-600">Cadastre uma empresa ou filial antes de registrar ordens de serviço.</p></div>
  if (!empresaAtual) return <div className="surface-card p-6"><h2 className="page-title">Ordens de Serviço</h2><p className="mt-2 text-sm text-slate-600">Selecione a empresa atual no cabeçalho para consultar e cadastrar OS.</p></div>

  return <section className="space-y-4">
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div><h2 className="page-title">Ordens de Serviço</h2><p className="page-subtitle">Atendimentos da empresa <strong>{empresaAtual.nome_fantasia || empresaAtual.razao_social}</strong>.</p></div>
      <Link to="/ordens-servico/cadastro" className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white shadow-card"><Plus className="h-4 w-4 text-solar-yellow" />Nova OS</Link>
    </div>
    <div className="surface-card p-4">
      <label className="relative block max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por número, cliente, usina, tipo ou técnico..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-navy-700 focus:bg-white focus:ring-2 focus:ring-solar-yellow/40" />
      </label>
    </div>
    {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
    <div className="surface-card overflow-hidden">
      {loading ? <div className="p-6 text-sm text-slate-500">Carregando ordens de serviço...</div> : filtered.length === 0 ? <div className="p-8 text-center text-sm text-slate-600">Nenhuma ordem de serviço cadastrada nesta empresa.</div> : (
        <div className="overflow-x-auto"><table className="min-w-[1050px] w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500"><tr>
            <th className="px-5 py-3">OS</th><th className="px-5 py-3">Cliente</th><th className="px-5 py-3">Usina</th><th className="px-5 py-3">Tipo</th><th className="px-5 py-3">Agendamento</th><th className="px-5 py-3">Técnico</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Ações</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">{filtered.map(row => <tr key={row.id} className="hover:bg-slate-50/60">
            <td className="px-5 py-3 font-semibold text-navy-900">OS-{row.numero}</td>
            <td className="px-5 py-3 text-slate-700">{row.cliente?.nome_razao_social || '—'}</td>
            <td className="px-5 py-3 text-slate-600">{row.usina?.nome || 'Serviço geral'}</td>
            <td className="px-5 py-3 text-slate-600">{row.tipo}</td>
            <td className="px-5 py-3 text-slate-600">{row.data_agendada ? new Date(row.data_agendada + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</td>
            <td className="px-5 py-3 text-slate-600">{row.tecnico?.nome || '—'}</td>
            <td className="px-5 py-3"><StatusBadge tone={statusTone[row.status] ?? 'slate'}>{statusLabel[row.status] ?? row.status}</StatusBadge></td>
            <td className="px-5 py-3"><div className="flex justify-end gap-1"><Link to={'/ordens-servico/cadastro?id=' + row.id} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-navy-900" aria-label={'Editar OS ' + row.numero}><Pencil className="h-4 w-4" /></Link><button type="button" onClick={() => handleDelete(row.id)} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label={'Excluir OS ' + row.numero}><Trash2 className="h-4 w-4" /></button></div></td>
          </tr>)}</tbody>
        </table></div>
      )}
    </div>
  </section>
}
