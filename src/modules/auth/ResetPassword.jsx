import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LockKeyhole, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase.js'

const MIN_LENGTH = 8

function translateError(message) {
  const m = message.toLowerCase()
  if (m.includes('different from the old password')) {
    return 'Escolha uma senha diferente da atual.'
  }
  if (m.includes('at least') || m.includes('weak')) {
    return `A senha é muito fraca. Use pelo menos ${MIN_LENGTH} caracteres, misturando letras e números.`
  }
  if (m.includes('session missing') || m.includes('expired')) {
    return 'O link expirou. Peça um novo e-mail de redefinição.'
  }
  return 'Não foi possível salvar a nova senha. Tente novamente.'
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
    if (hash.get('error_code')) {
      setStatus('invalid')
      return
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setStatus('ready')
      } else if (session) {
        setStatus('ready')
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus('ready')
    })

    const timer = window.setTimeout(() => {
      setStatus((current) => (current === 'checking' ? 'invalid' : current))
    }, 4000)

    return () => {
      listener.subscription.unsubscribe()
      window.clearTimeout(timer)
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (password.length < MIN_LENGTH) {
      setError(`A senha precisa ter pelo menos ${MIN_LENGTH} caracteres.`)
      return
    }

    if (password !== confirm) {
      setError('As senhas não são iguais.')
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setSaving(false)
      setError(translateError(updateError.message))
      return
    }

    await supabase.auth.signOut()
    navigate('/login', { replace: true, state: { passwordChanged: true } })
  }

  if (status === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="surface-card w-full max-w-md p-7 text-center sm:p-8">
          <p className="text-sm text-slate-500" role="status">Validando o link…</p>
        </div>
      </main>
    )
  }

  if (status === 'invalid') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="surface-card w-full max-w-md p-7 sm:p-8">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy-950">Link inválido ou expirado</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Por segurança, cada link funciona uma vez e vale por pouco tempo.
          </p>
          <Link
            to="/forgot-password"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-950 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Pedir um novo link
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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-green">Segurança da conta</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-navy-950">Criar nova senha</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Defina uma nova senha para acessar o Solar ERP.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-navy-900">Nova senha</span>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={MIN_LENGTH}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-solar-yellow/40"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-navy-900">Repita a nova senha</span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                required
                minLength={MIN_LENGTH}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-solar-yellow/40"
              />
            </label>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-navy-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-navy-950/10 transition hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Salvando…' : 'Salvar nova senha'}
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
