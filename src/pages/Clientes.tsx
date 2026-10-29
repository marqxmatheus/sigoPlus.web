import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CircleCheck,
  Eye,
  LoaderCircle,
  Pencil,
  Trash2,
  UserRoundPlus,
  Users,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { excluirCliente, listarClientes } from '../api/clientes'
import { CampoBusca } from '../components/CampoBusca'
import { ModalConfirmacaoExclusao } from '../components/ModalConfirmacaoExclusao'
import type { Cliente } from '../types/cliente'
import { formatarCpfCnpj } from '../utils/formatters'
import { correspondeABusca } from '../utils/search'

const colunas = ['Nome', 'CPF/CNPJ', 'Telefone', 'E-mail', 'Endereço', 'Ações']

type LocationState = {
  mensagem?: string
}

export function Clientes() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mensagemRecebida = (location.state as LocationState | null)?.mensagem
  const [mensagem, setMensagem] = useState<string | null>(
    mensagemRecebida ?? null,
  )
  const [erroExclusao, setErroExclusao] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [clienteExcluindoId, setClienteExcluindoId] = useState<number | null>(
    null,
  )
  const [clienteParaExcluir, setClienteParaExcluir] = useState<Cliente | null>(
    null,
  )
  const clientesQuery = useQuery({
    queryKey: ['clientes'],
    queryFn: listarClientes,
  })
  const clientes = clientesQuery.data ?? []
  const clientesFiltrados = clientes.filter((cliente) =>
    correspondeABusca(
      busca,
      cliente.nome,
      cliente.cpf_cnpj,
      formatarCpfCnpj(cliente.cpf_cnpj),
      cliente.telefone,
      cliente.email,
      cliente.endereco,
    ),
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
    if (!clienteParaExcluir) return

    const cliente = clienteParaExcluir
    setClienteExcluindoId(cliente.id)
    setErroExclusao(null)

    try {
      await excluirCliente(cliente.id)
      await queryClient.invalidateQueries({ queryKey: ['clientes'] })
      setMensagem('Cliente excluído com sucesso.')
    } catch (erro) {
      setErroExclusao(getApiErrorMessage(erro))
    } finally {
      setClienteExcluindoId(null)
      setClienteParaExcluir(null)
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Users aria-hidden="true" className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          </div>
          {!clientesQuery.isLoading && !clientesQuery.isError && (
            <p className="mt-2 text-sm text-muted">
              {clientes.length}{' '}
              {clientes.length === 1
                ? 'cliente cadastrado'
                : 'clientes cadastrados'}
            </p>
          )}
        </div>

        <Link
          to="/clientes/cadastro"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <UserRoundPlus size={20} aria-hidden="true" />
          Cadastrar cliente
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

      {clientesQuery.isLoading && (
        <div className="flex flex-1 items-center justify-center gap-3 py-20 text-muted">
          <LoaderCircle
            className="animate-spin text-primary"
            aria-hidden="true"
          />
          Carregando clientes...
        </div>
      )}

      {clientesQuery.isError && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-md bg-danger px-6 py-12 text-center text-white">
          <AlertCircle aria-hidden="true" />
          <div>
            <p className="font-medium text-white">
              Não foi possível carregar os clientes
            </p>
            <p className="mt-1 text-sm text-white/80">
              {getApiErrorMessage(clientesQuery.error)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => clientesQuery.refetch()}
            className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-foreground"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {clientesQuery.isSuccess && clientes.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-card px-6 py-16 text-center">
          <Users size={36} className="text-muted" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">
              Nenhum cliente cadastrado
            </p>
            <p className="mt-1 text-sm text-muted">
              Cadastre o primeiro cliente para começar.
            </p>
          </div>
        </div>
      )}

      {clientesQuery.isSuccess && clientes.length > 0 && (
        <CampoBusca
          valor={busca}
          onChange={setBusca}
          placeholder="Buscar por nome, CPF/CNPJ, telefone ou e-mail"
          ariaLabel="Buscar clientes"
        />
      )}

      {clientesQuery.isSuccess &&
        clientes.length > 0 &&
        clientesFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-card px-6 py-12 text-center">
            <Users size={36} className="text-muted" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">
                Nenhum cliente encontrado
              </p>
              <p className="mt-1 text-sm text-muted">
                Tente buscar por outro nome ou documento.
              </p>
            </div>
          </div>
        )}

      {clientesQuery.isSuccess && clientesFiltrados.length > 0 && (
        <div className="overflow-hidden rounded-sm border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-5xl border-collapse text-left">
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
                {clientesFiltrados.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="group text-sm text-foreground transition-colors hover:bg-surface"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-medium">
                      {cliente.nome}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {formatarCpfCnpj(cliente.cpf_cnpj)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {cliente.telefone || '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {cliente.email || '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {cliente.endereco || '—'}
                    </td>
                    <td className="sticky right-0 z-10 w-px border-l border-border bg-card px-5 py-4 text-right whitespace-nowrap transition-colors group-hover:bg-surface">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/clientes/${cliente.id}`}
                          aria-label={`Visualizar cliente ${cliente.nome}`}
                          title="Visualizar cliente"
                          className="inline-flex rounded-md bg-border p-2 text-white transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                        >
                          <Eye size={18} aria-hidden="true" />
                        </Link>
                        <Link
                          to={`/clientes/${cliente.id}/editar`}
                          aria-label={`Editar cliente ${cliente.nome}`}
                          title="Editar cliente"
                          className="inline-flex rounded-md bg-primary p-2 text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          <Pencil size={18} aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          aria-label={`Excluir cliente ${cliente.nome}`}
                          title="Excluir cliente"
                          disabled={clienteExcluindoId !== null}
                          onClick={() => {
                            setErroExclusao(null)
                            setClienteParaExcluir(cliente)
                          }}
                          className="inline-flex cursor-pointer rounded-md bg-danger p-2 text-white transition-colors hover:bg-danger-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {clienteExcluindoId === cliente.id ? (
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
        aberto={clienteParaExcluir !== null}
        titulo="Excluir cliente"
        excluindo={clienteExcluindoId !== null}
        onCancelar={() => setClienteParaExcluir(null)}
        onConfirmar={confirmarExclusao}
        descricao={
          <div className="space-y-2">
            <p>
              Tem certeza que deseja excluir o cliente{' '}
              <strong className="text-foreground">
                {clienteParaExcluir?.nome}
              </strong>
              ?
            </p>
            <p className="text-sm">
              Os dados pessoais serão apagados e esta ação não poderá ser
              desfeita.
            </p>
          </div>
        }
      />
    </section>
  )
}
