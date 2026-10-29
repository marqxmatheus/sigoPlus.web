import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  LoaderCircle,
  Pencil,
  UserRoundPlus,
} from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { atualizarCliente, buscarCliente, criarCliente } from '../api/clientes'
import type { Cliente, ClienteInput } from '../types/cliente'
import { formatarCpfCnpj } from '../utils/formatters'

type ClienteForm = {
  nome: string
  cpfCnpj: string
  telefone: string
  email: string
  endereco: string
}

const formularioVazio: ClienteForm = {
  nome: '',
  cpfCnpj: '',
  telefone: '',
  email: '',
  endereco: '',
}

function dadosDoCliente(cliente: Cliente): ClienteForm {
  return {
    nome: cliente.nome,
    cpfCnpj: formatarCpfCnpj(cliente.cpf_cnpj),
    telefone: cliente.telefone,
    email: cliente.email,
    endereco: cliente.endereco,
  }
}

export function CadastroCliente() {
  const { id } = useParams<{ id: string }>()
  const modoEdicao = id !== undefined
  const clienteId = modoEdicao ? Number(id) : null
  const idValido =
    clienteId === null || (Number.isInteger(clienteId) && clienteId > 0)
  const clienteQuery = useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: () => buscarCliente(clienteId!),
    enabled: modoEdicao && idValido,
  })

  if (!idValido) {
    return <ErroAoCarregarCliente mensagem="O cliente informado é inválido." />
  }

  if (modoEdicao && clienteQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center gap-3 py-20 text-muted">
        <LoaderCircle
          className="animate-spin text-primary"
          aria-hidden="true"
        />
        Carregando cliente...
      </div>
    )
  }

  if (modoEdicao && clienteQuery.isError) {
    return (
      <ErroAoCarregarCliente
        mensagem={getApiErrorMessage(clienteQuery.error)}
        tentarNovamente={() => clienteQuery.refetch()}
      />
    )
  }

  return (
    <FormularioCliente
      key={clienteQuery.data?.id ?? 'novo'}
      cliente={clienteQuery.data ?? null}
    />
  )
}

type ErroAoCarregarClienteProps = {
  mensagem: string
  tentarNovamente?: () => void
}

function ErroAoCarregarCliente({
  mensagem,
  tentarNovamente,
}: ErroAoCarregarClienteProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-md bg-danger px-6 py-12 text-center text-white">
      <AlertCircle aria-hidden="true" />
      <div>
        <p className="font-medium text-white">
          Não foi possível carregar o cliente
        </p>
        <p className="mt-1 text-sm text-white/80">{mensagem}</p>
      </div>
      <div className="flex gap-3">
        <Link
          to="/clientes"
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

type FormularioClienteProps = {
  cliente: Cliente | null
}

function FormularioCliente({ cliente }: FormularioClienteProps) {
  const modoEdicao = cliente !== null
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [salvando, setSalvando] = useState(false)
  const [erroApi, setErroApi] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClienteForm>({
    defaultValues: cliente ? dadosDoCliente(cliente) : formularioVazio,
  })

  async function salvarCliente(dados: ClienteForm) {
    setSalvando(true)
    setErroApi(null)

    try {
      const dadosCliente: ClienteInput = {
        nome: dados.nome,
        cpf_cnpj: dados.cpfCnpj.replace(/\D/g, ''),
        telefone: dados.telefone,
        email: dados.email,
        endereco: dados.endereco,
      }

      if (cliente) {
        await atualizarCliente(cliente.id, dadosCliente)
      } else {
        await criarCliente(dadosCliente)
      }

      await queryClient.invalidateQueries({ queryKey: ['clientes'] })

      navigate('/clientes', {
        replace: true,
        state: {
          mensagem: modoEdicao
            ? 'Cliente editado com sucesso.'
            : 'Cliente cadastrado com sucesso.',
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
      onSubmit={handleSubmit(salvarCliente)}
      className="flex min-h-full flex-1 flex-col"
      noValidate
    >
      <header className="pb-5">
        <div className="mx-auto flex w-full max-w-200 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/clientes"
              aria-label="Voltar para clientes"
              title="Voltar para clientes"
              className="rounded-md p-1 text-muted transition-colors hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ArrowLeft size={26} aria-hidden="true" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              {modoEdicao ? 'Editar cliente' : 'Cadastrar cliente'}
            </h1>
          </div>
          {modoEdicao ? (
            <Pencil
              size={28}
              aria-hidden="true"
              className="shrink-0 text-primary"
            />
          ) : (
            <UserRoundPlus
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
              htmlFor="nome"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Nome
            </label>
            <input
              id="nome"
              type="text"
              placeholder="Nome completo"
              autoComplete="name"
              {...register('nome', {
                validate: (valor) =>
                  valor.trim() !== '' || 'Informe o nome do cliente.',
              })}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
            {errors.nome && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {errors.nome.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="cpfCnpj"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              CPF/CNPJ
            </label>
            <input
              id="cpfCnpj"
              type="text"
              placeholder="Digite o CPF ou CNPJ"
              autoComplete="off"
              maxLength={18}
              {...register('cpfCnpj', {
                maxLength: {
                  value: 18,
                  message: 'CPF/CNPJ deve ter no máximo 18 caracteres.',
                },
                validate: (valor) =>
                  [11, 14].includes(valor.replace(/\D/g, '').length) ||
                  'Informe um CPF ou CNPJ com 11 ou 14 dígitos.',
              })}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
            {errors.cpfCnpj && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {errors.cpfCnpj.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="telefone"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Telefone
              <span className="ml-1 font-normal text-muted">(opcional)</span>
            </label>
            <input
              id="telefone"
              type="tel"
              placeholder="(00) 00000-0000"
              autoComplete="tel"
              maxLength={15}
              {...register('telefone', {
                maxLength: {
                  value: 15,
                  message: 'Telefone deve ter no máximo 15 caracteres.',
                },
              })}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
            {errors.telefone && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {errors.telefone.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              E-mail
              <span className="ml-1 font-normal text-muted">(opcional)</span>
            </label>
            <input
              id="email"
              type="email"
              placeholder="nome@exemplo.com"
              autoComplete="email"
              {...register('email', {
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Informe um e-mail válido.',
                },
              })}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
            {errors.email && (
              <p role="alert" className="mt-1 text-sm text-danger">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="endereco"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Endereço
              <span className="ml-1 font-normal text-muted">(opcional)</span>
            </label>
            <input
              id="endereco"
              type="text"
              placeholder="Rua, número, bairro e cidade"
              autoComplete="street-address"
              {...register('endereco')}
              className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none placeholder:text-muted focus:border-primary"
            />
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
