import { ModulePlaceholder, StatusBadge, formatDate } from '../../components/ui.jsx'
import { proximasManutencoes } from '../../data/mock.js'

const statusTone = {
  Agendada: 'navy',
  Confirmada: 'green',
  Pendente: 'yellow',
}

export default function OrdensServicoPage() {
  return (
    <ModulePlaceholder
      title="Ordens de Serviço"
      description="Limpezas e manutenções de painéis — módulo a evoluir com execução de campo."
      columns={['OS', 'Cliente', 'Usina', 'Tipo', 'Data', 'Técnico', 'Status']}
      rows={proximasManutencoes.map((os) => [
        os.id,
        os.cliente,
        os.usina,
        os.tipo,
        formatDate(os.data),
        os.tecnico,
        <StatusBadge key={os.id} tone={statusTone[os.status] ?? 'slate'}>
          {os.status}
        </StatusBadge>,
      ])}
    />
  )
}
