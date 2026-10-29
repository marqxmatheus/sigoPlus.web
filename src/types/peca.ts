export type Peca = {
  id: number
  codigo: string
  descricao: string
  valor_unitario: number
  qtd_estoque: number
  estoque_minimo: number
  created_at: string
  updated_at: string
}

export type PecaInput = Pick<
  Peca,
  'codigo' | 'descricao' | 'valor_unitario' | 'qtd_estoque' | 'estoque_minimo'
>
