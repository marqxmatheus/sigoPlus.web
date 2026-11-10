import type {
  RelatorioEstoque,
  RelatorioOSCliente,
  RelatorioOSPeriodo,
} from '../types/relatorio'
import { api } from './client'

const caminho = '/api/v1/relatorios'

export type FiltrosRelatorioEstoque = {
  busca?: string
  abaixo_minimo?: boolean
}

export type FiltrosRelatorioPeriodo = {
  data_inicio?: string
  data_fim?: string
}

export async function relatorioEstoque(
  filtros: FiltrosRelatorioEstoque = {},
) {
  const { data } = await api.get<RelatorioEstoque>(`${caminho}/estoque`, {
    params: filtros,
  })
  return data
}

export async function relatorioOrdensPeriodo(
  filtros: FiltrosRelatorioPeriodo = {},
) {
  const { data } = await api.get<RelatorioOSPeriodo>(
    `${caminho}/ordens-periodo`,
    { params: filtros },
  )
  return data
}

export async function relatorioOrdensCliente(cliente_id?: number) {
  const { data } = await api.get<RelatorioOSCliente>(
    `${caminho}/ordens-cliente`,
    { params: { cliente_id } },
  )
  return data
}
