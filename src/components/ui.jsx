export function ModulePlaceholder({ title, description, columns, rows }) {
  return (
    <section>
      <header className="mb-6">
        <h2 className="page-title">{title}</h2>
        <p className="page-subtitle">{description}</p>
      </header>

      <div className="surface-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-5 py-3 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row[0]} className="hover:bg-slate-50/70">
                {row.map((cell, index) => (
                  <td key={`${row[0]}-${index}`} className="px-5 py-3.5 text-navy-800">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function StatusBadge({ children, tone = 'navy' }) {
  const tones = {
    navy: 'bg-navy-900/10 text-navy-800',
    green: 'bg-solar-green/15 text-emerald-700',
    yellow: 'bg-solar-yellow/20 text-amber-800',
    slate: 'bg-slate-100 text-slate-600',
  }

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function formatCurrency(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR')
}
