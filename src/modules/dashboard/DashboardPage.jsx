import { Banknote, ClipboardList, Sun, Users } from 'lucide-react'
import StatCard from '../../components/StatCard.jsx'
import { StatusBadge, formatCurrency, formatDate } from '../../components/ui.jsx'
import { kpis, proximasManutencoes } from '../../data/mock.js'

const statusTone = {
  Agendada: 'navy',
  Confirmada: 'green',
  Pendente: 'yellow',
}

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="page-title">Visão geral</h2>
        <p className="page-subtitle">Indicadores do nível 1 — operação comercial e pós-venda de usinas.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total de Clientes"
          value={kpis.totalClientes}
          hint="Base ativa + prospectos"
          icon={Users}
          accent="navy"
        />
        <StatCard
          label="Usinas Instaladas"
          value={kpis.usinasInstaladas}
          hint="Em operação no parque"
          icon={Sun}
          accent="yellow"
        />
        <StatCard
          label="Manutenções Pendentes"
          value={kpis.manutencoesPendentesMes}
          hint="Este mês"
          icon={ClipboardList}
          accent="green"
        />
        <StatCard
          label="Faturamento Estimado"
          value={formatCurrency(kpis.faturamentoEstimado)}
          hint="Pipeline + OS do mês"
          icon={Banknote}
          accent="yellow"
        />
      </div>

      <div className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-navy-900">Próximas limpezas e manutenções</h3>
            <p className="text-xs text-slate-500">Agenda simulada de painéis solares por cliente</p>
          </div>
          <span className="rounded-full bg-solar-green/15 px-3 py-1 text-xs font-medium text-emerald-700">
            {proximasManutencoes.length} serviços
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">OS</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Usina</th>
                <th className="px-5 py-3 font-medium">Serviço</th>
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Técnico</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {proximasManutencoes.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="px-5 py-3.5 font-medium text-navy-800">{item.id}</td>
                  <td className="px-5 py-3.5">{item.cliente}</td>
                  <td className="px-5 py-3.5 text-slate-600">{item.usina}</td>
                  <td className="px-5 py-3.5">{item.tipo}</td>
                  <td className="px-5 py-3.5">{formatDate(item.data)}</td>
                  <td className="px-5 py-3.5">{item.tecnico}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge tone={statusTone[item.status] ?? 'slate'}>{item.status}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
