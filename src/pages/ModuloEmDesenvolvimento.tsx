import type { LucideIcon } from 'lucide-react'

type ModuloEmDesenvolvimentoProps = {
  titulo: string
  icone: LucideIcon
}

export function ModuloEmDesenvolvimento({
  titulo,
  icone: Icone,
}: ModuloEmDesenvolvimentoProps) {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <header className="flex items-center gap-3">
        <Icone aria-hidden="true" className="text-primary" />
        <h1 className="text-2xl font-bold text-foreground">{titulo}</h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-md border border-border bg-card px-6 py-16 text-center">
        <Icone size={40} className="text-primary" aria-hidden="true" />
        <p className="font-medium text-foreground">Módulo em desenvolvimento</p>
        <p className="text-sm text-muted">
          Esta página será integrada aos recursos já disponíveis na API.
        </p>
      </div>
    </section>
  )
}
