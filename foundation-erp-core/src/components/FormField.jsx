export default function FormField({
  id,
  label,
  error,
  children,
  hint,
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-navy-800">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  )
}

export const fieldClassName = (error) =>
  [
    'w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-navy-900 outline-none transition',
    'placeholder:text-slate-400',
    'focus:bg-white focus:ring-2',
    error
      ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
      : 'border-slate-200 focus:border-navy-700 focus:ring-solar-yellow/40',
  ].join(' ')
