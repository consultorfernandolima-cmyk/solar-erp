import { ModulePlaceholder, StatusBadge, formatCurrency, formatDate } from '../../components/ui.jsx'
import { propostas } from '../../data/mock.js'

const etapaTone = {
  Enviada: 'navy',
  'Em elaboração': 'slate',
  Negociação: 'yellow',
}

export default function PropostasPage() {
  return (
    <ModulePlaceholder
      title="Propostas"
      description="Funil comercial simulado — valores e validade para o nível comercial."
      columns={['Código', 'Cliente', 'Valor', 'Etapa', 'Validade']}
      rows={propostas.map((p) => [
        p.id,
        p.cliente,
        formatCurrency(p.valor),
        <StatusBadge key={p.id} tone={etapaTone[p.etapa] ?? 'slate'}>
          {p.etapa}
        </StatusBadge>,
        formatDate(p.validade),
      ])}
    />
  )
}
