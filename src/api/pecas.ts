import type { Peca, PecaInput } from '../types/peca'
import { api } from './client'

const caminho = '/api/v1/pecas'

export async function listarPecas() {
  const { data } = await api.get<Peca[]>(caminho)
  return data
}

export async function criarPeca(peca: PecaInput) {
  const { data } = await api.post<Peca>(caminho, peca)
  return data
}

export async function buscarPeca(id: number) {
  const { data } = await api.get<Peca>(`${caminho}/${id}`)
  return data
}

export async function atualizarPeca(id: number, peca: PecaInput) {
  const { data } = await api.put<Peca>(`${caminho}/${id}`, peca)
  return data
}

export async function excluirPeca(id: number) {
  await api.delete(`${caminho}/${id}`)
}
