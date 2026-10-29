import { Search, X } from 'lucide-react'

type CampoBuscaProps = {
  valor: string
  onChange: (valor: string) => void
  placeholder: string
  ariaLabel: string
}

export function CampoBusca({
  valor,
  onChange,
  placeholder,
  ariaLabel,
}: CampoBuscaProps) {
  return (
    <div className="relative w-full">
      <Search
        size={19}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-11 w-full rounded-md border-2 border-border/60 bg-surface pr-11 pl-11 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary"
      />
      {valor && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          title="Limpar busca"
          className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-md p-1.5 text-muted transition-colors hover:bg-border hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <X size={17} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
