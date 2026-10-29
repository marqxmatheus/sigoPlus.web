import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  CarFront,
  CircleCheck,
  LoaderCircle,
  Pencil,
  Plus,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { buscarCliente } from '../api/clientes'
import { listarVeiculosPorCliente } from '../api/veiculos'
import { formatarCpfCnpj, formatarPlaca } from '../utils/formatters'

type LocationState = {
  mensagem?: string
}

export function DetalhesCliente() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const clienteId = Number(id)
  const idValido = Number.isInteger(clienteId) && clienteId > 0
  const mensagemRecebida = (location.state as LocationState | null)?.mensagem
  const [mensagem, setMensagem] = useState<string | null>(
    mensagemRecebida ?? null,
  )
  const clienteQuery = useQuery({
    queryKey: ['cliente', clienteId],
    queryFn: () => buscarCliente(clienteId),
    enabled: idValido,
  })
  const veiculosQuery = useQuery({
    queryKey: ['veiculos', 'cliente', clienteId],
    queryFn: () => listarVeiculosPorCliente(clienteId),
    enabled: idValido,
  })

  useEffect(() => {
    if (!mensagemRecebida) return

    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, mensagemRecebida, navigate])

  useEffect(() => {
    if (!mensagem) return

    const temporizador = window.setTimeout(() => setMensagem(null), 3000)

    return () => window.clearTimeout(temporizador)
  }, [mensagem])

  if (!idValido) {
    return <ErroDetalhesCliente mensagem="O cliente informado é inválido." />
  }

  if (clienteQuery.isLoading || veiculosQuery.isLoading) {
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

  if (clienteQuery.isError || veiculosQuery.isError) {
    return (
      <ErroDetalhesCliente
        mensagem={getApiErrorMessage(clienteQuery.error ?? veiculosQuery.error)}
        tentarNovamente={() => {
          void clienteQuery.refetch()
          void veiculosQuery.refetch()
        }}
      />
    )
  }

  const cliente = clienteQuery.data!
  const veiculos = veiculosQuery.data ?? []

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/clientes"
            aria-label="Voltar para clientes"
            title="Voltar para clientes"
            className="rounded-md p-1 text-muted transition-colors hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ArrowLeft size={26} aria-hidden="true" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <UserRound className="text-primary" aria-hidden="true" />
              <h1 className="text-2xl font-bold text-foreground">
                {cliente.nome}
              </h1>
            </div>
            <p className="mt-1 text-sm text-muted">Detalhes do cliente</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            to={`/clientes/${cliente.id}/editar`}
            className="flex items-center justify-center gap-2 rounded-md bg-border px-4 py-2.5 font-medium text-white transition-colors hover:bg-muted"
          >
            <Pencil size={18} aria-hidden="true" />
            Editar cliente
          </Link>
          <Link
            to={`/veiculos/cadastro?clienteId=${cliente.id}`}
            className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-dark"
          >
            <Plus size={19} aria-hidden="true" />
            Cadastrar veículo
          </Link>
        </div>
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

      <div className="rounded-md border border-border bg-card p-5">
        <h2 className="mb-5 text-lg font-semibold text-foreground">
          Informações pessoais
        </h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
          <CampoDetalhe titulo="CPF/CNPJ">
            {formatarCpfCnpj(cliente.cpf_cnpj)}
          </CampoDetalhe>
          <CampoDetalhe titulo="Telefone">
            {cliente.telefone || 'Não informado'}
          </CampoDetalhe>
          <CampoDetalhe titulo="E-mail">
            {cliente.email || 'Não informado'}
          </CampoDetalhe>
          <CampoDetalhe titulo="Endereço">
            {cliente.endereco || 'Não informado'}
          </CampoDetalhe>
        </dl>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-3">
          <CarFront className="text-primary" aria-hidden="true" />
          <div>
            <h2 className="text-xl font-semibold text-foreground">Veículos</h2>
            <p className="text-sm text-muted">
              {veiculos.length}{' '}
              {veiculos.length === 1
                ? 'veículo cadastrado'
                : 'veículos cadastrados'}
            </p>
          </div>
        </div>

        {veiculos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-card px-6 py-10 text-center">
            <CarFront size={36} className="text-muted" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">
                Nenhum veículo cadastrado
              </p>
              <p className="mt-1 text-sm text-muted">
                Cadastre a primeira motocicleta deste cliente.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-2xl border-collapse text-left">
                <thead className="bg-surface text-sm text-muted">
                  <tr>
                    {['Placa', 'Marca', 'Modelo', 'Ano', 'Ações'].map(
                      (coluna) => (
                        <th
                          key={coluna}
                          scope="col"
                          className={`border-b border-border px-5 py-3 font-medium ${
                            coluna === 'Ações'
                              ? 'sticky right-0 z-10 border-l border-border bg-surface text-right'
                              : ''
                          }`}
                        >
                          {coluna}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {veiculos.map((veiculo) => (
                    <tr
                      key={veiculo.id}
                      className="group text-sm text-foreground transition-colors hover:bg-surface"
                    >
                      <td className="whitespace-nowrap px-5 py-3 font-medium">
                        {formatarPlaca(veiculo.placa)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-muted">
                        {veiculo.marca || '—'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-muted">
                        {veiculo.modelo || '—'}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-muted">
                        {veiculo.ano || '—'}
                      </td>
                      <td className="sticky right-0 z-10 w-px border-l border-border bg-card px-5 py-3 text-right whitespace-nowrap transition-colors group-hover:bg-surface">
                        <Link
                          to={`/veiculos/${veiculo.id}/editar?clienteId=${cliente.id}`}
                          aria-label={`Editar veículo ${formatarPlaca(veiculo.placa)}`}
                          title="Editar veículo"
                          className="inline-flex rounded-md bg-primary p-2 text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          <Pencil size={18} aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

type CampoDetalheProps = {
  titulo: string
  children: string
}

function CampoDetalhe({ titulo, children }: CampoDetalheProps) {
  return (
    <div>
      <dt className="text-sm text-muted">{titulo}</dt>
      <dd className="mt-1 break-words font-medium text-foreground">
        {children}
      </dd>
    </div>
  )
}

type ErroDetalhesClienteProps = {
  mensagem: string
  tentarNovamente?: () => void
}

function ErroDetalhesCliente({
  mensagem,
  tentarNovamente,
}: ErroDetalhesClienteProps) {
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
