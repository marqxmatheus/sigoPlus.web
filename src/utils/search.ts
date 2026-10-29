export function normalizarBusca(valor: string) {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function correspondeABusca(
  busca: string,
  ...valores: Array<string | number>
) {
  const termos = normalizarBusca(busca).split(/\s+/).filter(Boolean)
  if (termos.length === 0) return true

  const conteudo = normalizarBusca(valores.join(' '))
  return termos.every((termo) => conteudo.includes(termo))
}
