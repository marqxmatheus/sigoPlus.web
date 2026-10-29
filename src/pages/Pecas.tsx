import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CircleCheck,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { excluirPeca, listarPecas } from '../api/pecas'
import { ModalConfirmacaoExclusao } from '../components/ModalConfirmacaoExclusao'
import type { Peca } from '../types/peca'
import { formatarMoeda } from '../utils/formatters'

const colunas = [
  'Código',
  'Descrição',
  'Valor unitário',
  'Estoque',
  'Estoque mínimo',
  'Situação',
  'Ações',
]

type LocationState = {
  mensagem?: string
}

export function Pecas() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mensagemRecebida = (location.state as LocationState | null)?.mensagem
  const [mensagem, setMensagem] = useState<string | null>(
    mensagemRecebida ?? null,
  )
  const [erroExclusao, setErroExclusao] = useState<string | null>(null)
  const [pecaExcluindoId, setPecaExcluindoId] = useState<number | null>(null)
  const [pecaParaExcluir, setPecaParaExcluir] = useState<Peca | null>(null)
  const pecasQuery = useQuery({
    queryKey: ['pecas'],
    queryFn: listarPecas,
  })
  const pecas = pecasQuery.data ?? []

  useEffect(() => {
    if (!mensagemRecebida) return

    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, mensagemRecebida, navigate])

  useEffect(() => {
    if (!mensagem) return

    const temporizador = window.setTimeout(() => setMensagem(null), 3000)

    return () => window.clearTimeout(temporizador)
  }, [mensagem])

  async function confirmarExclusao() {
    if (!pecaParaExcluir) return

    const peca = pecaParaExcluir
    setPecaExcluindoId(peca.id)
    setErroExclusao(null)

    try {
      await excluirPeca(peca.id)
      await queryClient.invalidateQueries({ queryKey: ['pecas'] })
      setMensagem('Peça excluída com sucesso.')
    } catch (erro) {
      setErroExclusao(getApiErrorMessage(erro))
    } finally {
      setPecaExcluindoId(null)
      setPecaParaExcluir(null)
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Package aria-hidden="true" className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Peças</h1>
          </div>
          {!pecasQuery.isLoading && !pecasQuery.isError && (
            <p className="mt-2 text-sm text-muted">
              {pecas.length}{' '}
              {pecas.length === 1 ? 'peça cadastrada' : 'peças cadastradas'}
            </p>
          )}
        </div>

        <Link
          to="/pecas/cadastro"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Plus size={20} aria-hidden="true" />
          Cadastrar peça
        </Link>
      </header>

      {mensagem && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 z-50 flex w-[calc(100%-2.5rem)] max-w-sm items-center gap-3 rounded-md bg-success px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          <CircleCheck className="shrink-0" size={20} aria-hidden="true" />
          <span className="flex-1">{mensagem}</span>
          <button
            type="button"
            aria-label="Fechar alerta"
            title="Fechar"
            onClick={() => setMensagem(null)}
            className="cursor-pointer rounded-sm p-1 text-white transition-colors hover:bg-success-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      {erroExclusao && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-md bg-danger px-4 py-3 text-sm font-medium text-white"
        >
          <span>{erroExclusao}</span>
          <button
            type="button"
            aria-label="Fechar erro"
            title="Fechar"
            onClick={() => setErroExclusao(null)}
            className="cursor-pointer rounded-sm p-1 transition-colors hover:bg-danger-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      {pecasQuery.isLoading && (
        <div className="flex flex-1 items-center justify-center gap-3 py-20 text-muted">
          <LoaderCircle
            className="animate-spin text-primary"
            aria-hidden="true"
          />
          Carregando peças...
        </div>
      )}

      {pecasQuery.isError && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-md bg-danger px-6 py-12 text-center text-white">
          <AlertCircle aria-hidden="true" />
          <div>
            <p className="font-medium text-white">
              Não foi possível carregar as peças
            </p>
            <p className="mt-1 text-sm text-white/80">
              {getApiErrorMessage(pecasQuery.error)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => pecasQuery.refetch()}
            className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-foreground"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {pecasQuery.isSuccess && pecas.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-card px-6 py-16 text-center">
          <Package size={40} className="text-muted" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">
              Nenhuma peça cadastrada
            </p>
            <p className="mt-1 text-sm text-muted">
              Cadastre a primeira peça para começar.
            </p>
          </div>
        </div>
      )}

      {pecasQuery.isSuccess && pecas.length > 0 && (
        <div className="overflow-hidden rounded-sm border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-5xl border-collapse text-left">
              <thead className="bg-surface text-sm text-muted">
                <tr>
                  {colunas.map((coluna) => (
                    <th
                      key={coluna}
                      scope="col"
                      className={`border-b border-border px-5 py-4 font-medium ${
                        coluna === 'Ações' ? 'text-right' : ''
                      }`}
                    >
                      {coluna}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {pecas.map((peca) => {
                  const estoqueBaixo = peca.qtd_estoque < peca.estoque_minimo

                  return (
                    <tr
                      key={peca.id}
                      className="text-sm text-foreground transition-colors hover:bg-surface"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-medium">
                        {peca.codigo}
                      </td>
                      <td className="px-5 py-4 text-muted">{peca.descricao}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-muted">
                        {formatarMoeda(peca.valor_unitario)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-muted">
                        {peca.qtd_estoque}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-muted">
                        {peca.estoque_minimo}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold text-white ${
                            estoqueBaixo ? 'bg-danger' : 'bg-success'
                          }`}
                        >
                          {estoqueBaixo ? 'Estoque baixo' : 'Regular'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/pecas/${peca.id}/editar`}
                            aria-label={`Editar peça ${peca.descricao}`}
                            title="Editar peça"
                            className="inline-flex rounded-md bg-primary p-2 text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                          >
                            <Pencil size={18} aria-hidden="true" />
                          </Link>
                          <button
                            type="button"
                            aria-label={`Excluir peça ${peca.descricao}`}
                            title="Excluir peça"
                            disabled={pecaExcluindoId !== null}
                            onClick={() => {
                              setErroExclusao(null)
                              setPecaParaExcluir(peca)
                            }}
                            className="inline-flex cursor-pointer rounded-md bg-danger p-2 text-white transition-colors hover:bg-danger-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {pecaExcluindoId === peca.id ? (
                              <LoaderCircle
                                size={18}
                                className="animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <Trash2 size={18} aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ModalConfirmacaoExclusao
        aberto={pecaParaExcluir !== null}
        titulo="Excluir peça"
        excluindo={pecaExcluindoId !== null}
        onCancelar={() => setPecaParaExcluir(null)}
        onConfirmar={confirmarExclusao}
        descricao={
          <div className="space-y-2">
            <p>
              Tem certeza que deseja excluir a peça{' '}
              <strong className="text-foreground">
                {pecaParaExcluir?.descricao}
              </strong>
              ?
            </p>
            <p className="text-sm">Esta ação não poderá ser desfeita.</p>
          </div>
        }
      />
    </section>
  )
}
