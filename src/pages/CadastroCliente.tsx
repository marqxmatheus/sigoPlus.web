import { ArrowLeft, LoaderCircle, UserRoundPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { criarCliente } from '../api/clientes'

type ClienteForm = {
  nome: string
  cpfCnpj: string
  telefone: string
  email: string
  endereco: string
}

export function CadastroCliente() {
  const navigate = useNavigate()
  const [salvando, setSalvando] = useState(false)
  const [erroApi, setErroApi] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClienteForm>({
    defaultValues: {
      nome: '',
      cpfCnpj: '',
      telefone: '',
      email: '',
      endereco: '',
    },
  })

  async function cadastrarCliente(cliente: ClienteForm) {
    setSalvando(true)
    setErroApi(null)

    try {
      await criarCliente({
        nome: cliente.nome,
        cpf_cnpj: cliente.cpfCnpj.replace(/\D/g, ''),
        telefone: cliente.telefone,
        email: cliente.email,
        endereco: cliente.endereco,
      })

      navigate('/clientes', {
        replace: true,
        state: { mensagem: 'Cliente cadastrado com sucesso.' },
      })
    } catch (erro) {
      setErroApi(getApiErrorMessage(erro))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(cadastrarCliente)}
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
              className="rounded-md p-1 text-muted transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ArrowLeft size={26} aria-hidden="true" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              Cadastrar cliente
            </h1>
          </div>
          <UserRoundPlus
            size={28}
            aria-hidden="true"
            className="shrink-0 text-primary"
          />
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
              <p
                role="alert"
                className="mt-1 text-sm text-danger"
              >
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
              <p
                role="alert"
                className="mt-1 text-sm text-danger"
              >
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
            className="mt-6 rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger"
          >
            {erroApi}
          </div>
        )}

        <button
          type="submit"
          disabled={salvando}
          className="mt-7 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {salvando && (
            <LoaderCircle size={20} className="animate-spin" aria-hidden="true" />
          )}
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  )
}
