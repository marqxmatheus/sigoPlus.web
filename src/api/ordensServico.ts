import type {
  OrdemServico,
  OrdemServicoAtualizacaoInput,
  OrdemServicoInput,
} from '../types/ordemServico'
import { api } from './client'

const caminho = '/api/v1/ordens-servico'

export async function listarOrdensServico() {
  const { data } = await api.get<OrdemServico[]>(caminho)
  return data
}

export async function criarOrdemServico(ordem: OrdemServicoInput) {
  const { data } = await api.post<OrdemServico>(caminho, ordem)
  return data
}

export async function buscarOrdemServico(id: number) {
  const { data } = await api.get<OrdemServico>(`${caminho}/${id}`)
  return data
}

export async function atualizarOrdemServico(
  id: number,
  ordem: OrdemServicoAtualizacaoInput,
) {
  const { data } = await api.put<OrdemServico>(`${caminho}/${id}`, ordem)
  return data
}

export async function excluirOrdemServico(id: number) {
  await api.delete(`${caminho}/${id}`)
}
