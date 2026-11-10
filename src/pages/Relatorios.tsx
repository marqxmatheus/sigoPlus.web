import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  Boxes,
  ChartNoAxesCombined,
  ClipboardList,
  Download,
  LoaderCircle,
  Search,
  TriangleAlert,
  UserRoundSearch,
} from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { listarClientes } from '../api/clientes'
import {
  relatorioEstoque,
  relatorioOrdensCliente,
  relatorioOrdensPeriodo,
  type FiltrosRelatorioEstoque,
  type FiltrosRelatorioPeriodo,
} from '../api/relatorios'
import type {
  ItemRelatorioEstoque,
  ItemRelatorioOS,
} from '../types/relatorio'
import { formatarMoeda, formatarPlaca } from '../utils/formatters'
import {
  formatarDataOS,
  obterSituacaoOS,
  rotulosPagamento,
} from '../utils/ordemServico'

type AbaRelatorio = 'estoque' | 'periodo' | 'cliente'

const abas: Array<{
  id: AbaRelatorio
  titulo: string
  descricao: string
  icone: typeof Boxes
}> = [
  {
    id: 'estoque',
    titulo: 'Estoque de peças',
    descricao: 'Posição atual e itens abaixo do mínimo',
    icone: Boxes,
  },
  {
    id: 'periodo',
    titulo: 'Ordens por período',
    descricao: 'Movimentação em um intervalo de datas',
    icone: ClipboardList,
  },
  {
    id: 'cliente',
    titulo: 'Ordens por cliente',
    descricao: 'Histórico de ordens de cada cliente',
    icone: UserRoundSearch,
  },
]

