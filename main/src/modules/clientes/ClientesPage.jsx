import { ModulePlaceholder, StatusBadge } from '../../components/ui.jsx'
import { clientes } from '../../data/mock.js'

export default function ClientesPage() {
  return (
    <ModulePlaceholder
      title="Clientes"
      description="Cadastro comercial — pronto para evoluir no próximo nível da esteira."
      columns={['Código', 'Nome', 'Cidade', 'Usinas', 'Status']}
      rows={clientes.map((c) => [
        c.id,
        c.nome,
        c.cidade,
        String(c.usinas),
        <StatusBadge key={c.id} tone={c.status === 'Ativo' ? 'green' : 'yellow'}>
          {c.status}
        </StatusBadge>,
      ])}
    />
  )
}
