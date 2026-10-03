import { Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const titles = {
  '/': 'Dashboard operacional',
  '/clientes': 'Clientes',
  '/usinas': 'Usinas',
  '/usinas/cadastro': 'Cadastro de Usina Solar',
  '/propostas': 'Propostas',
  '/ordens-servico': 'Ordens de Serviço',
}

export default function Header() {
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'Solar ERP'

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur lg:px-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-solar-green">Energia solar</p>
        <h1 className="text-lg font-semibold text-navy-900">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <label className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar cliente, usina ou OS…"
            className="w-72 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-navy-700 focus:bg-white focus:ring-2 focus:ring-solar-yellow/40"
          />
        </label>
        <button
          type="button"
          className="relative rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          aria-label="Notificações"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-solar-yellow" />
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-xs font-semibold text-solar-yellow">
            OP
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-navy-900">Operações</p>
            <p className="text-[11px] text-slate-500">Nível 1</p>
          </div>
        </div>
      </div>
    </header>
  )
}