function CartaoResumo({
  titulo,
  valor,
  destaque,
  icone,
}: {
  titulo: string
  valor: string | number
  destaque?: 'alerta'
  icone?: ReactNode
}) {
  return (
    <div
      className={`rounded-md border bg-card p-4 ${
        destaque === 'alerta' ? 'border-warning/60' : 'border-border'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{titulo}</p>
        {icone}
      </div>
      <p
        className={`mt-2 text-2xl font-bold ${
          destaque === 'alerta' ? 'text-warning' : 'text-foreground'
        }`}
      >
        {valor}
      </p>
    </div>
  )
}

function Carregando({ texto }: { texto: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-muted">
      <LoaderCircle className="animate-spin text-primary" aria-hidden="true" />
      {texto}
    </div>
  )
}

function ErroConsulta({
  erro,
  onTentarNovamente,
}: {
  erro: unknown
  onTentarNovamente: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-md bg-danger px-6 py-12 text-center text-white">
      <AlertCircle aria-hidden="true" />
      <div>
        <p className="font-medium">Não foi possível gerar o relatório</p>
        <p className="mt-1 text-sm text-white/80">
          {getApiErrorMessage(erro)}
        </p>
      </div>
      <button
        type="button"
        onClick={onTentarNovamente}
        className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-foreground"
      >
        Tentar novamente
      </button>
    </div>
  )
}

function AcoesRelatorio({
  data,
  exportando,
  onExportar,
}: {
  data: string
  exportando: boolean
  onExportar: () => void
}) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted">Emitido em {formatarDataOS(data)}</p>
      <button
        type="button"
        onClick={onExportar}
        disabled={exportando}
        className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-primary px-4 text-sm font-semibold text-primary-light transition-colors hover:bg-primary hover:text-white disabled:cursor-wait disabled:opacity-60"
      >
        {exportando ? (
          <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
        ) : (
          <Download size={18} aria-hidden="true" />
        )}
        {exportando ? 'Gerando PDF...' : 'Exportar em PDF'}
      </button>
    </div>
  )
}

function TabelaEstoque({ itens }: { itens: ItemRelatorioEstoque[] }) {
  if (itens.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card px-6 py-12 text-center">
        <Boxes className="mx-auto text-muted" size={38} aria-hidden="true" />
        <p className="mt-3 font-medium text-foreground">
          Nenhuma peça encontrada
        </p>
        <p className="mt-1 text-sm text-muted">
          Ajuste a busca ou remova o filtro de estoque mínimo.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-4xl border-collapse text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="border-b border-border px-5 py-4 font-medium">
                Código
              </th>
              <th className="border-b border-border px-5 py-4 font-medium">
                Descrição
              </th>
              <th className="border-b border-border px-5 py-4 text-right font-medium">
                Quantidade
              </th>
              <th className="border-b border-border px-5 py-4 text-right font-medium">
                Estoque mínimo
              </th>
              <th className="border-b border-border px-5 py-4 text-right font-medium">
                Valor unitário
              </th>
              <th className="border-b border-border px-5 py-4 text-right font-medium">
                Valor em estoque
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {itens.map((item) => (
              <tr
                key={item.peca_id}
                className={`transition-colors hover:bg-surface ${
                  item.abaixo_minimo ? 'bg-warning/10' : ''
                }`}
              >
                <td className="whitespace-nowrap px-5 py-4 font-medium">
                  {item.codigo}
                </td>
                <td className="px-5 py-4">{item.descricao}</td>
                <td className="px-5 py-4 text-right">
                  <span
                    className={
                      item.abaixo_minimo ? 'font-semibold text-warning' : ''
                    }
                  >
                    {item.qtd_estoque}
                  </span>
                  {item.abaixo_minimo && (
                    <span className="ml-2 inline-flex rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning">
                      Baixo
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  {item.estoque_minimo}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  {formatarMoeda(item.valor_unitario)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right font-medium">
                  {formatarMoeda(item.valor_total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TabelaOrdens({ itens }: { itens: ItemRelatorioOS[] }) {
  if (itens.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card px-6 py-12 text-center">
        <ClipboardList
          className="mx-auto text-muted"
          size={38}
          aria-hidden="true"
        />
        <p className="mt-3 font-medium text-foreground">
          Nenhuma ordem encontrada
        </p>
        <p className="mt-1 text-sm text-muted">
          Não há ordens de serviço para o filtro informado.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-6xl border-collapse text-left text-sm">
          <thead className="bg-surface text-muted">
            <tr>
              <th className="border-b border-border px-5 py-4 font-medium">
                Ordem
              </th>
              <th className="border-b border-border px-5 py-4 font-medium">
                Abertura
              </th>
              <th className="border-b border-border px-5 py-4 font-medium">
                Cliente
              </th>
              <th className="border-b border-border px-5 py-4 font-medium">
                Veículo
              </th>
              <th className="border-b border-border px-5 py-4 font-medium">
                Situação
              </th>
              <th className="border-b border-border px-5 py-4 font-medium">
                Pagamento
              </th>
              <th className="border-b border-border px-5 py-4 text-right font-medium">
                Valor
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {itens.map((item) => {
              const situacao = obterSituacaoOS(item.situacao)

              return (
                <tr
                  key={item.ordem_servico_id}
                  className="transition-colors hover:bg-surface"
                >
                  <td className="px-5 py-4">
                    <Link
                      to={`/ordens-servico/${item.ordem_servico_id}`}
                      className="font-semibold text-primary-light hover:underline"
                    >
                      #{item.ordem_servico_id}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    {formatarDataOS(item.data_abertura)}
                  </td>
                  <td className="px-5 py-4 font-medium">
                    {item.cliente_nome}
                  </td>
                  <td className="px-5 py-4">
                    <span className="whitespace-nowrap font-medium">
                      {formatarPlaca(item.veiculo_placa)}
                    </span>
                    <span className="mt-0.5 block whitespace-nowrap text-xs text-muted">
                      {item.veiculo_marca} {item.veiculo_modelo}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${situacao.classeSuave}`}
                    >
                      {situacao.texto}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {item.forma_pagamento ? (
                      <>
                        <span>{rotulosPagamento[item.forma_pagamento]}</span>
                        <span className="mt-0.5 block whitespace-nowrap text-xs text-muted">
                          {formatarDataOS(item.data_pagamento ?? undefined)}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted">Pendente</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right font-semibold">
                    {formatarMoeda(item.valor_total)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Relatorios() {
  const [aba, setAba] = useState<AbaRelatorio>('estoque')
  const [buscaEstoque, setBuscaEstoque] = useState('')
  const [apenasAbaixoMinimo, setApenasAbaixoMinimo] = useState(false)
  const [filtrosEstoque, setFiltrosEstoque] =
    useState<FiltrosRelatorioEstoque>({})
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [filtrosPeriodo, setFiltrosPeriodo] =
    useState<FiltrosRelatorioPeriodo>({})
  const [erroPeriodo, setErroPeriodo] = useState<string | null>(null)
  const [clienteSelecionado, setClienteSelecionado] = useState('')
  const [clienteAplicado, setClienteAplicado] = useState<number | undefined>()
  const [exportando, setExportando] = useState(false)
  const [erroExportacao, setErroExportacao] = useState<string | null>(null)

  const estoqueQuery = useQuery({
    queryKey: ['relatorio-estoque', filtrosEstoque],
    queryFn: () => relatorioEstoque(filtrosEstoque),
    enabled: aba === 'estoque',
  })
  const periodoQuery = useQuery({
    queryKey: ['relatorio-ordens-periodo', filtrosPeriodo],
    queryFn: () => relatorioOrdensPeriodo(filtrosPeriodo),
    enabled: aba === 'periodo',
  })
  const clientesQuery = useQuery({
    queryKey: ['clientes'],
    queryFn: listarClientes,
    enabled: aba === 'cliente',
  })
  const clienteQuery = useQuery({
    queryKey: ['relatorio-ordens-cliente', clienteAplicado],
    queryFn: () => relatorioOrdensCliente(clienteAplicado),
    enabled: aba === 'cliente',
  })

  function aplicarFiltroEstoque(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setFiltrosEstoque({
      busca: buscaEstoque.trim() || undefined,
      abaixo_minimo: apenasAbaixoMinimo || undefined,
    })
  }

  function aplicarFiltroPeriodo(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (dataInicio && dataFim && dataInicio > dataFim) {
      setErroPeriodo('A data inicial não pode ser posterior à data final.')
      return
    }

    setErroPeriodo(null)
    setFiltrosPeriodo({
      data_inicio: dataInicio || undefined,
      data_fim: dataFim || undefined,
    })
  }

  function aplicarFiltroCliente(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    setClienteAplicado(
      clienteSelecionado ? Number(clienteSelecionado) : undefined,
    )
  }

  async function executarExportacao(acao: () => Promise<void>) {
    setExportando(true)
    setErroExportacao(null)

    try {
      await acao()
    } catch {
      setErroExportacao(
        'Não foi possível gerar o PDF. Atualize a página e tente novamente.',
      )
    } finally {
      setExportando(false)
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-6">
      <header>
        <div className="flex items-center gap-3">
          <ChartNoAxesCombined aria-hidden="true" className="text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        </div>
        <p className="mt-2 text-sm text-muted">
          Consulte o estoque e o histórico das ordens de serviço.
        </p>
      </header>

      <div
        className="grid grid-cols-1 gap-3 lg:grid-cols-3"
        role="tablist"
        aria-label="Tipos de relatório"
      >
        {abas.map(({ id, titulo, descricao, icone: Icone }) => {
          const ativa = aba === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={ativa}
              onClick={() => setAba(id)}
              className={`flex cursor-pointer items-center gap-4 rounded-md border p-4 text-left transition-colors ${
                ativa
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/60 hover:bg-surface'
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md ${
                  ativa ? 'bg-primary text-white' : 'bg-surface text-muted'
                }`}
              >
                <Icone size={22} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold text-foreground">
                  {titulo}
                </span>
                <span className="mt-1 block text-xs leading-4 text-muted">
                  {descricao}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {erroExportacao && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-md border border-danger/50 bg-danger/10 px-4 py-3 text-sm text-foreground"
        >
          <AlertCircle size={18} className="shrink-0 text-danger" />
          {erroExportacao}
        </div>
      )}

      {aba === 'estoque' && (
        <div role="tabpanel" className="flex flex-col gap-5">
          <form
            onSubmit={aplicarFiltroEstoque}
            className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 md:flex-row md:items-end"
          >
            <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
              Buscar peça
              <input
                type="search"
                value={buscaEstoque}
                onChange={(evento) => setBuscaEstoque(evento.target.value)}
                placeholder="Código ou descrição"
                className="h-11 rounded-md border-2 border-border/60 bg-surface px-3 text-foreground outline-none placeholder:text-muted focus:border-primary"
              />
            </label>
            <label className="flex h-11 cursor-pointer items-center gap-2 rounded-md border-2 border-border/60 bg-surface px-4 text-sm text-foreground">
              <input
                type="checkbox"
                checked={apenasAbaixoMinimo}
                onChange={(evento) =>
                  setApenasAbaixoMinimo(evento.target.checked)
                }
                className="h-4 w-4 accent-primary"
              />
              Somente abaixo do mínimo
            </label>
            <button
              type="submit"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-5 font-medium text-white transition-colors hover:bg-primary-dark"
            >
              <Search size={18} aria-hidden="true" />
              Gerar relatório
            </button>
          </form>

          {estoqueQuery.isLoading && <Carregando texto="Gerando relatório..." />}
          {estoqueQuery.isError && (
            <ErroConsulta
              erro={estoqueQuery.error}
              onTentarNovamente={() => estoqueQuery.refetch()}
            />
          )}
          {estoqueQuery.data && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <CartaoResumo
                  titulo="Tipos de peça"
                  valor={estoqueQuery.data.total_pecas}
                />
                <CartaoResumo
                  titulo="Unidades em estoque"
                  valor={estoqueQuery.data.quantidade_total}
                />
                <CartaoResumo
                  titulo="Valor do estoque"
                  valor={formatarMoeda(estoqueQuery.data.valor_total)}
                />
                <CartaoResumo
                  titulo="Abaixo do mínimo"
                  valor={estoqueQuery.data.total_abaixo_minimo}
                  destaque={
                    estoqueQuery.data.total_abaixo_minimo > 0
                      ? 'alerta'
                      : undefined
                  }
                  icone={
                    estoqueQuery.data.total_abaixo_minimo > 0 ? (
                      <TriangleAlert
                        size={18}
                        className="text-warning"
                        aria-hidden="true"
                      />
                    ) : undefined
                  }
                />
              </div>
              <AcoesRelatorio
                data={estoqueQuery.data.data_emissao}
                exportando={exportando}
                onExportar={() =>
                  executarExportacao(async () => {
                    const { exportarEstoquePdf } = await import(
                      '../utils/exportarRelatorioPdf'
                    )
                    return exportarEstoquePdf(
                      estoqueQuery.data,
                      filtrosEstoque,
                    )
                  })
                }
              />
              <TabelaEstoque itens={estoqueQuery.data.itens} />
            </>
          )}
        </div>
      )}

      {aba === 'periodo' && (
        <div role="tabpanel" className="flex flex-col gap-5">
          <form
            onSubmit={aplicarFiltroPeriodo}
            className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 md:flex-row md:items-end"
          >
            <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
              Data inicial
              <input
                type="date"
                value={dataInicio}
                max={dataFim || undefined}
                onChange={(evento) => setDataInicio(evento.target.value)}
                className="h-11 rounded-md border-2 border-border/60 bg-surface px-3 text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
              Data final
              <input
                type="date"
                value={dataFim}
                min={dataInicio || undefined}
                onChange={(evento) => setDataFim(evento.target.value)}
                className="h-11 rounded-md border-2 border-border/60 bg-surface px-3 text-foreground outline-none focus:border-primary"
              />
            </label>
            <button
              type="submit"
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-5 font-medium text-white transition-colors hover:bg-primary-dark"
            >
              <Search size={18} aria-hidden="true" />
              Gerar relatório
            </button>
          </form>
          {erroPeriodo && (
            <p role="alert" className="text-sm font-medium text-danger">
              {erroPeriodo}
            </p>
          )}

          {periodoQuery.isLoading && <Carregando texto="Gerando relatório..." />}
          {periodoQuery.isError && (
            <ErroConsulta
              erro={periodoQuery.error}
              onTentarNovamente={() => periodoQuery.refetch()}
            />
          )}
          {periodoQuery.data && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CartaoResumo
                  titulo="Ordens encontradas"
                  valor={periodoQuery.data.quantidade}
                />
                <CartaoResumo
                  titulo="Valor total"
                  valor={formatarMoeda(periodoQuery.data.valor_total)}
                />
              </div>
              <AcoesRelatorio
                data={periodoQuery.data.data_emissao}
                exportando={exportando}
                onExportar={() =>
                  executarExportacao(async () => {
                    const { exportarOrdensPeriodoPdf } = await import(
                      '../utils/exportarRelatorioPdf'
                    )
                    return exportarOrdensPeriodoPdf(
                      periodoQuery.data,
                      filtrosPeriodo,
                    )
                  })
                }
              />
              <TabelaOrdens itens={periodoQuery.data.itens} />
            </>
          )}
        </div>
      )}

      {aba === 'cliente' && (
        <div role="tabpanel" className="flex flex-col gap-5">
          <form
            onSubmit={aplicarFiltroCliente}
            className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 md:flex-row md:items-end"
          >
            <label className="flex flex-1 flex-col gap-1.5 text-sm font-medium">
              Cliente
              <select
                value={clienteSelecionado}
                onChange={(evento) =>
                  setClienteSelecionado(evento.target.value)
                }
                disabled={clientesQuery.isLoading || clientesQuery.isError}
                className="h-11 rounded-md border-2 border-border/60 bg-surface px-3 text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-60 focus:border-primary"
              >
                <option value="">Todos os clientes</option>
                {clientesQuery.data?.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="submit"
              disabled={clientesQuery.isLoading || clientesQuery.isError}
              className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-5 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search size={18} aria-hidden="true" />
              Gerar relatório
            </button>
          </form>
          {clientesQuery.isError && (
            <div className="flex items-center justify-between gap-3 rounded-md border border-danger/50 bg-danger/10 px-4 py-3 text-sm text-foreground">
              <span>
                Não foi possível carregar a lista de clientes.{' '}
                {getApiErrorMessage(clientesQuery.error)}
              </span>
              <button
                type="button"
                onClick={() => clientesQuery.refetch()}
                className="shrink-0 cursor-pointer font-semibold text-primary-light hover:underline"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {clienteQuery.isLoading && <Carregando texto="Gerando relatório..." />}
          {clienteQuery.isError && (
            <ErroConsulta
              erro={clienteQuery.error}
              onTentarNovamente={() => clienteQuery.refetch()}
            />
          )}
          {clienteQuery.data && (
            <>
              {clienteQuery.data.cliente && (
                <div className="rounded-md border border-border bg-card p-4">
                  <p className="text-xs font-semibold tracking-wider text-primary uppercase">
                    Cliente selecionado
                  </p>
                  <p className="mt-1 text-lg font-semibold text-foreground">
                    {clienteQuery.data.cliente.nome}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {clienteQuery.data.cliente.telefone} ·{' '}
                    {clienteQuery.data.cliente.email}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CartaoResumo
                  titulo="Ordens encontradas"
                  valor={clienteQuery.data.quantidade}
                />
                <CartaoResumo
                  titulo="Valor total"
                  valor={formatarMoeda(clienteQuery.data.valor_total)}
                />
              </div>
              <AcoesRelatorio
                data={clienteQuery.data.data_emissao}
                exportando={exportando}
                onExportar={() =>
                  executarExportacao(async () => {
                    const { exportarOrdensClientePdf } = await import(
                      '../utils/exportarRelatorioPdf'
                    )
                    return exportarOrdensClientePdf(clienteQuery.data)
                  })
                }
              />
              <TabelaOrdens itens={clienteQuery.data.itens} />
            </>
          )}
        </div>
      )}
    </section>
  )
}
