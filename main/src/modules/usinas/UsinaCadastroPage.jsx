import { useEffect, useState } from 'react'
import { CheckCircle2, MapPin, Save, Sun, Wrench } from 'lucide-react'
import FormField, { fieldClassName } from '../../components/FormField.jsx'
import { emptyUsinaForm, validateUsinaForm } from './usinaForm.js'

export default function UsinaCadastroPage() {
  const [values, setValues] = useState(emptyUsinaForm)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 4200)
    return () => clearTimeout(timer)
  }, [toast])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    if (errors[name]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[name]
        return next
      })
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateUsinaForm(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setToast(`Usina de ${values.nomeCliente} salva com sucesso.`)
    setValues(emptyUsinaForm)
  }

  return (
    <section className="relative space-y-6">
      {toast ? (
        <div
          role="status"
          className="fixed right-6 top-6 z-50 flex max-w-md items-start gap-3 rounded-2xl border border-solar-green/30 bg-white px-4 py-3 shadow-card"
        >
          <span className="mt-0.5 rounded-full bg-solar-green/15 p-1 text-solar-green">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-navy-900">Cadastro concluído</p>
            <p className="mt-0.5 text-sm text-slate-600">{toast}</p>
          </div>
        </div>
      ) : null}

      <header>
        <h2 className="page-title">Cadastro de Usina Solar</h2>
        <p className="page-subtitle">
          Registre cliente, kit técnico e recomendações de pós-venda para a instalação.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormSection
          icon={MapPin}
          title="Informações do Cliente"
          description="Dados de contato e local da instalação."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="nomeCliente" label="Nome do Cliente" error={errors.nomeCliente}>
              <input
                id="nomeCliente"
                name="nomeCliente"
                value={values.nomeCliente}
                onChange={handleChange}
                className={fieldClassName(errors.nomeCliente)}
                placeholder="Ex.: Fazenda Santa Luz"
              />
            </FormField>
            <FormField id="telefone" label="Telefone / WhatsApp" error={errors.telefone}>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                value={values.telefone}
                onChange={handleChange}
                className={fieldClassName(errors.telefone)}
                placeholder="(34) 99999-0000"
              />
            </FormField>
            <div className="md:col-span-2">
              <FormField id="endereco" label="Endereço de Instalação" error={errors.endereco}>
                <input
                  id="endereco"
                  name="endereco"
                  value={values.endereco}
                  onChange={handleChange}
                  className={fieldClassName(errors.endereco)}
                  placeholder="Rua, número, cidade e UF"
                />
              </FormField>
            </div>
          </div>
        </FormSection>

        <FormSection
          icon={Sun}
          title="Dados Técnicos da Usina"
          description="Potência do kit, módulos e inversor."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="potenciaKwp" label="Potência do Kit (kWp)" error={errors.potenciaKwp}>
              <input
                id="potenciaKwp"
                name="potenciaKwp"
                type="number"
                min="0"
                step="0.1"
                value={values.potenciaKwp}
                onChange={handleChange}
                className={fieldClassName(errors.potenciaKwp)}
                placeholder="12.0"
              />
            </FormField>
            <FormField
              id="quantidadePaineis"
              label="Quantidade de Painéis Solares"
              error={errors.quantidadePaineis}
            >
              <input
                id="quantidadePaineis"
                name="quantidadePaineis"
                type="number"
                min="1"
                step="1"
                value={values.quantidadePaineis}
                onChange={handleChange}
                className={fieldClassName(errors.quantidadePaineis)}
                placeholder="24"
              />
            </FormField>
            <FormField id="marcaPaineis" label="Marca dos Painéis" error={errors.marcaPaineis}>
              <input
                id="marcaPaineis"
                name="marcaPaineis"
                value={values.marcaPaineis}
                onChange={handleChange}
                className={fieldClassName(errors.marcaPaineis)}
                placeholder="Ex.: JA Solar"
              />
            </FormField>
            <FormField id="marcaInversor" label="Marca do Inversor" error={errors.marcaInversor}>
              <input
                id="marcaInversor"
                name="marcaInversor"
                value={values.marcaInversor}
                onChange={handleChange}
                className={fieldClassName(errors.marcaInversor)}
                placeholder="Ex.: Growatt"
              />
            </FormField>
            <div className="md:col-span-2">
              <FormField
                id="numeroSerieInversor"
                label="Número de Série do Inversor"
                error={errors.numeroSerieInversor}
              >
                <input
                  id="numeroSerieInversor"
                  name="numeroSerieInversor"
                  value={values.numeroSerieInversor}
                  onChange={handleChange}
                  className={fieldClassName(errors.numeroSerieInversor)}
                  placeholder="Ex.: GW-8K-TL-2026-00421"
                />
              </FormField>
            </div>
          </div>
        </FormSection>

        <FormSection
          icon={Wrench}
          title="Datas e Pós-Venda"
          description="Instalação e rotina de limpeza recomendada."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormField id="dataInstalacao" label="Data da Instalação" error={errors.dataInstalacao}>
              <input
                id="dataInstalacao"
                name="dataInstalacao"
                type="date"
                value={values.dataInstalacao}
                onChange={handleChange}
                className={fieldClassName(errors.dataInstalacao)}
              />
            </FormField>
            <FormField
              id="periodicidadeLimpeza"
              label="Periodicidade de Limpeza Recomendada"
              error={errors.periodicidadeLimpeza}
            >
              <select
                id="periodicidadeLimpeza"
                name="periodicidadeLimpeza"
                value={values.periodicidadeLimpeza}
                onChange={handleChange}
                className={fieldClassName(errors.periodicidadeLimpeza)}
              >
                <option value="">Selecione</option>
                <option value="6">6 meses</option>
                <option value="12">12 meses</option>
              </select>
            </FormField>
          </div>
        </FormSection>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-solar-yellow/70"
          >
            <Save className="h-4 w-4 text-solar-yellow" />
            Salvar Usina
          </button>
        </div>
      </form>
    </section>
  )
}

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <section className="surface-card overflow-hidden">
      <header className="flex items-start gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <span className="rounded-xl bg-navy-900 p-2 text-solar-yellow">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-navy-900">{title}</h3>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}
