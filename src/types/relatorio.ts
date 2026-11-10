import type { Cliente } from './cliente'
import type { FormaPagamento, SituacaoOS } from './ordemServico'

export type ItemRelatorioEstoque = {
  peca_id: number
  codigo: string
  descricao: string
  qtd_estoque: number
  estoque_minimo: number
  valor_unitario: number
  valor_total: number
  abaixo_minimo: boolean
}

export type RelatorioEstoque = {
  data_emissao: string
  itens: ItemRelatorioEstoque[]
  total_pecas: number
  quantidade_total: number
  valor_total: number
  total_abaixo_minimo: number
}

export type ItemRelatorioOS = {
  ordem_servico_id: number
  data_abertura: string
  situacao: SituacaoOS
  cliente_id: number
  cliente_nome: string
  veiculo_placa: string
  veiculo_marca: string
  veiculo_modelo: string
  valor_total: number
  forma_pagamento: FormaPagamento | null
  data_pagamento: string | null
}

export type RelatorioOSPeriodo = {
  data_emissao: string
  data_inicio?: string
  data_fim?: string
  itens: ItemRelatorioOS[]
  quantidade: number
  valor_total: number
}

export type RelatorioOSCliente = {
  data_emissao: string
  cliente?: Cliente
  itens: ItemRelatorioOS[]
  quantidade: number
  valor_total: number
}
