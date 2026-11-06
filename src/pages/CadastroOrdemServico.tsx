import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  ClipboardPlus,
  LoaderCircle,
  Package,
  Plus,
  Trash2,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { listarClientes } from '../api/clientes'
import { criarOrdemServico } from '../api/ordensServico'
import { listarPecas } from '../api/pecas'
import { listarServicos } from '../api/servicos'
import { listarVeiculosPorCliente } from '../api/veiculos'
import type { OrdemServicoInput } from '../types/ordemServico'
import {
  formatarCpfCnpj,
  formatarMoeda,
  formatarPlaca,
} from '../utils/formatters'

type OrdemServicoForm = {
  clienteId: string
  veiculoId: string
  observacao: string
  servicos: { servicoId: string }[]
  pecas: { pecaId: string; quantidade: string }[]
}

const valoresIniciais: OrdemServicoForm = {
  clienteId: '',
  veiculoId: '',
  observacao: '',
  servicos: [],
  pecas: [],
}

export function CadastroOrdemServico() {
  const clientesQuery = useQuery({
    queryKey: ['clientes'],
    queryFn: listarClientes,
  })
  const servicosQuery = useQuery({
    queryKey: ['servicos'],
    queryFn: listarServicos,
  })
  const pecasQuery = useQuery({
    queryKey: ['pecas'],
    queryFn: listarPecas,
  })

  const carregando =
    clientesQuery.isLoading || servicosQuery.isLoading || pecasQuery.isLoading
  const erro = clientesQuery.error ?? servicosQuery.error ?? pecasQuery.error

  if (carregando) {
    return (
      <div className="flex flex-1 items-center justify-center gap-3 py-20 text-muted">
        <LoaderCircle
          className="animate-spin text-primary"
          aria-hidden="true"
        />
        Carregando dados da ordem de serviço...
      </div>
    )
  }

  if (erro) {
    return (
      <ErroAoCarregar
        mensagem={getApiErrorMessage(erro)}
        tentarNovamente={() => {
          if (clientesQuery.isError) void clientesQuery.refetch()
          if (servicosQuery.isError) void servicosQuery.refetch()
          if (pecasQuery.isError) void pecasQuery.refetch()
        }}
      />
    )
  }

  const clientes = clientesQuery.data ?? []

  if (clientes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-md border border-border bg-card px-6 py-12 text-center">
        <ClipboardPlus size={40} className="text-muted" aria-hidden="true" />
        <div>
          <p className="font-medium text-foreground">
            Cadastre um cliente primeiro
          </p>
          <p className="mt-1 text-sm text-muted">
            Toda ordem de serviço precisa estar vinculada a um cliente e a um
            veículo.
          </p>
        </div>
        <Link
          to="/clientes/cadastro"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Cadastrar cliente
        </Link>
      </div>
    )
  }

  return (
    <FormularioOrdemServico
      clientes={clientes}
      servicos={servicosQuery.data ?? []}
      pecas={pecasQuery.data ?? []}
    />
  )
}

type ErroAoCarregarProps = {
  mensagem: string
  tentarNovamente: () => void
}

