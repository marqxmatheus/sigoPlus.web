import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  LoaderCircle,
  Package,
  Pencil,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { atualizarPeca, buscarPeca, criarPeca } from '../api/pecas'
import type { Peca, PecaInput } from '../types/peca'

type PecaForm = {
  codigo: string
  descricao: string
  valorUnitario: string
  qtdEstoque: string
  estoqueMinimo: string
}

const formularioVazio: PecaForm = {
  codigo: '',
  descricao: '',
  valorUnitario: '0',
  qtdEstoque: '0',
  estoqueMinimo: '0',
}

function dadosDaPeca(peca: Peca): PecaForm {
  return {
    codigo: peca.codigo,
    descricao: peca.descricao,
    valorUnitario: String(peca.valor_unitario),
    qtdEstoque: String(peca.qtd_estoque),
    estoqueMinimo: String(peca.estoque_minimo),
  }
}

export function CadastroPeca() {
  const { id } = useParams<{ id: string }>()
  const modoEdicao = id !== undefined
  const pecaId = modoEdicao ? Number(id) : null
  const idValido = pecaId === null || (Number.isInteger(pecaId) && pecaId > 0)
  const pecaQuery = useQuery({
    queryKey: ['peca', pecaId],
    queryFn: () => buscarPeca(pecaId!),
    enabled: modoEdicao && idValido,
  })

  if (!idValido) {
    return <ErroAoCarregarPeca mensagem="A peça informada é inválida." />
  }

  if (modoEdicao && pecaQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-3 py-20 text-muted">
        <LoaderCircle
          className="animate-spin text-primary"
          aria-hidden="true"
        />
        Carregando peça...
      </div>
    )
  }

  if (modoEdicao && pecaQuery.isError) {
    return (
      <ErroAoCarregarPeca
        mensagem={getApiErrorMessage(pecaQuery.error)}
        tentarNovamente={() => pecaQuery.refetch()}
      />
    )
  }

  return (
    <FormularioPeca
      key={pecaQuery.data?.id ?? 'nova'}
      peca={pecaQuery.data ?? null}
    />
  )
}

type ErroAoCarregarPecaProps = {
  mensagem: string
  tentarNovamente?: () => void
}

function ErroAoCarregarPeca({
  mensagem,
  tentarNovamente,
}: ErroAoCarregarPecaProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-md bg-danger px-6 py-12 text-center text-white">
      <AlertCircle aria-hidden="true" />
      <div>
        <p className="font-medium text-white">
          Não foi possível carregar a peça
        </p>
        <p className="mt-1 text-sm text-white/80">{mensagem}</p>
      </div>
      <div className="flex gap-3">
        <Link
          to="/pecas"
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

type FormularioPecaProps = {
  peca: Peca | null
}

function FormularioPeca({ peca }: FormularioPecaProps) {
  const modoEdicao = peca !== null
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [salvando, setSalvando] = useState(false)
  const [erroApi, setErroApi] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PecaForm>({
    defaultValues: peca ? dadosDaPeca(peca) : formularioVazio,
  })

  async function salvarPeca(dados: PecaForm) {
    setSalvando(true)
    setErroApi(null)

    try {
      const dadosPeca: PecaInput = {
        codigo: dados.codigo.trim().toUpperCase(),
        descricao: dados.descricao.trim(),
        valor_unitario: Number(dados.valorUnitario),
        qtd_estoque: Number(dados.qtdEstoque),
        estoque_minimo: Number(dados.estoqueMinimo),
      }

      if (peca) {
        await atualizarPeca(peca.id, dadosPeca)
      } else {
        await criarPeca(dadosPeca)
      }

      await queryClient.invalidateQueries({ queryKey: ['pecas'] })

      navigate('/pecas', {
        replace: true,
        state: {
          mensagem: modoEdicao
            ? 'Peça editada com sucesso.'
            : 'Peça cadastrada com sucesso.',
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
      onSubmit={handleSubmit(salvarPeca)}
      className="flex min-h-full flex-1 flex-col"
      noValidate
    >
      <header className="pb-5">
        <div className="mx-auto flex w-full max-w-200 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/pecas"
              aria-label="Voltar para peças"
              title="Voltar para peças"
              className="rounded-md p-1 text-muted transition-colors hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ArrowLeft size={26} aria-hidden="true" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              {modoEdicao ? 'Editar peça' : 'Cadastrar peça'}
            </h1>
          </div>
          {modoEdicao ? (
            <Pencil
              size={28}
              aria-hidden="true"
              className="shrink-0 text-primary"
            />
          ) : (
            <Package
              size={28}
              aria-hidden="true"
              className="shrink-0 text-primary"
            />
          )}
        </div>
      </header>

      <div className="mx-auto w-full max-w-200 py-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="codigo"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Código
            </label>
            <input
              id="codigo"
              type="text"
              placeholder="Ex.: OLEO-10W40"
              maxLength={30}
              autoFocus
              {...register('codigo', {
                validate: (valor) =>
                  valor.trim() !== '' || 'Informe o código da peça.',
              })}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 uppercase text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
            {errors.codigo && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {errors.codigo.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="valorUnitario"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Valor unitário (R$)
            </label>
            <input
              id="valorUnitario"
              type="number"
              inputMode="decimal"
              min={0}
              max={99999999.99}
              step="0.01"
              placeholder="0,00"
              {...register('valorUnitario', {
                required: 'Informe o valor unitário.',
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
            {errors.valorUnitario && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {errors.valorUnitario.message}
              </p>
            )}
          </div>

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
              placeholder="Ex.: Óleo para motocicleta 10W40"
              maxLength={100}
              {...register('descricao', {
                validate: (valor) =>
                  valor.trim() !== '' || 'Informe a descrição da peça.',
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
              htmlFor="qtdEstoque"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Quantidade em estoque
            </label>
            <input
              id="qtdEstoque"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="0"
              {...register('qtdEstoque', {
                required: 'Informe a quantidade em estoque.',
                validate: (valor) =>
                  (/^\d+$/.test(valor) && Number(valor) >= 0) ||
                  'Informe um número inteiro igual ou maior que zero.',
              })}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
            {errors.qtdEstoque && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {errors.qtdEstoque.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="estoqueMinimo"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Estoque mínimo
            </label>
            <input
              id="estoqueMinimo"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              placeholder="0"
              {...register('estoqueMinimo', {
                required: 'Informe o estoque mínimo.',
                validate: (valor) =>
                  (/^\d+$/.test(valor) && Number(valor) >= 0) ||
                  'Informe um número inteiro igual ou maior que zero.',
              })}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
            {errors.estoqueMinimo && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {errors.estoqueMinimo.message}
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
