import { NavLink } from 'react-router-dom'
import { Building2, ClipboardList, FileSignature, KeyRound, LayoutDashboard, Package, Receipt, ShoppingCart, Sun, Users, Wrench } from 'lucide-react'
import { useModules } from '../modules/modules/ModuleProvider.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'

const moduleLinks = {
  COMERCIO: { to: '/comercio', label: 'Comércio', icon: ShoppingCart },
  SERVICOS: { to: '/servicos', label: 'Serviços', icon: Wrench },
  UFV: { to: '/ufv', label: 'Gestão de Usinas', icon: Sun },
}

function SidebarLink({ to, label, icon: Icon, end = false, nested = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          nested ? 'ml-3 text-[13px]' : '',
          isActive
            ? 'bg-navy-800 text-white shadow-inner ring-1 ring-solar-yellow/40'
            : 'text-slate-300 hover:bg-navy-900 hover:text-white',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={isActive ? 'text-solar-yellow' : 'text-slate-400'} size={18} />
          {label}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { modules, loading, hasCompanyAccess } = useModules()
  const core = modules.find((module) => module.codigo === 'CORE')
  const commerce = modules.find((module) => module.codigo === 'COMERCIO')
  const services = modules.find((module) => module.codigo === 'SERVICOS')
  const ufv = modules.find((module) => module.codigo === 'UFV')
  const propostas = modules.find((module) => module.codigo === 'PROPOSTAS')
  const contratos = modules.find((module) => module.codigo === 'CONTRATOS')
  const faturamento = modules.find((module) => module.codigo === 'FATURAMENTO')
  const { profile, isCompanyAdmin } = useAuth()

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-navy-950 text-slate-200">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-solar-yellow text-navy-950 shadow-lg shadow-solar-yellow/20">
          <Sun className="h-5 w-5" strokeWidth={2.4} />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-wide text-white">Solar ERP</p>
          <p className="text-[11px] uppercase tracking-[0.16em] text-solar-mint/80">ERP Modular</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        <SidebarLink to="/" label="Dashboard" icon={LayoutDashboard} end />

        {(profile?.is_master || isCompanyAdmin) && (
          <>
            <SidebarLink to="/empresas" label="Empresas e filiais" icon={Building2} />
            <SidebarLink to="/usuarios-empresas" label="Usuários e empresas" icon={Users} />
            <SidebarLink to="/controle-acesso" label="Controle de acesso" icon={KeyRound} />
          </>
        )}

        {!loading && hasCompanyAccess && core && (
          <>
            <SidebarLink to="/clientes" label="Clientes" icon={Users} />
            <SidebarLink to="/produtos" label="Produtos e serviços" icon={Package} />
          </>
        )}

        {!loading && hasCompanyAccess && commerce && <SidebarLink {...moduleLinks.COMERCIO} />}

        {!loading && hasCompanyAccess && services && (
          <>
            <SidebarLink {...moduleLinks.SERVICOS} />
            <SidebarLink to="/ordens-servico" label="Ordens de Serviço" icon={ClipboardList} nested />
            {propostas && <SidebarLink to="/propostas" label="Propostas" icon={ClipboardList} nested />}
            {contratos && <SidebarLink to="/contratos" label="Contratos" icon={FileSignature} nested />}
          </>
        )}

        {!loading && hasCompanyAccess && ufv && (
          <>
            <SidebarLink {...moduleLinks.UFV} />
            <SidebarLink to="/usinas" label="Usinas" icon={Sun} nested />
          </>
        )}

        {!loading && hasCompanyAccess && faturamento && (
          <SidebarLink to="/faturamento" label="Faturamento" icon={Receipt} nested />
        )}
      </nav>

      <div className="m-3 rounded-xl border border-white/10 bg-navy-900/80 p-4">
        <p className="text-xs font-medium text-solar-yellow">Estrutura modular</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Cadastros Core são compartilhados. Comércio, Serviços e UFV usam esses dados conforme a licença e as permissões da empresa.
        </p>
      </div>
    </aside>
  )
}