function ErroAoCarregar({ mensagem, tentarNovamente }: ErroAoCarregarProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-md bg-danger px-6 py-12 text-center text-white">
      <AlertCircle aria-hidden="true" />
      <div>
        <p className="font-medium text-white">
          Não foi possível preparar a ordem de serviço
        </p>
        <p className="mt-1 text-sm text-white/80">{mensagem}</p>
      </div>
      <div className="flex gap-3">
        <Link
          to="/ordens-servico"
          className="rounded-md border border-white/70 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-danger"
        >
          Voltar
        </Link>
        <button
          type="button"
          onClick={tentarNovamente}
          className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-foreground"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}

type FormularioOrdemServicoProps = {
  clientes: Awaited<ReturnType<typeof listarClientes>>
  servicos: Awaited<ReturnType<typeof listarServicos>>
  pecas: Awaited<ReturnType<typeof listarPecas>>
}

function FormularioOrdemServico({
  clientes,
  servicos,
  pecas,
}: FormularioOrdemServicoProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [salvando, setSalvando] = useState(false)
  const [erroApi, setErroApi] = useState<string | null>(null)
  const [erroItens, setErroItens] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OrdemServicoForm>({ defaultValues: valoresIniciais })
  const servicosForm = useFieldArray({ control, name: 'servicos' })
  const pecasForm = useFieldArray({ control, name: 'pecas' })
  const clienteId = useWatch({ control, name: 'clienteId' })
  const servicosSelecionados = useWatch({ control, name: 'servicos' }) ?? []
  const pecasSelecionadas = useWatch({ control, name: 'pecas' }) ?? []
  const clienteIdNumerico = Number(clienteId)
  const clienteSelecionado =
    Number.isInteger(clienteIdNumerico) && clienteIdNumerico > 0
  const veiculosQuery = useQuery({
    queryKey: ['veiculos', 'cliente', clienteIdNumerico],
    queryFn: () => listarVeiculosPorCliente(clienteIdNumerico),
    enabled: clienteSelecionado,
  })
  const veiculos = veiculosQuery.data ?? []
  const totalEstimado =
    servicosSelecionados.reduce((total, item) => {
      const servico = servicos.find(
        (opcao) => opcao.id === Number(item?.servicoId),
      )
      return total + (servico?.valor_padrao ?? 0)
    }, 0) +
    pecasSelecionadas.reduce((total, item) => {
      const peca = pecas.find((opcao) => opcao.id === Number(item?.pecaId))
      const quantidade = Number(item?.quantidade)
      return (
        total +
        (peca?.valor_unitario ?? 0) *
          (Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 0)
      )
    }, 0)

  function servicoJaSelecionado(servicoId: number, indiceAtual: number) {
    return servicosSelecionados.some(
      (item, indice) =>
        indice !== indiceAtual && Number(item?.servicoId) === servicoId,
    )
  }

  function pecaJaSelecionada(pecaId: number, indiceAtual: number) {
    return pecasSelecionadas.some(
      (item, indice) =>
        indice !== indiceAtual && Number(item?.pecaId) === pecaId,
    )
  }

  async function salvarOrdem(dados: OrdemServicoForm) {
    const itensServico = dados.servicos.filter((item) => item.servicoId !== '')
    const itensPeca = dados.pecas.filter((item) => item.pecaId !== '')

    if (itensServico.length === 0 && itensPeca.length === 0) {
      setErroItens('Adicione pelo menos um serviço ou uma peça.')
      return
    }

    setSalvando(true)
    setErroApi(null)
    setErroItens(null)

    try {
      const input: OrdemServicoInput = {
        cliente_id: Number(dados.clienteId),
        veiculo_id: Number(dados.veiculoId),
        observacao: dados.observacao.trim(),
        servicos: itensServico.map((item) => ({
          servico_id: Number(item.servicoId),
        })),
        pecas: itensPeca.map((item) => ({
          peca_id: Number(item.pecaId),
          quantidade: Number(item.quantidade),
        })),
      }

      const ordem = await criarOrdemServico(input)
      await queryClient.invalidateQueries({ queryKey: ['ordens-servico'] })
      navigate(`/ordens-servico/${ordem.id}`, {
        replace: true,
        state: { mensagem: 'Ordem de serviço criada com sucesso.' },
      })
    } catch (erro) {
      setErroApi(getApiErrorMessage(erro))
    } finally {
      setSalvando(false)
    }
  }

  const clienteRegister = register('clienteId', {
    required: 'Selecione o cliente.',
  })

  return (
    <form
      onSubmit={handleSubmit(salvarOrdem)}
      className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6"
      noValidate
    >
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/ordens-servico"
            aria-label="Voltar para ordens de serviço"
            title="Voltar para ordens de serviço"
            className="rounded-md p-1 text-muted transition-colors hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ArrowLeft size={26} aria-hidden="true" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Nova ordem de serviço
            </h1>
            <p className="mt-1 text-sm text-muted">
              Selecione o veículo e os itens do orçamento.
            </p>
          </div>
        </div>
        <ClipboardPlus
          size={30}
          aria-hidden="true"
          className="shrink-0 text-primary"
        />
      </header>

      <section className="rounded-md border border-border bg-card p-5">
        <h2 className="mb-5 text-lg font-semibold text-foreground">
          Cliente e veículo
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="clienteId"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Cliente
            </label>
            <select
              id="clienteId"
              autoFocus
              {...clienteRegister}
              onChange={(evento) => {
                void clienteRegister.onChange(evento)
                setValue('veiculoId', '', { shouldValidate: false })
              }}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none focus:border-primary"
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome} — {formatarCpfCnpj(cliente.cpf_cnpj)}
                </option>
              ))}
            </select>
            {errors.clienteId && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {errors.clienteId.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="veiculoId"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Veículo
            </label>
            <select
              id="veiculoId"
              disabled={!clienteSelecionado || veiculosQuery.isFetching}
              {...register('veiculoId', {
                required: 'Selecione o veículo.',
              })}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {!clienteSelecionado
                  ? 'Selecione o cliente primeiro'
                  : veiculosQuery.isFetching
                    ? 'Carregando veículos...'
                    : 'Selecione um veículo'}
              </option>
              {veiculos.map((veiculo) => (
                <option key={veiculo.id} value={veiculo.id}>
                  {formatarPlaca(veiculo.placa)}
                  {veiculo.marca || veiculo.modelo
                    ? ` — ${[veiculo.marca, veiculo.modelo]
                        .filter(Boolean)
                        .join(' ')}`
                    : ''}
                </option>
              ))}
            </select>
            {errors.veiculoId && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {errors.veiculoId.message}
              </p>
            )}
            {clienteSelecionado &&
              veiculosQuery.isSuccess &&
              veiculos.length === 0 && (
                <p className="mt-2 text-sm text-warning">
                  Este cliente não possui veículos.{' '}
                  <Link
                    to={`/veiculos/cadastro?clienteId=${clienteIdNumerico}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline underline-offset-2"
                  >
                    Cadastrar veículo em nova aba
                  </Link>
                </p>
              )}
            {veiculosQuery.isError && (
              <div className="mt-2 flex items-center justify-between gap-3 text-sm text-danger">
                <span>{getApiErrorMessage(veiculosQuery.error)}</span>
                <button
                  type="button"
                  onClick={() => veiculosQuery.refetch()}
                  className="cursor-pointer font-medium underline underline-offset-2"
                >
                  Tentar novamente
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Serviços
              </h2>
              <p className="text-sm text-muted">
                Adicione os serviços que serão realizados.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={
              servicos.length === 0 ||
              servicosForm.fields.length >= servicos.length
            }
            onClick={() => {
              servicosForm.append({ servicoId: '' })
              setErroItens(null)
            }}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={18} aria-hidden="true" />
            Adicionar serviço
          </button>
        </div>

        {servicos.length === 0 && (
          <div className="rounded-md bg-surface px-4 py-3 text-sm text-muted">
            <span>
              Nenhum serviço cadastrado. Você ainda pode incluir peças nesta
              ordem ou{' '}
            </span>
            <Link
              to="/servicos/cadastro"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-2"
            >
              cadastrar um serviço em nova aba
            </Link>
            <span>.</span>
          </div>
        )}

        {servicos.length > 0 && servicosForm.fields.length === 0 && (
          <p className="rounded-md border border-dashed border-border px-4 py-5 text-center text-sm text-muted">
            Nenhum serviço adicionado.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {servicosForm.fields.map((campo, indice) => {
            const servicoSelecionado = servicos.find(
              (servico) =>
                servico.id === Number(servicosSelecionados[indice]?.servicoId),
            )

            return (
              <div
                key={campo.id}
                className="grid grid-cols-1 gap-3 rounded-md bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-start"
              >
                <div>
                  <label
                    htmlFor={`servicos.${indice}.servicoId`}
                    className="sr-only"
                  >
                    Serviço {indice + 1}
                  </label>
                  <select
                    id={`servicos.${indice}.servicoId`}
                    {...register(`servicos.${indice}.servicoId`, {
                      required: 'Selecione o serviço.',
                    })}
                    className="h-11 w-full rounded-md border-2 border-border/40 bg-card px-3 text-foreground outline-none focus:border-primary"
                  >
                    <option value="">Selecione um serviço</option>
                    {servicos.map((servico) => (
                      <option
                        key={servico.id}
                        value={servico.id}
                        disabled={servicoJaSelecionado(servico.id, indice)}
                      >
                        {servico.descricao} —{' '}
                        {formatarMoeda(servico.valor_padrao)}
                      </option>
                    ))}
                  </select>
                  {errors.servicos?.[indice]?.servicoId && (
                    <p role="alert" className="mt-1 text-sm text-danger">
                      {errors.servicos[indice]?.servicoId?.message}
                    </p>
                  )}
                </div>
                <span className="min-w-28 py-2.5 text-right text-sm font-medium text-foreground">
                  {formatarMoeda(servicoSelecionado?.valor_padrao ?? 0)}
                </span>
                <button
                  type="button"
                  onClick={() => servicosForm.remove(indice)}
                  aria-label={`Remover serviço ${indice + 1}`}
                  title="Remover serviço"
                  className="flex h-11 cursor-pointer items-center justify-center rounded-md bg-danger px-3 text-white transition-colors hover:bg-danger-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-md border border-border bg-card p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Package className="text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Peças</h2>
              <p className="text-sm text-muted">
                Informe as peças e suas quantidades.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={
              pecas.length === 0 || pecasForm.fields.length >= pecas.length
            }
            onClick={() => {
              pecasForm.append({ pecaId: '', quantidade: '1' })
              setErroItens(null)
            }}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={18} aria-hidden="true" />
            Adicionar peça
          </button>
        </div>

        {pecas.length === 0 && (
          <div className="rounded-md bg-surface px-4 py-3 text-sm text-muted">
            <span>
              Nenhuma peça cadastrada. Você ainda pode incluir serviços nesta
              ordem ou{' '}
            </span>
            <Link
              to="/pecas/cadastro"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-2"
            >
              cadastrar uma peça em nova aba
            </Link>
            <span>.</span>
          </div>
        )}

        {pecas.length > 0 && pecasForm.fields.length === 0 && (
          <p className="rounded-md border border-dashed border-border px-4 py-5 text-center text-sm text-muted">
            Nenhuma peça adicionada.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {pecasForm.fields.map((campo, indice) => {
            const item = pecasSelecionadas[indice]
            const pecaSelecionada = pecas.find(
              (peca) => peca.id === Number(item?.pecaId),
            )
            const quantidade = Number(item?.quantidade)
            const subtotal =
              (pecaSelecionada?.valor_unitario ?? 0) *
              (Number.isFinite(quantidade) && quantidade > 0 ? quantidade : 0)

            return (
              <div
                key={campo.id}
                className="grid grid-cols-1 gap-3 rounded-md bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_7rem_8rem_auto] sm:items-start"
              >
                <div>
                  <label htmlFor={`pecas.${indice}.pecaId`} className="sr-only">
                    Peça {indice + 1}
                  </label>
                  <select
                    id={`pecas.${indice}.pecaId`}
                    {...register(`pecas.${indice}.pecaId`, {
                      required: 'Selecione a peça.',
                    })}
                    className="h-11 w-full rounded-md border-2 border-border/40 bg-card px-3 text-foreground outline-none focus:border-primary"
                  >
                    <option value="">Selecione uma peça</option>
                    {pecas.map((peca) => (
                      <option
                        key={peca.id}
                        value={peca.id}
                        disabled={pecaJaSelecionada(peca.id, indice)}
                      >
                        {peca.codigo} — {peca.descricao} —{' '}
                        {formatarMoeda(peca.valor_unitario)}
                        {' · '}estoque: {peca.qtd_estoque}
                      </option>
                    ))}
                  </select>
                  {errors.pecas?.[indice]?.pecaId && (
                    <p role="alert" className="mt-1 text-sm text-danger">
                      {errors.pecas[indice]?.pecaId?.message}
                    </p>
                  )}
                  {pecaSelecionada && (
                    <p className="mt-1 text-xs text-muted">
                      Estoque disponível: {pecaSelecionada.qtd_estoque}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor={`pecas.${indice}.quantidade`}
                    className="sr-only"
                  >
                    Quantidade da peça {indice + 1}
                  </label>
                  <input
                    id={`pecas.${indice}.quantidade`}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    aria-label={`Quantidade da peça ${indice + 1}`}
                    {...register(`pecas.${indice}.quantidade`, {
                      required: 'Informe a quantidade.',
                      validate: (valor) =>
                        (/^\d+$/.test(valor) && Number(valor) > 0) ||
                        'Use um inteiro maior que zero.',
                    })}
                    className="h-11 w-full rounded-md border-2 border-border/40 bg-card px-3 text-foreground outline-none focus:border-primary"
                  />
                  {errors.pecas?.[indice]?.quantidade && (
                    <p role="alert" className="mt-1 text-sm text-danger">
                      {errors.pecas[indice]?.quantidade?.message}
                    </p>
                  )}
                </div>
                <span className="py-2.5 text-right text-sm font-medium text-foreground">
                  {formatarMoeda(subtotal)}
                </span>
                <button
                  type="button"
                  onClick={() => pecasForm.remove(indice)}
                  aria-label={`Remover peça ${indice + 1}`}
                  title="Remover peça"
                  className="flex h-11 cursor-pointer items-center justify-center rounded-md bg-danger px-3 text-white transition-colors hover:bg-danger-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                >
                  <Trash2 size={18} aria-hidden="true" />
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 rounded-md border border-border bg-card p-5 md:grid-cols-[minmax(0,1fr)_15rem]">
        <div>
          <label
            htmlFor="observacao"
            className="mb-2 block text-sm font-medium text-foreground"
          >
            Observação{' '}
            <span className="font-normal text-muted">(opcional)</span>
          </label>
          <textarea
            id="observacao"
            rows={4}
            maxLength={500}
            placeholder="Registre informações importantes sobre o serviço..."
            {...register('observacao')}
            className="w-full resize-y rounded-md border-2 border-border/40 bg-surface px-4 py-3 text-foreground outline-none placeholder:text-muted focus:border-primary"
          />
          <p className="mt-1 text-xs text-muted">Máximo de 500 caracteres.</p>
        </div>
        <div className="flex flex-col justify-center rounded-md bg-surface p-5 text-center md:text-right">
          <span className="text-sm text-muted">Total estimado</span>
          <strong className="mt-1 text-2xl text-primary">
            {formatarMoeda(totalEstimado)}
          </strong>
        </div>
      </section>

      {erroItens && (
        <div
          role="alert"
          className="rounded-md bg-warning px-4 py-3 text-sm font-medium text-white"
        >
          {erroItens}
        </div>
      )}

      {erroApi && (
        <div
          role="alert"
          className="rounded-md bg-danger px-4 py-3 text-sm font-medium text-white"
        >
          {erroApi}
        </div>
      )}

      <button
        type="submit"
        disabled={salvando || (servicos.length === 0 && pecas.length === 0)}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {salvando && (
          <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />
        )}
        {salvando ? 'Criando ordem...' : 'Criar ordem de serviço'}
      </button>
    </form>
  )
}
