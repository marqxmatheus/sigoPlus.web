import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CircleCheck,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  Wrench,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { excluirServico, listarServicos } from '../api/servicos'
import { CampoBusca } from '../components/CampoBusca'
import { ModalConfirmacaoExclusao } from '../components/ModalConfirmacaoExclusao'
import type { Servico } from '../types/servico'
import { formatarDuracao, formatarMoeda } from '../utils/formatters'
import { correspondeABusca } from '../utils/search'

const colunas = ['Descrição', 'Valor padrão', 'Tempo estimado', 'Ações']

type LocationState = {
  mensagem?: string
}

export function Servicos() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mensagemRecebida = (location.state as LocationState | null)?.mensagem
  const [mensagem, setMensagem] = useState<string | null>(
    mensagemRecebida ?? null,
  )
  const [erroExclusao, setErroExclusao] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [servicoExcluindoId, setServicoExcluindoId] = useState<number | null>(
    null,
  )
  const [servicoParaExcluir, setServicoParaExcluir] = useState<Servico | null>(
    null,
  )
  const servicosQuery = useQuery({
    queryKey: ['servicos'],
    queryFn: listarServicos,
  })
  const servicos = servicosQuery.data ?? []
  const servicosFiltrados = servicos.filter((servico) =>
    correspondeABusca(busca, servico.descricao),
  )

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
    if (!servicoParaExcluir) return

    const servico = servicoParaExcluir
    setServicoExcluindoId(servico.id)
    setErroExclusao(null)

    try {
      await excluirServico(servico.id)
      await queryClient.invalidateQueries({ queryKey: ['servicos'] })
      setMensagem('Serviço excluído com sucesso.')
    } catch (erro) {
      setErroExclusao(getApiErrorMessage(erro))
    } finally {
      setServicoExcluindoId(null)
      setServicoParaExcluir(null)
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Wrench aria-hidden="true" className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
          </div>
          {!servicosQuery.isLoading && !servicosQuery.isError && (
            <p className="mt-2 text-sm text-muted">
              {servicos.length}{' '}
              {servicos.length === 1
                ? 'serviço cadastrado'
                : 'serviços cadastrados'}
            </p>
          )}
        </div>

        <Link
          to="/servicos/cadastro"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Plus size={20} aria-hidden="true" />
          Cadastrar serviço
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

      {servicosQuery.isLoading && (
        <div className="flex flex-1 items-center justify-center gap-3 py-20 text-muted">
          <LoaderCircle
            className="animate-spin text-primary"
            aria-hidden="true"
          />
          Carregando serviços...
        </div>
      )}

      {servicosQuery.isError && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-md bg-danger px-6 py-12 text-center text-white">
          <AlertCircle aria-hidden="true" />
          <div>
            <p className="font-medium text-white">
              Não foi possível carregar os serviços
            </p>
            <p className="mt-1 text-sm text-white/80">
              {getApiErrorMessage(servicosQuery.error)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => servicosQuery.refetch()}
            className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-foreground"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {servicosQuery.isSuccess && servicos.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-card px-6 py-16 text-center">
          <Wrench size={40} className="text-muted" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">
              Nenhum serviço cadastrado
            </p>
            <p className="mt-1 text-sm text-muted">
              Cadastre o primeiro serviço para começar.
            </p>
          </div>
        </div>
      )}

      {servicosQuery.isSuccess && servicos.length > 0 && (
        <CampoBusca
          valor={busca}
          onChange={setBusca}
          placeholder="Buscar serviço por descrição"
          ariaLabel="Buscar serviços"
        />
      )}

      {servicosQuery.isSuccess &&
        servicos.length > 0 &&
        servicosFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-card px-6 py-12 text-center">
            <Wrench size={40} className="text-muted" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">
                Nenhum serviço encontrado
              </p>
              <p className="mt-1 text-sm text-muted">
                Tente buscar por outra descrição.
              </p>
            </div>
          </div>
        )}

      {servicosQuery.isSuccess && servicosFiltrados.length > 0 && (
        <div className="overflow-hidden rounded-sm border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-3xl border-collapse text-left">
              <thead className="bg-surface text-sm text-muted">
                <tr>
                  {colunas.map((coluna) => (
                    <th
                      key={coluna}
                      scope="col"
                      className={`border-b border-border px-5 py-4 font-medium ${
                        coluna === 'Ações'
                          ? 'sticky right-0 z-10 border-l border-border bg-surface text-right'
                          : ''
                      }`}
                    >
                      {coluna}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {servicosFiltrados.map((servico) => (
                  <tr
                    key={servico.id}
                    className="group text-sm text-foreground transition-colors hover:bg-surface"
                  >
                    <td className="px-5 py-4 font-medium">
                      {servico.descricao}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {formatarMoeda(servico.valor_padrao)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {formatarDuracao(servico.tempo_estimado_min)}
                    </td>
                    <td className="sticky right-0 z-10 w-px border-l border-border bg-card px-5 py-4 text-right whitespace-nowrap transition-colors group-hover:bg-surface">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/servicos/${servico.id}/editar`}
                          aria-label={`Editar serviço ${servico.descricao}`}
                          title="Editar serviço"
                          className="inline-flex rounded-md bg-primary p-2 text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          <Pencil size={18} aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          aria-label={`Excluir serviço ${servico.descricao}`}
                          title="Excluir serviço"
                          disabled={servicoExcluindoId !== null}
                          onClick={() => {
                            setErroExclusao(null)
                            setServicoParaExcluir(servico)
                          }}
                          className="inline-flex cursor-pointer rounded-md bg-danger p-2 text-white transition-colors hover:bg-danger-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {servicoExcluindoId === servico.id ? (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ModalConfirmacaoExclusao
        aberto={servicoParaExcluir !== null}
        titulo="Excluir serviço"
        excluindo={servicoExcluindoId !== null}
        onCancelar={() => setServicoParaExcluir(null)}
        onConfirmar={confirmarExclusao}
        descricao={
          <div className="space-y-2">
            <p>
              Tem certeza que deseja excluir o serviço{' '}
              <strong className="text-foreground">
                {servicoParaExcluir?.descricao}
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
