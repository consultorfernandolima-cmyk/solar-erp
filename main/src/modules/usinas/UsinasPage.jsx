import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ModulePlaceholder, StatusBadge } from '../../components/ui.jsx'
import { usinas } from '../../data/mock.js'

export default function UsinasPage() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          to="/usinas/cadastro"
          className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-navy-800"
        >
          <Plus className="h-4 w-4 text-solar-yellow" />
          Cadastrar usina
        </Link>
      </div>
      <ModulePlaceholder
        title="Usinas"
        description="Parque instalado e em implantação — use o cadastro para registrar novas usinas."
        columns={['Código', 'Usina', 'Cliente', 'Potência', 'Status']}
        rows={usinas.map((u) => [
          u.id,
          u.nome,
          u.cliente,
          `${u.potenciaKwp} kWp`,
          <StatusBadge key={u.id} tone={u.status === 'Operando' ? 'green' : 'yellow'}>
            {u.status}
          </StatusBadge>,
        ])}
      />
    </div>
  )
}
