export type SituacaoOS =
  | 'ORCADO'
  | 'EM_FILA'
  | 'EM_ANDAMENTO'
  | 'AGUARDANDO_PECA'
  | 'FINALIZADO'
  | 'PAGO'

export type FormaPagamento = 'DINHEIRO' | 'PIX' | 'CARTAO'

export type OrdemServicoItemServico = {
  id: number
  ordem_servico_id: number
  servico_id: number
  descricao: string
  valor: number
}

export type OrdemServicoItemPeca = {
  id: number
  ordem_servico_id: number
  peca_id: number
  descricao: string
  quantidade: number
  valor_unitario: number
}

export type OrdemServico = {
  id: number
  cliente_id: number
  cliente_nome: string
  cliente_telefone: string
  cliente_email: string
  cliente_endereco: string
  veiculo_id: number
  veiculo_placa: string
  veiculo_marca: string
  veiculo_modelo: string
  veiculo_ano: number
  situacao: SituacaoOS
  valor_total: number
  observacao: string
  servicos?: OrdemServicoItemServico[]
  pecas?: OrdemServicoItemPeca[]
  forma_pagamento?: FormaPagamento
  data_pagamento?: string
  created_at: string
  updated_at: string
}

export type OrdemServicoItemServicoInput = Pick<
  OrdemServicoItemServico,
  'servico_id'
>

export type OrdemServicoItemPecaInput = Pick<
  OrdemServicoItemPeca,
  'peca_id' | 'quantidade'
>

export type OrdemServicoInput = Pick<
  OrdemServico,
  'cliente_id' | 'veiculo_id' | 'observacao'
> & {
  servicos: OrdemServicoItemServicoInput[]
  pecas: OrdemServicoItemPecaInput[]
}

export type OrdemServicoAtualizacaoInput = Pick<OrdemServico, 'observacao'> & {
  servicos: OrdemServicoItemServicoInput[]
  pecas: OrdemServicoItemPecaInput[]
}
