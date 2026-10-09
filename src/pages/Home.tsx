import { Link } from 'react-router-dom'
import { Users, ChartNoAxesCombined, LogIn } from 'lucide-react'

const paginas = [
  { nome: 'Clientes', rota: '/clientes/cadastro', icone: Users },
  { nome: 'Relatórios', rota: '/relatorios', icone: ChartNoAxesCombined },
  { nome: 'Login', rota: '/login', icone: LogIn },
]

export function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-10">
      <h1 className="text-3xl font-bold">Bem-vindo ao SIGO+</h1>

      <div className="flex flex-wrap justify-center gap-6">
        {paginas.map(({ nome, rota, icone: Icone }) => (
          <Link
            key={rota}
            to={rota}
            className="flex h-44 w-48 flex-col items-center justify-center gap-4 rounded-md bg-card hover:bg-primary/60"
          >
            <Icone size={52} className="text-primary" />
            <span>{nome}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
