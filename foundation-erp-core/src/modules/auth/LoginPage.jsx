import { useState } from 'react'
import { LockKeyhole, Mail, Sun } from 'lucide-react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthProvider.jsx'

export default function LoginPage() {
  const { session, profile, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (session && profile?.ativo) return <Navigate to="/" replace />

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await signIn(email.trim(), password)
      const destination = location.state?.from || '/'
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err?.message || 'Não foi possível realizar o acesso.')
    } finally {
      setSubmitting(false)
    }
  }

  const passwordChanged = location.state?.passwordChanged === true

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-navy-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-solar-yellow/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-solar-green/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-solar-yellow text-navy-950 shadow-lg shadow-solar-yellow/20">
            <Sun className="h-5 w-5" strokeWidth={2.4} />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">Solar ERP</p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-solar-mint/80">Gestão de Energia Solar</p>
          </div>
        </div>

        <div className="relative z-10 max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-solar-yellow">SOLARIS</p>
          <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">Gestão integrada para a operação solar.</h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
            Uma base única para clientes, parceiros, produtos, usinas, propostas, ordens de serviço e os próximos níveis financeiro e de automação.
          </p>
        </div>

        <div className="relative z-10 flex items-end justify-between gap-6 text-xs text-slate-400">
          <span>Ambiente corporativo · acesso protegido</span>
          <span className="text-right text-slate-500">Fernando Miranda de Lima</span>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-solar-yellow text-navy-950">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-950">Solar ERP</p>
                <p className="text-[10px] uppercase tracking-[0.16em] text-solar-green">Gestão de Energia Solar</p>
              </div>
            </div>
          </div>

          <div className="surface-card p-7 sm:p-8">
            <div className="mb-7">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-green">Acesso ao sistema</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy-950">Entrar no Solar ERP</h2>
              <p className="mt-2 text-sm text-slate-500">Use as credenciais corporativas cadastradas no ambiente.</p>
            </div>

            {passwordChanged && (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700" role="status">
                Senha alterada. Entre com a nova senha.
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-navy-900">E-mail</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-solar-yellow/40"
                    placeholder="usuario@empresa.com.br"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-navy-900">Senha</span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-solar-yellow/40"
                    placeholder="••••••••"
                  />
                </span>
              </label>

              <div className="-mt-1 flex justify-end">
                <Link to="/forgot-password" className="text-sm font-medium text-navy-950 hover:underline">
                  Esqueci minha senha
                </Link>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-navy-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-navy-950/10 transition hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">Solar ERP · ambiente corporativo protegido</p>
        </div>
      </section>
    </main>
  )
}
