export type Cliente = {
  id: number
  nome: string
  cpf_cnpj: string
  telefone: string
  email: string
  endereco: string
  created_at: string
  updated_at: string
}

export type ClienteInput = Pick<
  Cliente,
  'nome' | 'cpf_cnpj' | 'telefone' | 'email' | 'endereco'
>
