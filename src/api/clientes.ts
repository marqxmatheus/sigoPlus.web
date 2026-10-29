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

export async function buscarCliente(id: number) {
  const { data } = await api.get<Cliente>(`${caminho}/${id}`)
  return data
}

export async function atualizarCliente(id: number, cliente: ClienteInput) {
  const { data } = await api.put<Cliente>(`${caminho}/${id}`, cliente)
  return data
}

export async function excluirCliente(id: number) {
  await api.delete(`${caminho}/${id}`)
}
