import { Building2, ChevronDown, LogOut, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { useEmpresa } from '../context/EmpresaProvider.jsx'
import ApprovalAgent from '../components/ApprovalAgent.jsx'

const titles = {
  '/': 'Dashboard operacional',
  '/comercio': 'Comércio',
  '/servicos': 'Serviços',
  '/ufv': 'Gestão de Usinas',
  '/clientes': 'Clientes',
  '/produtos': 'Produtos e serviços',
  '/usinas': 'Usinas',
  '/usinas/cadastro': 'Cadastro de Usina Solar',
  '/propostas': 'Propostas',
  '/ordens-servico': 'Ordens de Serviço',
  '/controle-acesso': 'Controle de acesso',
}

export default function Header() {
  const { pathname } = useLocation()
  const { profile, signOut } = useAuth()
  const { empresas, empresaAtualId, selecionarEmpresa, loading: empresasLoading } = useEmpresa()
  const title = titles[pathname] ?? 'Solar ERP'
  const initials = (profile?.nome || 'SO').split(/\\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  return <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur lg:px-8">
    <div><p className="text-xs font-medium uppercase tracking-[0.14em] text-solar-green">Energia solar</p><h1 className="text-lg font-semibold text-navy-900">{title}</h1></div>
    <div className="flex items-center gap-3">
      <label className="relative hidden md:block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input type="search" placeholder="Buscar cliente, usina ou OS…" className="w-72 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-navy-700 focus:bg-white focus:ring-2 focus:ring-solar-yellow/40"/></label>
      <ApprovalAgent />
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-2">
        <Building2 className="ml-1 h-4 w-4 text-slate-400"/>
        <select value={empresaAtualId ?? ''} onChange={(event) => selecionarEmpresa(event.target.value)} disabled={empresasLoading || empresas.length === 0} className="max-w-52 cursor-pointer bg-transparent py-1 text-xs font-medium text-navy-900 outline-none disabled:cursor-default disabled:text-slate-400" aria-label="Empresa atual">
          <option value="">{empresasLoading ? 'Carregando empresa…' : empresas.length === 0 ? 'Sem empresa vinculada' : 'Selecionar empresa'}</option>
          {empresas.map((empresa) => <option key={empresa.id} value={empresa.id}>{(empresa.codigo ? `${empresa.codigo} · ` : '') + (empresa.nome_fantasia || empresa.razao_social)}</option>)}
        </select>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400"/>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 py-1.5 pl-1.5 pr-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-xs font-semibold text-solar-yellow">{initials || 'SO'}</div><div className="hidden min-w-0 sm:block"><p className="max-w-36 truncate text-xs font-semibold text-navy-900">{profile?.nome || 'Usuário'}</p><p className="text-[11px] text-slate-500">{profile?.is_master ? 'Master' : profile?.is_admin ? 'Administrador' : 'Operações'}</p></div><button type="button" onClick={() => signOut()} className="ml-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy-900" aria-label="Sair"><LogOut className="h-4 w-4"/></button></div>
    </div>
  </header>
}
