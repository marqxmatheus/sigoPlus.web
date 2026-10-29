export type Servico = {
  id: number
  descricao: string
  valor_padrao: number
  tempo_estimado_min: number
  created_at: string
  updated_at: string
}

export type ServicoInput = Pick<
  Servico,
  'descricao' | 'valor_padrao' | 'tempo_estimado_min'
>
