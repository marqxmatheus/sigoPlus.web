import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  CarFront,
  LoaderCircle,
  Pencil,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { listarClientes } from '../api/clientes'
import { atualizarVeiculo, buscarVeiculo, criarVeiculo } from '../api/veiculos'
import type { Cliente } from '../types/cliente'
import type { Veiculo, VeiculoInput } from '../types/veiculo'
import { formatarPlaca } from '../utils/formatters'

type VeiculoForm = {
  clienteId: string
  placa: string
  marca: string
  modelo: string
  ano: string
}

const formularioVazio: VeiculoForm = {
  clienteId: '',
  placa: '',
  marca: '',
  modelo: '',
  ano: '',
}

function dadosDoVeiculo(veiculo: Veiculo, clientes: Cliente[]): VeiculoForm {
  const proprietarioAtivo = clientes.some(
    (cliente) => cliente.id === veiculo.cliente_id,
  )

  return {
    clienteId: proprietarioAtivo ? String(veiculo.cliente_id) : '',
    placa: formatarPlaca(veiculo.placa),
    marca: veiculo.marca,
    modelo: veiculo.modelo,
    ano: veiculo.ano ? String(veiculo.ano) : '',
  }
}

export function CadastroVeiculo() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const modoEdicao = id !== undefined
  const veiculoId = modoEdicao ? Number(id) : null
  const idValido =
    veiculoId === null || (Number.isInteger(veiculoId) && veiculoId > 0)
  const veiculoQuery = useQuery({
    queryKey: ['veiculo', veiculoId],
    queryFn: () => buscarVeiculo(veiculoId!),
    enabled: modoEdicao && idValido,
  })
  const clientesQuery = useQuery({
    queryKey: ['clientes'],
    queryFn: listarClientes,
  })

  if (!idValido) {
    return <ErroAoCarregarVeiculo mensagem="O veículo informado é inválido." />
  }

  if (clientesQuery.isLoading || (modoEdicao && veiculoQuery.isLoading)) {
    return (
      <div className="flex flex-1 items-center justify-center gap-3 py-20 text-muted">
        <LoaderCircle
          className="animate-spin text-primary"
          aria-hidden="true"
        />
        Carregando veículo...
      </div>
    )
  }

  if (clientesQuery.isError || (modoEdicao && veiculoQuery.isError)) {
    return (
      <ErroAoCarregarVeiculo
        mensagem={getApiErrorMessage(clientesQuery.error ?? veiculoQuery.error)}
        tentarNovamente={() => {
          void clientesQuery.refetch()
          if (modoEdicao) void veiculoQuery.refetch()
        }}
      />
    )
  }

  const clientes = clientesQuery.data ?? []
  const clienteIdDeOrigem = searchParams.get('clienteId') ?? ''
  const clienteDeOrigemValido = clientes.some(
    (cliente) => String(cliente.id) === clienteIdDeOrigem,
  )
  const rotaRetorno = clienteDeOrigemValido
    ? `/clientes/${clienteIdDeOrigem}`
    : '/veiculos'

  if (clientes.length === 0) {
    return <SemClientes />
  }

  return (
    <FormularioVeiculo
      key={veiculoQuery.data?.id ?? `novo-${clienteIdDeOrigem}`}
      veiculo={veiculoQuery.data ?? null}
      clientes={clientes}
      clienteIdInicial={
        !modoEdicao && clienteDeOrigemValido ? clienteIdDeOrigem : ''
      }
      rotaRetorno={rotaRetorno}
    />
  )
}

type ErroAoCarregarVeiculoProps = {
  mensagem: string
  tentarNovamente?: () => void
}

