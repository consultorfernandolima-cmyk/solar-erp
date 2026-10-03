export default function StatCard({ label, value, hint, icon: Icon, accent = 'yellow' }) {
  const accents = {
    yellow: 'bg-solar-yellow/15 text-solar-gold',
    green: 'bg-solar-green/15 text-solar-green',
    navy: 'bg-navy-900/10 text-navy-800',
  }

  return (
    <article className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-navy-900">{value}</p>
          {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
        </div>
        <div className={`rounded-xl p-2.5 ${accents[accent]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  )
}
