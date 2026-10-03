import { ArrowRight, ShoppingCart, Sun, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'

const moduleConfig = {
  COMERCIO: {
    icon: ShoppingCart,
    eyebrow: 'Módulo comercial',
    title: 'Comércio',
    description: 'Venda de produtos, pedidos, estoque e rotinas comerciais em uma estrutura compartilhada com todo o ERP.',
    items: ['Clientes e fornecedores', 'Produtos e serviços', 'Pedidos e vendas', 'Estoque'],
  },
  SERVICOS: {
    icon: Wrench,
    eyebrow: 'Módulo operacional',
    title: 'Serviços',
    description: 'Prestação de serviços, ordens de serviço, execução, técnicos e contratos recorrentes.',
    items: ['Clientes e serviços', 'Ordens de Serviço', 'Execução e técnicos', 'Contratos'],
  },
  UFV: {
    icon: Sun,
    eyebrow: 'Especialização de Serviços',
    title: 'Gestão de Usinas',
    description: 'Especialização para empresas que implantam, acompanham e mantêm usinas fotovoltaicas, inclusive usinas de terceiros.',
    items: ['Cadastro de usinas', 'Instalação e comissionamento', 'Manutenção e limpeza', 'Monitoramento e histórico'],
  },
}

export default function ModulePage({ code }) {
  const config = moduleConfig[code]
  if (!config) return null
  const Icon = config.icon

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-navy-950 p-7 text-white shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-solar-yellow text-navy-950">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-mint">{config.eyebrow}</p>
            <h2 className="mt-1 text-2xl font-semibold">{config.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{config.description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {config.items.map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-navy-900">{item}</p>
            <p className="mt-1 text-sm text-slate-500">Estrutura preparada para a próxima etapa de implantação.</p>
          </div>
        ))}
      </div>

      {code === 'UFV' && (
        <Link to="/usinas" className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-800">
          Acessar usinas
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </section>
  )
}
