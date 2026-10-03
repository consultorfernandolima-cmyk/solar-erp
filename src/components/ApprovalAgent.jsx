import { Check, Lightbulb, LoaderCircle, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Data indisponível'
    : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

export default function ApprovalAgent() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [busyId, setBusyId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')
    try {
      const { data, error } = await supabase
        .from('avisos_aprovacao')
        .select('id, tipo, titulo, descricao, entidade_tipo, entidade_id, dados, status, created_at')
        .eq('status', 'pendente')
        .order('created_at', { ascending: false })
      if (error) throw error
      setItems(data ?? [])
    } catch (error) {
      console.error('Falha ao carregar avisos de aprovação:', error)
      setErrorMessage('Não foi possível carregar os avisos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  const decide = async (id, status) => {
    setBusyId(id)
    setErrorMessage('')
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      const { error } = await supabase
        .from('avisos_aprovacao')
        .update({ status, aprovado_por: user?.id, aprovado_em: new Date().toISOString() })
        .eq('id', id)
        .eq('status', 'pendente')
      if (error) throw error
      await load()
    } catch (error) {
      console.error('Falha ao registrar decisão do aviso:', error)
      setErrorMessage('Não foi possível registrar sua decisão. Tente novamente.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)}
        className="relative rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
        aria-label={items.length ? `Avisos pendentes: ${items.length}` : 'Avisos'}
        aria-expanded={open} title="Avisos que precisam da sua liberação">
        <Lightbulb className="h-4 w-4" />
        {items.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-solar-yellow px-1 text-[10px] font-bold text-navy-950">{items.length > 99 ? '99+' : items.length}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div><p className="text-sm font-semibold text-navy-900">Avisos para liberação</p><p className="text-xs text-slate-500">Itens que dependem da sua aprovação.</p></div>
            <Lightbulb className="h-5 w-5 text-solar-yellow" />
          </div>
          <div className="max-h-[min(65vh,520px)] overflow-y-auto">
            {errorMessage && <div role="alert" className="px-4 py-3 text-xs text-red-600">{errorMessage}<button type="button" onClick={load} className="ml-2 font-semibold underline">Tentar novamente</button></div>}
            {loading ? <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Carregando avisos…</div>
              : items.length === 0 ? <div className="px-4 py-8 text-center text-sm text-slate-500">{errorMessage ? 'Verifique sua conexão e tente novamente.' : 'Nenhuma liberação pendente.'}</div>
              : items.map((item) => (
                <article key={item.id} className="border-b border-slate-100 px-4 py-4 last:border-b-0">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-solar-green">{item.tipo}</p>
                    <h2 className="mt-1 text-sm font-semibold text-navy-900">{item.titulo}</h2>
                    {item.descricao && <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.descricao}</p>}
                    <p className="mt-2 text-[11px] text-slate-400">{formatDate(item.created_at)}</p>
                  </div><div className="flex shrink-0 gap-1">
                    <button type="button" disabled={busyId === item.id} onClick={() => decide(item.id, 'aprovado')} className="rounded-lg border border-slate-200 p-2 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50" aria-label="Aprovar" title="Aprovar"><Check className="h-4 w-4" /></button>
                    <button type="button" disabled={busyId === item.id} onClick={() => decide(item.id, 'rejeitado')} className="rounded-lg border border-slate-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50" aria-label="Rejeitar" title="Rejeitar"><X className="h-4 w-4" /></button>
                  </div></div>
                </article>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
