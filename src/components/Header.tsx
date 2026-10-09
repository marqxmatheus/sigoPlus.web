import { Link } from 'react-router-dom'
import icon from '../assets/Icon.png'
import name from '../assets/Name.png'

export function Header() {
  return (
    <header className="flex shrink-0 justify-end border-b border-border/35 px-5 py-2">
      <Link
        to="/"
        aria-label="Ir para a página inicial"
        className="flex items-center gap-2"
      >
        <img
          src={icon}
          alt="Logo SIGO+"
          className="h-8 w-auto object-contain"
        />
        <img
          src={name}
          alt="Nome SIGO+"
          className="h-8 w-auto object-contain"
        />
      </Link>
    </header>
  )
}
