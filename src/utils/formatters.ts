export function formatarCpfCnpj(documento: string) {
  const numeros = documento.replace(/\D/g, '')

  if (numeros.length === 11) {
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  if (numeros.length === 14) {
    return numeros.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      '$1.$2.$3/$4-$5',
    )
  }

  return documento
}

export function formatarPlaca(valor: string) {
  const placa = valor
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 7)

  if (placa.length <= 3) return placa

  return `${placa.slice(0, 3)}-${placa.slice(3)}`
}
