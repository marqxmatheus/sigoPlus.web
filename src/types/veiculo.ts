export type Veiculo = {
  id: number
  cliente_id: number
  placa: string
  marca: string
  modelo: string
  ano: number
  created_at: string
  updated_at: string
}

export type VeiculoInput = Pick<
  Veiculo,
  'cliente_id' | 'placa' | 'marca' | 'modelo' | 'ano'
>
