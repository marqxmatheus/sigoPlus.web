import { useQuery } from '@tanstack/react-query'
import { AlertCircle, LoaderCircle, UserRoundPlus, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { listarClientes } from '../api/clientes'
import { formatarCpfCnpj } from '../utils/formatters'

const colunas = ['Nome', 'CPF/CNPJ', 'Telefone', 'E-mail', 'Endereço']

type LocationState = {
  mensagem?: string
}

export function Clientes() {
  const location = useLocation()
  const mensagem = (location.state as LocationState | null)?.mensagem
  const clientesQuery = useQuery({
    queryKey: ['clientes'],
    queryFn: listarClientes,
  })
  const clientes = clientesQuery.data ?? []

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
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-medium text-white transition-colors hover:bg-primary-light"
        >
          <UserRoundPlus size={20} aria-hidden="true" />
          Cadastrar cliente
        </Link>
      </header>

      {mensagem && (
        <div
          role="status"
          className="rounded-md border border-success/40 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {mensagem}
        </div>
      )}

      {clientesQuery.isLoading && (
        <div className="flex flex-1 items-center justify-center gap-3 py-20 text-muted">
          <LoaderCircle className="animate-spin text-primary" aria-hidden="true" />
          Carregando clientes...
        </div>
      )}

      {clientesQuery.isError && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-danger/40 bg-danger/10 px-6 py-12 text-center">
          <AlertCircle className="text-danger" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">
              Não foi possível carregar os clientes
            </p>
            <p className="mt-1 text-sm text-muted">
              {getApiErrorMessage(clientesQuery.error)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => clientesQuery.refetch()}
            className="cursor-pointer rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
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
        <div className="overflow-hidden rounded-sm border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-5xl border-collapse text-left">
              <thead className="bg-surface text-sm text-muted">
                <tr>
                  {colunas.map((coluna) => (
                    <th
                      key={coluna}
                      scope="col"
                      className="border-b border-border px-5 py-4 font-medium"
                    >
                      {coluna}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {clientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="text-sm text-foreground transition-colors hover:bg-surface/60"
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
