import { ArrowRight, Building2, ShoppingCart, Sun, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useModules } from '../modules/ModuleProvider.jsx'

const moduleCards = {
  COMERCIO: {
    icon: ShoppingCart,
    title: 'Comércio',
    description: 'Produtos, clientes, propostas, pedidos e futuras rotinas de estoque.',
    to: '/comercio',
    tag: 'Módulo comercial',
  },
  SERVICOS: {
    icon: Wrench,
    title: 'Serviços',
    description: 'Ordens de serviço, execução, técnicos e contratos em uma operação única.',
    to: '/servicos',
    tag: 'Módulo operacional',
  },
  UFV: {
    icon: Sun,
    title: 'Gestão de Usinas',
    description: 'Implantação, manutenção, limpeza, garantias e monitoramento de usinas.',
    to: '/ufv',
    tag: 'Especialização de Serviços',
  },
}

export default function DashboardPage() {
  const { modules, loading } = useModules()

  const activeModules = modules.filter((module) => module.codigo !== 'CORE')
  const activeCount = activeModules.length

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-navy-950 px-6 py-7 text-white shadow-card sm:px-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-solar-yellow/15 blur-2xl" />
        <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-solar-green/15 blur-2xl" />
        <div className="relative max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-solar-mint">
            <Building2 size={14} />
            Núcleo do ERP
          </div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Visão geral da operação</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Uma base única para organizar clientes, parceiros, produtos e operações, com módulos ativados conforme o negócio.
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="page-title">Módulos contratados</h3>
          <p className="page-subtitle">
            {loading ? 'Carregando habilitações...' : `${activeCount} módulo${activeCount === 1 ? '' : 's'} ativo${activeCount === 1 ? '' : 's'} nesta organização.`}
          </p>
        </div>
        {!loading && (
          <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 sm:inline-flex">
            Dados compartilhados pelo Core
          </span>
        )}
      </div>

      {loading ? (
        <div className="surface-card flex min-h-56 items-center justify-center text-sm text-slate-500">
          Preparando o ambiente...
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {activeModules.map((module) => {
            const config = moduleCards[module.codigo]
            if (!config) return null
            const Icon = config.icon

            return (
              <Link
                key={module.codigo}
                to={config.to}
                className="group surface-card relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:border-solar-yellow/60 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-950 text-solar-yellow">
                    <Icon size={21} />
                  </div>
                  <ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-navy-800" size={18} />
                </div>
                <p className="mt-5 text-xs font-medium uppercase tracking-wide text-solar-green">{config.tag}</p>
                <h4 className="mt-1 text-lg font-semibold text-navy-900">{config.title}</h4>
                <p className="mt-2 min-h-12 text-sm leading-5 text-slate-500">{config.description}</p>
              </Link>
            )
          })}
        </div>
      )}

      <div className="surface-card p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-green">Arquitetura</p>
            <h3 className="mt-1 text-lg font-semibold text-navy-900">Um cadastro, vários contextos de operação</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Clientes, parceiros e produtos não são duplicados por módulo. A mesma base pode alimentar Comércio, Serviços e Gestão de Usinas, reduzindo retrabalho e mantendo o histórico centralizado.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span className="font-semibold text-navy-900">UFV</span> é uma especialização de Serviços
          </div>
        </div>
      </div>
    </section>
  )
}
