import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  LoaderCircle,
  Mail,
  MapPin,
  Motorbike,
  Package,
  Phone,
  Plus,
  Save,
  Trash2,
  UserRound,
  Wrench,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { getApiErrorMessage } from '../api/client'
import {
  atualizarOrdemServico,
  buscarOrdemServico,
  excluirOrdemServico,
} from '../api/ordensServico'
import { listarPecas } from '../api/pecas'
import { listarServicos } from '../api/servicos'
import type {
  OrdemServicoItemPeca,
  OrdemServicoItemServico,
} from '../types/ordemServico'
import { formatarMoeda, formatarPlaca } from '../utils/formatters'
import {
  formatarDataOS,
  obterSituacaoOS,
  rotulosPagamento,
} from '../utils/ordemServico'
import { ModalConfirmacaoExclusao } from './ModalConfirmacaoExclusao'

type ModalOrdemServicoProps = {
  ordemId: number | null
  onFechar: () => void
  onExcluida: () => void
}

type ServicoEdicao = Pick<
  OrdemServicoItemServico,
  'servico_id' | 'descricao' | 'valor'
>

type PecaEdicao = Pick<
  OrdemServicoItemPeca,
  'peca_id' | 'descricao' | 'quantidade' | 'valor_unitario'
> & { codigo?: string }

const elementosFocaveis =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

