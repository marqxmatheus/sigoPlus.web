import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CarFront,
  ChartNoAxesCombined,
  Package,
  Users,
  Wrench,
} from 'lucide-react'

const paginas = [
  {
    nome: 'Clientes',
    descricao: 'Cadastre e gerencie os clientes da oficina.',
    rota: '/clientes',
    icone: Users,
  },
  {
    nome: 'Veículos',
    descricao: 'Gerencie as motocicletas vinculadas aos clientes.',
    rota: '/veiculos',
    icone: CarFront,
  },
  {
    nome: 'Serviços',
    descricao: 'Configure serviços, valores e tempos estimados.',
    rota: '/servicos',
    icone: Wrench,
  },
  {
    nome: 'Peças',
    descricao: 'Acompanhe preços, quantidades e estoque mínimo.',
    rota: '/pecas',
    icone: Package,
  },
  {
    nome: 'Relatórios',
    descricao: 'Consulte os indicadores e resultados da oficina.',
    rota: '/relatorios',
    icone: ChartNoAxesCombined,
  },
]

export function Home() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
      <header className="mb-6">
        <p className="mb-1 text-sm font-semibold tracking-wider text-primary uppercase">
          Painel principal
        </p>
        <h1 className="text-3xl font-bold text-foreground">
          Bem-vindo ao SIGO+
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Acesse rapidamente as principais áreas de gestão da sua oficina de
          motocicletas.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginas.map(({ nome, descricao, rota, icone: Icone }) => (
          <Link
            key={rota}
            to={rota}
            className="group flex min-h-40 flex-col rounded-md border border-border bg-card p-4 transition-colors hover:border-primary hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white transition-colors group-hover:bg-primary-dark">
              <Icone size={24} aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold text-foreground group-hover:text-white">
              {nome}
            </h2>
            <p className="mt-1.5 flex-1 text-sm leading-5 text-muted group-hover:text-white/85">
              {descricao}
            </p>
            <span className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-white">
              Acessar
              <ArrowRight size={17} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
