import type { Servico, ServicoInput } from '../types/servico'
import { api } from './client'

const caminho = '/api/v1/servicos'

export async function listarServicos() {
  const { data } = await api.get<Servico[]>(caminho)
  return data
}

export async function criarServico(servico: ServicoInput) {
  const { data } = await api.post<Servico>(caminho, servico)
  return data
}

export async function buscarServico(id: number) {
  const { data } = await api.get<Servico>(`${caminho}/${id}`)
  return data
}

export async function atualizarServico(id: number, servico: ServicoInput) {
  const { data } = await api.put<Servico>(`${caminho}/${id}`, servico)
  return data
}

export async function excluirServico(id: number) {
  await api.delete(`${caminho}/${id}`)
}
