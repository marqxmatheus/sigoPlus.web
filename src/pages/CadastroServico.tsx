import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  LoaderCircle,
  Pencil,
  Wrench,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { atualizarServico, buscarServico, criarServico } from '../api/servicos'
import type { Servico, ServicoInput } from '../types/servico'

type ServicoForm = {
  descricao: string
  valorPadrao: string
  tempoEstimadoMin: string
}

const formularioVazio: ServicoForm = {
  descricao: '',
  valorPadrao: '0',
  tempoEstimadoMin: '0',
}

function dadosDoServico(servico: Servico): ServicoForm {
  return {
    descricao: servico.descricao,
    valorPadrao: String(servico.valor_padrao),
    tempoEstimadoMin: String(servico.tempo_estimado_min),
  }
}

export function CadastroServico() {
  const { id } = useParams<{ id: string }>()
  const modoEdicao = id !== undefined
  const servicoId = modoEdicao ? Number(id) : null
  const idValido =
    servicoId === null || (Number.isInteger(servicoId) && servicoId > 0)
  const servicoQuery = useQuery({
    queryKey: ['servico', servicoId],
    queryFn: () => buscarServico(servicoId!),
    enabled: modoEdicao && idValido,
  })

  if (!idValido) {
    return <ErroAoCarregarServico mensagem="O serviço informado é inválido." />
  }

  if (modoEdicao && servicoQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-3 py-20 text-muted">
        <LoaderCircle
          className="animate-spin text-primary"
          aria-hidden="true"
        />
        Carregando serviço...
      </div>
    )
  }

  if (modoEdicao && servicoQuery.isError) {
    return (
      <ErroAoCarregarServico
        mensagem={getApiErrorMessage(servicoQuery.error)}
        tentarNovamente={() => servicoQuery.refetch()}
      />
    )
  }

  return (
    <FormularioServico
      key={servicoQuery.data?.id ?? 'novo'}
      servico={servicoQuery.data ?? null}
    />
  )
}

type ErroAoCarregarServicoProps = {
  mensagem: string
  tentarNovamente?: () => void
}

function ErroAoCarregarServico({
  mensagem,
  tentarNovamente,
}: ErroAoCarregarServicoProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-md bg-danger px-6 py-12 text-center text-white">
      <AlertCircle aria-hidden="true" />
      <div>
        <p className="font-medium text-white">
          Não foi possível carregar o serviço
        </p>
        <p className="mt-1 text-sm text-white/80">{mensagem}</p>
      </div>
      <div className="flex gap-3">
        <Link
          to="/servicos"
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

type FormularioServicoProps = {
  servico: Servico | null
}

function FormularioServico({ servico }: FormularioServicoProps) {
  const modoEdicao = servico !== null
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [salvando, setSalvando] = useState(false)
  const [erroApi, setErroApi] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServicoForm>({
    defaultValues: servico ? dadosDoServico(servico) : formularioVazio,
  })

  async function salvarServico(dados: ServicoForm) {
    setSalvando(true)
    setErroApi(null)

    try {
      const dadosServico: ServicoInput = {
        descricao: dados.descricao.trim(),
        valor_padrao: Number(dados.valorPadrao),
        tempo_estimado_min: Number(dados.tempoEstimadoMin),
      }

      if (servico) {
        await atualizarServico(servico.id, dadosServico)
      } else {
        await criarServico(dadosServico)
      }

      await queryClient.invalidateQueries({ queryKey: ['servicos'] })

      navigate('/servicos', {
        replace: true,
        state: {
          mensagem: modoEdicao
            ? 'Serviço editado com sucesso.'
            : 'Serviço cadastrado com sucesso.',
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
      onSubmit={handleSubmit(salvarServico)}
      className="flex min-h-full flex-1 flex-col"
      noValidate
    >
      <header className="pb-5">
        <div className="mx-auto flex w-full max-w-200 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/servicos"
              aria-label="Voltar para serviços"
              title="Voltar para serviços"
              className="rounded-md p-1 text-muted transition-colors hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ArrowLeft size={26} aria-hidden="true" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              {modoEdicao ? 'Editar serviço' : 'Cadastrar serviço'}
            </h1>
          </div>
          {modoEdicao ? (
            <Pencil
              size={28}
              aria-hidden="true"
              className="shrink-0 text-primary"
            />
          ) : (
            <Wrench
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
              htmlFor="descricao"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Descrição
            </label>
            <input
              id="descricao"
              type="text"
              placeholder="Ex.: Troca de óleo"
              maxLength={100}
              autoFocus
              {...register('descricao', {
                validate: (valor) =>
                  valor.trim() !== '' || 'Informe a descrição do serviço.',
              })}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
            {errors.descricao && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {errors.descricao.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="valorPadrao"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Valor padrão (R$)
            </label>
            <input
              id="valorPadrao"
              type="number"
              inputMode="decimal"
              min={0}
              max={99999999.99}
              step="0.01"
              placeholder="0,00"
              {...register('valorPadrao', {
                required: 'Informe o valor padrão.',
                validate: (valor) => {
                  const numero = Number(valor)
                  if (!Number.isFinite(numero) || numero < 0) {
                    return 'Informe um valor igual ou maior que zero.'
                  }
                  if (numero > 99999999.99) {
                    return 'Informe um valor de até R$ 99.999.999,99.'
                  }
                  return true
                },
              })}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
            {errors.valorPadrao && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {errors.valorPadrao.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="tempoEstimadoMin"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Tempo estimado (minutos)
            </label>
            <input
              id="tempoEstimadoMin"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="0"
              {...register('tempoEstimadoMin', {
                required: 'Informe o tempo estimado.',
                validate: (valor) =>
                  (/^\d+$/.test(valor) && Number(valor) >= 0) ||
                  'Informe um número inteiro igual ou maior que zero.',
              })}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
            {errors.tempoEstimadoMin && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {errors.tempoEstimadoMin.message}
              </p>
            )}
          </div>
        </div>

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
