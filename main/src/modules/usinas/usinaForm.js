export const emptyUsinaForm = {
  nomeCliente: '',
  telefone: '',
  endereco: '',
  potenciaKwp: '',
  quantidadePaineis: '',
  marcaPaineis: '',
  marcaInversor: '',
  numeroSerieInversor: '',
  dataInstalacao: '',
  periodicidadeLimpeza: '',
}

export function validateUsinaForm(values) {
  const errors = {}

  if (!values.nomeCliente.trim()) errors.nomeCliente = 'Informe o nome do cliente.'
  if (!values.telefone.trim()) errors.telefone = 'Informe o telefone ou WhatsApp.'
  else if (values.telefone.replace(/\D/g, '').length < 10) {
    errors.telefone = 'Informe um telefone com DDD (mínimo 10 dígitos).'
  }
  if (!values.endereco.trim()) errors.endereco = 'Informe o endereço de instalação.'

  if (!values.potenciaKwp || Number(values.potenciaKwp) <= 0) {
    errors.potenciaKwp = 'Informe a potência do kit em kWp.'
  }
  if (!values.quantidadePaineis || Number(values.quantidadePaineis) < 1) {
    errors.quantidadePaineis = 'Informe a quantidade de painéis.'
  }
  if (!values.marcaPaineis.trim()) errors.marcaPaineis = 'Informe a marca dos painéis.'
  if (!values.marcaInversor.trim()) errors.marcaInversor = 'Informe a marca do inversor.'
  if (!values.numeroSerieInversor.trim()) {
    errors.numeroSerieInversor = 'Informe o número de série do inversor.'
  }

  if (!values.dataInstalacao) errors.dataInstalacao = 'Informe a data da instalação.'
  if (!values.periodicidadeLimpeza) {
    errors.periodicidadeLimpeza = 'Selecione a periodicidade de limpeza.'
  }

  return errors
}
