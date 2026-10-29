import type { Veiculo, VeiculoInput } from '../types/veiculo'
import { api } from './client'

const caminho = '/api/v1/veiculos'

export async function listarVeiculos() {
  const { data } = await api.get<Veiculo[]>(caminho)
  return data
}

export async function listarVeiculosPorCliente(clienteId: number) {
  const { data } = await api.get<Veiculo[]>(
    `/api/v1/clientes/${clienteId}/veiculos`,
  )
  return data
}

export async function criarVeiculo(veiculo: VeiculoInput) {
  const { data } = await api.post<Veiculo>(caminho, veiculo)
  return data
}

export async function buscarVeiculo(id: number) {
  const { data } = await api.get<Veiculo>(`${caminho}/${id}`)
  return data
}

export async function atualizarVeiculo(id: number, veiculo: VeiculoInput) {
  const { data } = await api.put<Veiculo>(`${caminho}/${id}`, veiculo)
  return data
}

export async function excluirVeiculo(id: number) {
  await api.delete(`${caminho}/${id}`)
}
