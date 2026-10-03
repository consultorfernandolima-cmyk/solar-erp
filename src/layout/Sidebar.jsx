import { NavLink } from 'react-router-dom'
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  Sun,
  Users,
  Warehouse,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/clientes', label: 'Clientes', icon: Users },
  { to: '/usinas', label: 'Usinas', icon: Warehouse },
  { to: '/propostas', label: 'Propostas', icon: FileText },
  { to: '/ordens-servico', label: 'Ordens de Serviço', icon: ClipboardList },
]

export default function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-navy-950 text-slate-200">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-solar-yellow text-navy-950 shadow-lg shadow-solar-yellow/20">
          <Sun className="h-5 w-5" strokeWidth={2.4} />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-white">Solar ERP</p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-solar-mint/80">Esteira · Nível 1</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-navy-800 text-white shadow-inner ring-1 ring-solar-yellow/40'
                  : 'text-slate-300 hover:bg-navy-900 hover:text-white',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-4.5 w-4.5 ${isActive ? 'text-solar-yellow' : 'text-slate-400'}`}
                  size={18}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="m-3 rounded-xl border border-white/10 bg-navy-900/80 p-4">
        <p className="text-xs font-medium text-solar-yellow">Próximo nível</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Módulos prontos para cadastros, funil comercial e OS reais.
        </p>
      </div>
    </aside>
  )
}
