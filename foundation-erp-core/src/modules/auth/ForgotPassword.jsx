import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (resetError) {
      setError(
        resetError.status === 429
          ? 'Muitos pedidos seguidos. Aguarde alguns minutos e tente de novo.'
          : 'Não foi possível enviar o e-mail agora. Tente novamente.',
      )
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10 sm:px-10">
        <div className="surface-card w-full max-w-md p-7 sm:p-8">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-solar-yellow/20 text-navy-950">
            <Mail className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy-950">Confira seu e-mail</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Se existir uma conta com esse e-mail, enviamos um link para criar uma nova senha. Ele vale por pouco tempo e funciona uma única vez.
          </p>
          <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-950 hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10 sm:px-10">
      <div className="w-full max-w-md">
        <div className="surface-card p-7 sm:p-8">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-green">Recuperação de acesso</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-navy-950">Esqueci minha senha</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Informe seu e-mail e enviaremos um link para criar uma nova senha.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || email.trim() === ''}
              className="w-full rounded-xl bg-navy-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-navy-950/10 transition hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Enviando…' : 'Enviar link'}
            </button>

            <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-navy-950">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao login
            </Link>
          </form>
        </div>
      </div>
    </main>
  )
}
