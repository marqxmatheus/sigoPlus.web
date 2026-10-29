import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  House,
  Users,
  ChartNoAxesCombined,
  LogIn,
  PanelLeft,
} from 'lucide-react'

const links = [
  { nome: 'Home', rota: '/', icone: House },
  { nome: 'Clientes', rota: '/clientes', icone: Users },
  { nome: 'Relatórios', rota: '/relatorios', icone: ChartNoAxesCombined },
  { nome: 'Login', rota: '/login', icone: LogIn },
]

export function Sidebar() {
  const [aberta, setAberta] = useState(true)

  return (
    <aside className={`${aberta ? 'w-40' : 'w-12'} bg-surface transition-all`}>
      <button
        onClick={() => setAberta(!aberta)}
        aria-label={aberta ? 'Recolher menu' : 'Expandir menu'}
        className="mb-8 cursor-pointer p-3 text-muted transition-colors hover:bg-card hover:text-foreground"
      >
        <PanelLeft />
      </button>

      <nav className="flex flex-col gap-2">
        {links.map(({ nome, rota, icone: Icone }) => (
          <NavLink
            key={rota}
            to={rota}
            title={nome}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-muted hover:bg-card hover:text-foreground'
              }`
            }
          >
            <Icone size={22} className="shrink-0" />
            {aberta && <span>{nome}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
