import { Link } from 'react-router-dom'
import { UserRoundPlus, Users } from 'lucide-react'

const clientes = [
  {
    id: 1,
    nome: 'Ana Oliveira',
    cpfCnpj: '123.456.789-00',
    telefone: '(11) 98765-4321',
    email: 'ana.oliveira@exemplo.com',
    endereco: 'Rua das Flores, 120 - Centro',
  },
  {
    id: 2,
    nome: 'Carlos Henrique Souza',
    cpfCnpj: '987.654.321-00',
    telefone: '(21) 99876-5432',
    email: 'carlos.souza@exemplo.com',
    endereco: 'Av. Brasil, 850 - Jardim América',
  },
  {
    id: 3,
    nome: 'Mariana Costa',
    cpfCnpj: '45.678.901/0001-23',
    telefone: '(31) 98888-7766',
    email: 'contato@marianacosta.com.br',
    endereco: 'Rua Pernambuco, 45 - Funcionários',
  },
  {
    id: 4,
    nome: 'Oficina Rota 12 Ltda.',
    cpfCnpj: '12.345.678/0001-90',
    telefone: '(41) 97777-6655',
    email: 'atendimento@rota12.com.br',
    endereco: 'Rod. BR-116, 2150 - Pinheirinho',
  },
  {
    id: 5,
    nome: 'Rafael Martins',
    cpfCnpj: '456.789.123-00',
    telefone: '(51) 96666-5544',
    email: 'rafael.martins@exemplo.com',
    endereco: 'Av. Ipiranga, 1020 - Azenha',
  },
]

const colunas = ['Nome', 'CPF/CNPJ', 'Telefone', 'E-mail', 'Endereço']

export function Clientes() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Users aria-hidden="true" className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          </div>
          <p className="mt-2 text-sm text-muted">
            {clientes.length} clientes cadastrados
          </p>
        </div>

        <Link
          to="/clientes/cadastro"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-medium text-white transition-colors hover:bg-primary-light"
        >
          <UserRoundPlus size={20} aria-hidden="true" />
          Cadastrar cliente
        </Link>
      </header>

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
                    {cliente.cpfCnpj}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted">
                    {cliente.telefone}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted">
                    {cliente.email}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-muted">
                    {cliente.endereco}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