export function ModalOrdemServico({
  ordemId,
  onFechar,
  onExcluida,
}: ModalOrdemServicoProps) {
  const aberto = ordemId !== null
  const queryClient = useQueryClient()
  const painelRef = useRef<HTMLDivElement>(null)
  const botaoFecharRef = useRef<HTMLButtonElement>(null)
  const fecharRef = useRef(onFechar)
  const bloqueiosRef = useRef({
    salvando: false,
    excluindo: false,
    confirmandoExclusao: false,
  })
  const [servicos, setServicos] = useState<ServicoEdicao[]>([])
  const [pecas, setPecas] = useState<PecaEdicao[]>([])
  const [observacao, setObservacao] = useState('')
  const [ordemCarregadaId, setOrdemCarregadaId] = useState<number | null>(null)
  const [servicoSelecionado, setServicoSelecionado] = useState('')
  const [pecaSelecionada, setPecaSelecionada] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [excluindo, setExcluindo] = useState(false)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [erroEdicao, setErroEdicao] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const ordemQuery = useQuery({
    queryKey: ['ordem-servico', ordemId],
    queryFn: () => buscarOrdemServico(ordemId!),
    enabled: aberto,
  })
  const servicosQuery = useQuery({
    queryKey: ['servicos'],
    queryFn: listarServicos,
    enabled: aberto,
  })
  const pecasQuery = useQuery({
    queryKey: ['pecas'],
    queryFn: listarPecas,
    enabled: aberto,
  })
  const ordem = ordemQuery.data

  if (ordem && ordem.id !== ordemCarregadaId) {
    setOrdemCarregadaId(ordem.id)
    setServicos(
      (ordem.servicos ?? []).map((servico) => ({
        servico_id: servico.servico_id,
        descricao: servico.descricao,
        valor: servico.valor,
      })),
    )
    setPecas(
      (ordem.pecas ?? []).map((peca) => ({
        peca_id: peca.peca_id,
        descricao: peca.descricao,
        quantidade: peca.quantidade,
        valor_unitario: peca.valor_unitario,
      })),
    )
    setObservacao(ordem.observacao ?? '')
  }

  useEffect(() => {
    fecharRef.current = onFechar
    bloqueiosRef.current = { salvando, excluindo, confirmandoExclusao }
  }, [confirmandoExclusao, excluindo, onFechar, salvando])

  useEffect(() => {
    if (!aberto) return

    const elementoFocadoAnterior = document.activeElement as HTMLElement | null
    const animacao = window.requestAnimationFrame(() => {
      botaoFecharRef.current?.focus()
    })

    function controlarTeclado(evento: KeyboardEvent) {
      const bloqueios = bloqueiosRef.current

      if (evento.key === 'Escape') {
        if (
          !bloqueios.salvando &&
          !bloqueios.excluindo &&
          !bloqueios.confirmandoExclusao
        ) {
          fecharRef.current()
        }
        return
      }

      if (evento.key !== 'Tab' || bloqueios.confirmandoExclusao) return

      const focaveis = Array.from(
        painelRef.current?.querySelectorAll<HTMLElement>(elementosFocaveis) ??
          [],
      ).filter((elemento) => elemento.offsetParent !== null)
      const primeiro = focaveis.at(0)
      const ultimo = focaveis.at(-1)

      if (!primeiro || !ultimo) {
        evento.preventDefault()
        return
      }

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', controlarTeclado)
    return () => {
      window.cancelAnimationFrame(animacao)
      document.removeEventListener('keydown', controlarTeclado)
      elementoFocadoAnterior?.focus()
    }
  }, [aberto])

  const totalEdicao = useMemo(
    () =>
      servicos.reduce((total, servico) => total + servico.valor, 0) +
      pecas.reduce(
        (total, peca) => total + peca.quantidade * Number(peca.valor_unitario),
        0,
      ),
    [pecas, servicos],
  )

  if (!aberto) return null

  const situacao = ordem ? obterSituacaoOS(ordem.situacao) : null
  const carregandoCatalogos = servicosQuery.isLoading || pecasQuery.isLoading
  const erroCatalogos = servicosQuery.error ?? pecasQuery.error
  const podeExcluir = ordem?.situacao === 'ORCADO'
  const podeSalvar =
    Boolean(ordem) &&
    !salvando &&
    !excluindo &&
    servicos.length + pecas.length > 0

  function adicionarServico() {
    const id = Number(servicoSelecionado)
    const servico = servicosQuery.data?.find((item) => item.id === id)

    if (!servico) {
      setErroEdicao('Selecione um serviço para adicionar.')
      return
    }
    if (servicos.some((item) => item.servico_id === id)) {
      setErroEdicao('Este serviço já está incluído na ordem.')
      return
    }

    setServicos((atuais) => [
      ...atuais,
      {
        servico_id: servico.id,
        descricao: servico.descricao,
        valor: servico.valor_padrao,
      },
    ])
    setServicoSelecionado('')
    setErroEdicao(null)
    setMensagem(null)
  }

  function adicionarPeca() {
    const id = Number(pecaSelecionada)
    const peca = pecasQuery.data?.find((item) => item.id === id)

    if (!peca) {
      setErroEdicao('Selecione uma peça para adicionar.')
      return
    }

    if (pecas.some((item) => item.peca_id === id)) {
      setPecas((atuais) =>
        atuais.map((item) =>
          item.peca_id === id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item,
        ),
      )
    } else {
      setPecas((atuais) => [
        ...atuais,
        {
          peca_id: peca.id,
          codigo: peca.codigo,
          descricao: peca.descricao,
          quantidade: 1,
          valor_unitario: peca.valor_unitario,
        },
      ])
    }

    setPecaSelecionada('')
    setErroEdicao(null)
    setMensagem(null)
  }

  async function salvarAlteracoes() {
    if (!ordem) return
    if (servicos.length === 0 && pecas.length === 0) {
      setErroEdicao('Mantenha pelo menos um serviço ou uma peça na ordem.')
      return
    }

    setSalvando(true)
    setErroEdicao(null)
    setMensagem(null)

    try {
      const atualizada = await atualizarOrdemServico(ordem.id, {
        observacao: observacao.trim(),
        servicos: servicos.map((servico) => ({
          servico_id: servico.servico_id,
        })),
        pecas: pecas.map((peca) => ({
          peca_id: peca.peca_id,
          quantidade: peca.quantidade,
        })),
      })
      queryClient.setQueryData(['ordem-servico', ordem.id], atualizada)
      setServicos(
        (atualizada.servicos ?? []).map((servico) => ({
          servico_id: servico.servico_id,
          descricao: servico.descricao,
          valor: servico.valor,
        })),
      )
      setPecas(
        (atualizada.pecas ?? []).map((peca) => ({
          peca_id: peca.peca_id,
          descricao: peca.descricao,
          quantidade: peca.quantidade,
          valor_unitario: peca.valor_unitario,
        })),
      )
      setObservacao(atualizada.observacao ?? '')
      await queryClient.invalidateQueries({ queryKey: ['ordens-servico'] })
      setMensagem('Alterações salvas com sucesso.')
    } catch (erro) {
      setErroEdicao(getApiErrorMessage(erro))
    } finally {
      setSalvando(false)
    }
  }

  async function confirmarExclusao() {
    if (!ordem || !podeExcluir) return

    setExcluindo(true)
    setErroEdicao(null)

    try {
      await excluirOrdemServico(ordem.id)
      queryClient.removeQueries({ queryKey: ['ordem-servico', ordem.id] })
      await queryClient.invalidateQueries({ queryKey: ['ordens-servico'] })
      setConfirmandoExclusao(false)
      onExcluida()
    } catch (erro) {
      setErroEdicao(getApiErrorMessage(erro))
      setConfirmandoExclusao(false)
      void ordemQuery.refetch()
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-0 backdrop-blur-sm sm:p-4 lg:p-6"
      onMouseDown={(evento) => {
        if (
          evento.target === evento.currentTarget &&
          !salvando &&
          !excluindo &&
          !confirmandoExclusao
        ) {
          onFechar()
        }
      }}
    >
      <div
        ref={painelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-ordem"
        className="flex h-dvh w-full flex-col overflow-hidden bg-background shadow-2xl sm:h-[min(92dvh,58rem)] sm:max-w-7xl sm:rounded-2xl sm:border sm:border-border"
      >
        <header className="relative flex shrink-0 items-center gap-4 overflow-hidden border-b border-border bg-surface px-4 py-4 sm:px-6">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-background/60 text-primary sm:h-14 sm:w-14">
            <Motorbike size={34} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2
                id="titulo-modal-ordem"
                className="truncate text-lg font-bold text-foreground sm:text-xl"
              >
                {ordem ? `Ordem de serviço #${ordem.id}` : 'Ordem de serviço'}
              </h2>
              {situacao && (
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${situacao.classeSuave}`}
                >
                  {situacao.texto}
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-sm text-muted">
              {ordem
                ? `${formatarPlaca(ordem.veiculo_placa)} · ${ordem.cliente_nome}`
                : 'Carregando informações...'}
            </p>
          </div>
          <button
            ref={botaoFecharRef}
            type="button"
            aria-label="Fechar detalhes da ordem"
            title="Fechar"
            disabled={salvando || excluindo}
            onClick={onFechar}
            className="relative cursor-pointer rounded-lg p-2 text-muted transition-colors hover:bg-border hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={24} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
          {ordemQuery.isLoading && (
            <div className="flex min-h-80 items-center justify-center gap-3 text-muted">
              <LoaderCircle
                className="animate-spin text-primary"
                aria-hidden="true"
              />
              Carregando dados da ordem...
            </div>
          )}

          {ordemQuery.isError && (
            <div className="flex min-h-80 flex-col items-center justify-center gap-4 px-6 text-center">
              <AlertCircle className="text-danger" aria-hidden="true" />
              <div>
                <p className="font-semibold text-foreground">
                  Não foi possível carregar a ordem
                </p>
                <p className="mt-1 text-sm text-muted">
                  {getApiErrorMessage(ordemQuery.error)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void ordemQuery.refetch()}
                className="cursor-pointer rounded-md bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-dark"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {ordem && (
            <div className="grid gap-5 p-4 sm:p-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(19rem,0.8fr)]">
              <div className="min-w-0 space-y-5">
                {mensagem && (
                  <div
                    role="status"
                    className="flex items-center gap-3 rounded-lg border border-success/40 bg-success/15 px-4 py-3 text-sm text-green-400"
                  >
                    <CheckCircle2 size={19} aria-hidden="true" />
                    {mensagem}
                  </div>
                )}
                {erroEdicao && (
                  <div
                    role="alert"
                    className="flex items-center gap-3 rounded-lg border border-danger/40 bg-danger/15 px-4 py-3 text-sm text-red-300"
                  >
                    <AlertCircle size={19} aria-hidden="true" />
                    {erroEdicao}
                  </div>
                )}
                {erroCatalogos && (
                  <div
                    role="alert"
                    className="flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/15 px-4 py-3 text-sm text-amber-300"
                  >
                    <AlertCircle size={19} aria-hidden="true" />
                    Os itens atuais estão disponíveis, mas não foi possível
                    carregar o catálogo para novas inclusões.
                  </div>
                )}

                <section className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex flex-col gap-3 border-b border-border bg-surface/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex items-center gap-3">
                      <Wrench className="text-primary" aria-hidden="true" />
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Serviços
                        </h3>
                        <p className="text-xs text-muted">
                          {servicos.length}{' '}
                          {servicos.length === 1
                            ? 'serviço incluído'
                            : 'serviços incluídos'}
                        </p>
                      </div>
                    </div>
                    <form
                      className="flex min-w-0 flex-1 gap-2 sm:max-w-xl sm:justify-end"
                      onSubmit={(evento) => {
                        evento.preventDefault()
                        adicionarServico()
                      }}
                    >
                      <label htmlFor="novo-servico" className="sr-only">
                        Novo serviço
                      </label>
                      <select
                        id="novo-servico"
                        value={servicoSelecionado}
                        disabled={carregandoCatalogos || salvando}
                        onChange={(evento) =>
                          setServicoSelecionado(evento.target.value)
                        }
                        className="h-10 min-w-0 flex-1 rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary disabled:opacity-60"
                      >
                        <option value="">
                          {carregandoCatalogos
                            ? 'Carregando serviços...'
                            : 'Selecione um serviço'}
                        </option>
                        {(servicosQuery.data ?? []).map((servico) => (
                          <option
                            key={servico.id}
                            value={servico.id}
                            disabled={servicos.some(
                              (item) => item.servico_id === servico.id,
                            )}
                          >
                            {servico.descricao} —{' '}
                            {formatarMoeda(servico.valor_padrao)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={
                          !servicoSelecionado || carregandoCatalogos || salvando
                        }
                        className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus size={17} aria-hidden="true" />
                        <span className="hidden sm:inline">Adicionar</span>
                      </button>
                    </form>
                  </div>

                  {servicos.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-muted">
                      Nenhum serviço incluído.
                    </p>
                  ) : (
                    <div className="divide-y divide-border">
                      {servicos.map((servico) => (
                        <div
                          key={servico.servico_id}
                          className="flex items-center gap-3 px-4 py-3 sm:px-5"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {servico.descricao}
                            </p>
                            <p className="mt-0.5 text-xs text-muted">
                              Serviço #{servico.servico_id}
                            </p>
                          </div>
                          <span className="text-sm font-semibold whitespace-nowrap text-foreground">
                            {formatarMoeda(servico.valor)}
                          </span>
                          <button
                            type="button"
                            aria-label={`Remover serviço ${servico.descricao}`}
                            title="Remover serviço"
                            disabled={salvando}
                            onClick={() => {
                              setServicos((atuais) =>
                                atuais.filter(
                                  (item) =>
                                    item.servico_id !== servico.servico_id,
                                ),
                              )
                              setMensagem(null)
                            }}
                            className="cursor-pointer rounded-md p-2 text-muted transition-colors hover:bg-danger/15 hover:text-danger disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={17} aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex flex-col gap-3 border-b border-border bg-surface/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex items-center gap-3">
                      <Package className="text-primary" aria-hidden="true" />
                      <div>
                        <h3 className="font-semibold text-foreground">Peças</h3>
                        <p className="text-xs text-muted">
                          {pecas.length}{' '}
                          {pecas.length === 1
                            ? 'peça incluída'
                            : 'peças incluídas'}
                        </p>
                      </div>
                    </div>
                    <form
                      className="flex min-w-0 flex-1 gap-2 sm:max-w-xl sm:justify-end"
                      onSubmit={(evento) => {
                        evento.preventDefault()
                        adicionarPeca()
                      }}
                    >
                      <label htmlFor="nova-peca" className="sr-only">
                        Nova peça
                      </label>
                      <select
                        id="nova-peca"
                        value={pecaSelecionada}
                        disabled={carregandoCatalogos || salvando}
                        onChange={(evento) =>
                          setPecaSelecionada(evento.target.value)
                        }
                        className="h-10 min-w-0 flex-1 rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-primary disabled:opacity-60"
                      >
                        <option value="">
                          {carregandoCatalogos
                            ? 'Carregando peças...'
                            : 'Selecione uma peça'}
                        </option>
                        {(pecasQuery.data ?? []).map((peca) => (
                          <option key={peca.id} value={peca.id}>
                            {peca.codigo} · {peca.descricao} —{' '}
                            {formatarMoeda(peca.valor_unitario)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={
                          !pecaSelecionada || carregandoCatalogos || salvando
                        }
                        className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus size={17} aria-hidden="true" />
                        <span className="hidden sm:inline">Adicionar</span>
                      </button>
                    </form>
                  </div>

                  {pecas.length === 0 ? (
                    <p className="px-5 py-8 text-center text-sm text-muted">
                      Nenhuma peça incluída.
                    </p>
                  ) : (
                    <div className="divide-y divide-border">
                      {pecas.map((peca) => (
                        <div
                          key={peca.peca_id}
                          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_5rem_auto_auto] sm:px-5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {peca.descricao}
                            </p>
                            <p className="mt-0.5 text-xs text-muted">
                              {peca.codigo ? `${peca.codigo} · ` : ''}
                              {formatarMoeda(peca.valor_unitario)} cada
                            </p>
                          </div>
                          <div className="col-start-1 row-start-2 flex items-center gap-2 justify-self-end sm:col-start-2 sm:row-start-1">
                            <label
                              htmlFor={`quantidade-peca-${peca.peca_id}`}
                              className="text-xs text-muted sm:sr-only"
                            >
                              Qtd.
                            </label>
                            <input
                              id={`quantidade-peca-${peca.peca_id}`}
                              type="number"
                              min={1}
                              step={1}
                              value={peca.quantidade}
                              disabled={salvando}
                              onChange={(evento) => {
                                const quantidade = Math.max(
                                  1,
                                  Math.trunc(Number(evento.target.value) || 1),
                                )
                                setPecas((atuais) =>
                                  atuais.map((item) =>
                                    item.peca_id === peca.peca_id
                                      ? { ...item, quantidade }
                                      : item,
                                  ),
                                )
                                setMensagem(null)
                              }}
                              className="h-9 w-20 rounded-md border border-border bg-surface px-2 text-center text-sm text-foreground outline-none focus:border-primary disabled:opacity-60"
                            />
                          </div>
                          <span className="col-start-2 row-start-2 text-right text-sm font-semibold whitespace-nowrap text-foreground sm:col-start-3 sm:row-start-1">
                            {formatarMoeda(
                              peca.quantidade * peca.valor_unitario,
                            )}
                          </span>
                          <button
                            type="button"
                            aria-label={`Remover peça ${peca.descricao}`}
                            title="Remover peça"
                            disabled={salvando}
                            onClick={() => {
                              setPecas((atuais) =>
                                atuais.filter(
                                  (item) => item.peca_id !== peca.peca_id,
                                ),
                              )
                              setMensagem(null)
                            }}
                            className="col-start-2 row-start-1 cursor-pointer justify-self-end rounded-md p-2 text-muted transition-colors hover:bg-danger/15 hover:text-danger disabled:cursor-not-allowed disabled:opacity-50 sm:col-start-4"
                          >
                            <Trash2 size={17} aria-hidden="true" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section className="rounded-xl border border-border bg-card p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Observações
                      </h3>
                      <p className="mt-0.5 text-xs text-muted">
                        Registre diagnósticos, orientações e informações da
                        execução.
                      </p>
                    </div>
                    <span className="text-xs text-muted">
                      {observacao.length}/500
                    </span>
                  </div>
                  <label htmlFor="observacao-ordem" className="sr-only">
                    Observações da ordem
                  </label>
                  <textarea
                    id="observacao-ordem"
                    value={observacao}
                    maxLength={500}
                    rows={5}
                    disabled={salvando}
                    onChange={(evento) => {
                      setObservacao(evento.target.value)
                      setMensagem(null)
                    }}
                    placeholder="Adicione observações sobre esta ordem de serviço"
                    className="w-full resize-y rounded-lg border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted/70 focus:border-primary disabled:opacity-60"
                  />
                </section>
              </div>

              <aside className="space-y-5">
                <section className="overflow-hidden rounded-xl border border-border bg-card">
                  <div className="flex items-center justify-center border-b border-border bg-surface py-6 text-primary">
                    <Motorbike
                      size={76}
                      strokeWidth={1.25}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="p-5">
                    <p className="font-mono text-center text-2xl font-black tracking-[0.16em] text-foreground uppercase">
                      {formatarPlaca(ordem.veiculo_placa)}
                    </p>
                    <h3 className="mt-4 text-center text-lg font-semibold text-foreground">
                      {[ordem.veiculo_marca, ordem.veiculo_modelo]
                        .filter(Boolean)
                        .join(' ') || 'Modelo não informado'}
                    </h3>
                    <p className="mt-1 text-center text-sm text-muted">
                      {ordem.veiculo_ano > 0
                        ? `Ano ${ordem.veiculo_ano}`
                        : 'Ano não informado'}
                    </p>
                  </div>
                </section>

                <section className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <UserRound className="text-primary" aria-hidden="true" />
                    <h3 className="font-semibold text-foreground">Cliente</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <p className="font-medium text-foreground">
                      {ordem.cliente_nome}
                    </p>
                    {ordem.cliente_telefone && (
                      <a
                        href={`tel:${ordem.cliente_telefone}`}
                        className="flex items-start gap-2 text-muted transition-colors hover:text-primary-light"
                      >
                        <Phone
                          size={16}
                          className="mt-0.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="break-all">
                          {ordem.cliente_telefone}
                        </span>
                      </a>
                    )}
                    {ordem.cliente_email && (
                      <a
                        href={`mailto:${ordem.cliente_email}`}
                        className="flex items-start gap-2 text-muted transition-colors hover:text-primary-light"
                      >
                        <Mail
                          size={16}
                          className="mt-0.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="break-all">{ordem.cliente_email}</span>
                      </a>
                    )}
                    {ordem.cliente_endereco && (
                      <p className="flex items-start gap-2 text-muted">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="break-words">
                          {ordem.cliente_endereco}
                        </span>
                      </p>
                    )}
                    {!ordem.cliente_telefone &&
                      !ordem.cliente_email &&
                      !ordem.cliente_endereco && (
                        <p className="text-muted">
                          Nenhum contato adicional informado.
                        </p>
                      )}
                  </div>
                </section>

                <section className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <CalendarClock
                      className="text-primary"
                      aria-hidden="true"
                    />
                    <h3 className="font-semibold text-foreground">
                      Informações da ordem
                    </h3>
                  </div>
                  <dl className="space-y-4 text-sm">
                    <ResumoItem titulo="Aberta em">
                      {formatarDataOS(ordem.created_at)}
                    </ResumoItem>
                    <ResumoItem titulo="Última atualização">
                      {formatarDataOS(ordem.updated_at)}
                    </ResumoItem>
                    {ordem.forma_pagamento && (
                      <ResumoItem titulo="Forma de pagamento">
                        {rotulosPagamento[ordem.forma_pagamento]}
                      </ResumoItem>
                    )}
                    {ordem.data_pagamento && (
                      <ResumoItem titulo="Pagamento realizado em">
                        {formatarDataOS(ordem.data_pagamento)}
                      </ResumoItem>
                    )}
                  </dl>
                </section>
              </aside>
            </div>
          )}
        </div>

        {ordem && (
          <footer className="flex shrink-0 flex-col gap-3 border-t border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center justify-between gap-4 sm:justify-start">
              {podeExcluir ? (
                <button
                  type="button"
                  disabled={salvando || excluindo}
                  onClick={() => setConfirmandoExclusao(true)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={18} aria-hidden="true" />
                  Excluir ordem
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2 sm:hidden">
                <CircleDollarSign
                  size={18}
                  className="text-primary"
                  aria-hidden="true"
                />
                <strong className="text-lg text-foreground">
                  {formatarMoeda(totalEdicao)}
                </strong>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="mr-2 hidden text-right sm:block">
                <p className="text-xs text-muted">Total da ordem</p>
                <p className="text-xl font-bold text-foreground">
                  {formatarMoeda(totalEdicao)}
                </p>
              </div>
              <button
                type="button"
                disabled={!podeSalvar}
                onClick={() => void salvarAlteracoes()}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                {salvando ? (
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Save size={18} aria-hidden="true" />
                )}
                {salvando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </footer>
        )}
      </div>

      <ModalConfirmacaoExclusao
        aberto={confirmandoExclusao}
        titulo="Excluir ordem de serviço"
        descricao={
          <p>
            Tem certeza que deseja excluir a ordem{' '}
            <strong className="text-foreground">#{ordem?.id}</strong>? Esta ação
            não poderá ser desfeita.
          </p>
        }
        excluindo={excluindo}
        onCancelar={() => setConfirmandoExclusao(false)}
        onConfirmar={() => void confirmarExclusao()}
      />
    </div>
  )
}

type ResumoItemProps = {
  titulo: string
  children: React.ReactNode
}

function ResumoItem({ titulo, children }: ResumoItemProps) {
  return (
    <div>
      <dt className="text-xs text-muted">{titulo}</dt>
      <dd className="mt-1 font-medium text-foreground">{children}</dd>
    </div>
  )
}
