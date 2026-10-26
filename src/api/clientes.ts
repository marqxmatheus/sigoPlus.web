import { api } from './client'
import type { Cliente, ClienteInput } from '../types/cliente'

const caminho = '/api/v1/clientes'

export async function listarClientes() {
  const { data } = await api.get<Cliente[]>(caminho)
  return data
}

export async function criarCliente(cliente: ClienteInput) {
  const { data } = await api.post<Cliente>(caminho, cliente)
  return data
}