function ErroAoCarregarVeiculo({
  mensagem,
  tentarNovamente,
}: ErroAoCarregarVeiculoProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-md bg-danger px-6 py-12 text-center text-white">
      <AlertCircle aria-hidden="true" />
      <div>
        <p className="font-medium text-white">
          Não foi possível carregar o veículo
        </p>
        <p className="mt-1 text-sm text-white/80">{mensagem}</p>
      </div>
      <div className="flex gap-3">
        <Link
          to="/veiculos"
          className="rounded-md border border-white/70 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-danger"
        >
          Voltar
        </Link>
        {tentarNovamente && (
          <button
            type="button"
            onClick={tentarNovamente}
            className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-foreground"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  )
}

function SemClientes() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-md border border-border bg-card px-6 py-12 text-center">
      <CarFront size={40} className="text-muted" aria-hidden="true" />
      <div>
        <p className="font-medium text-foreground">
          Cadastre um cliente primeiro
        </p>
        <p className="mt-1 text-sm text-muted">
          Todo veículo precisa estar vinculado a um proprietário ativo.
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

type FormularioVeiculoProps = {
  veiculo: Veiculo | null
  clientes: Cliente[]
  clienteIdInicial: string
  rotaRetorno: string
}

function FormularioVeiculo({
  veiculo,
  clientes,
  clienteIdInicial,
  rotaRetorno,
}: FormularioVeiculoProps) {
  const modoEdicao = veiculo !== null
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [salvando, setSalvando] = useState(false)
  const [erroApi, setErroApi] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VeiculoForm>({
    defaultValues: veiculo
      ? dadosDoVeiculo(veiculo, clientes)
      : { ...formularioVazio, clienteId: clienteIdInicial },
  })

  async function salvarVeiculo(dados: VeiculoForm) {
    setSalvando(true)
    setErroApi(null)

    try {
      const dadosVeiculo: VeiculoInput = {
        cliente_id: Number(dados.clienteId),
        placa: dados.placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
        marca: dados.marca.trim(),
        modelo: dados.modelo.trim(),
        ano: dados.ano ? Number(dados.ano) : 0,
      }

      if (veiculo) {
        await atualizarVeiculo(veiculo.id, dadosVeiculo)
      } else {
        await criarVeiculo(dadosVeiculo)
      }

      await queryClient.invalidateQueries({ queryKey: ['veiculos'] })

      navigate(rotaRetorno, {
        replace: true,
        state: {
          mensagem: modoEdicao
            ? 'Veículo editado com sucesso.'
            : 'Veículo cadastrado com sucesso.',
        },
      })
    } catch (erro) {
      setErroApi(getApiErrorMessage(erro))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(salvarVeiculo)}
      className="flex min-h-full flex-1 flex-col"
      noValidate
    >
      <header className="pb-5">
        <div className="mx-auto flex w-full max-w-200 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to={rotaRetorno}
              aria-label="Voltar para veículos"
              title="Voltar para veículos"
              className="rounded-md p-1 text-muted transition-colors hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ArrowLeft size={26} aria-hidden="true" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              {modoEdicao ? 'Editar veículo' : 'Cadastrar veículo'}
            </h1>
          </div>
          {modoEdicao ? (
            <Pencil
              size={28}
              aria-hidden="true"
              className="shrink-0 text-primary"
            />
          ) : (
            <CarFront
              size={28}
              aria-hidden="true"
              className="shrink-0 text-primary"
            />
          )}
        </div>
      </header>

      <div className="mx-auto w-full max-w-200 py-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="clienteId"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Proprietário
            </label>
            <select
              id="clienteId"
              {...register('clienteId', {
                required: 'Selecione o proprietário do veículo.',
              })}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none focus:border-primary"
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
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
              htmlFor="placa"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Placa
            </label>
            <input
              id="placa"
              type="text"
              placeholder="ABC-1D23"
              autoComplete="off"
              maxLength={8}
              {...register('placa', {
                validate: (valor) =>
                  /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(
                    valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(),
                  ) || 'Informe uma placa no formato ABC-1234 ou ABC-1D23.',
              })}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 uppercase text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
            {errors.placa && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {errors.placa.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="ano"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Ano
              <span className="ml-1 font-normal text-muted">(opcional)</span>
            </label>
            <input
              id="ano"
              type="number"
              placeholder="2026"
              min={1950}
              max={2100}
              {...register('ano', {
                validate: (valor) =>
                  valor === '' ||
                  (/^\d+$/.test(valor) &&
                    Number(valor) >= 1950 &&
                    Number(valor) <= 2100) ||
                  'Informe um ano entre 1950 e 2100.',
              })}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
            {errors.ano && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {errors.ano.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="marca"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Marca
              <span className="ml-1 font-normal text-muted">(opcional)</span>
            </label>
            <input
              id="marca"
              type="text"
              placeholder="Ex.: Honda"
              maxLength={50}
              {...register('marca')}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="modelo"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Modelo
              <span className="ml-1 font-normal text-muted">(opcional)</span>
            </label>
            <input
              id="modelo"
              type="text"
              placeholder="Ex.: CG 160"
              maxLength={50}
              {...register('modelo')}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
          </div>
        </div>

        {veiculo &&
          !clientes.some((cliente) => cliente.id === veiculo.cliente_id) && (
            <div
              role="status"
              className="mt-6 rounded-md bg-warning px-4 py-3 text-sm font-medium text-white"
            >
              O proprietário anterior foi excluído. Selecione um novo
              proprietário para salvar as alterações.
            </div>
          )}

        {erroApi && (
          <div
            role="alert"
            className="mt-6 rounded-md bg-danger px-4 py-3 text-sm font-medium text-white"
          >
            {erroApi}
          </div>
        )}

        <button
          type="submit"
          disabled={salvando}
          className="mt-7 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {salvando && (
            <LoaderCircle
              size={20}
              className="animate-spin"
              aria-hidden="true"
            />
          )}
          {salvando
            ? 'Salvando...'
            : modoEdicao
              ? 'Salvar alterações'
              : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
