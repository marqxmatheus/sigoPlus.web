import { LoaderCircle, Trash2, X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

type ModalConfirmacaoExclusaoProps = {
  aberto: boolean
  titulo: string
  descricao: ReactNode
  excluindo?: boolean
  onCancelar: () => void
  onConfirmar: () => void
}

export function ModalConfirmacaoExclusao({
  aberto,
  titulo,
  descricao,
  excluindo = false,
  onCancelar,
  onConfirmar,
}: ModalConfirmacaoExclusaoProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const botaoCancelarRef = useRef<HTMLButtonElement>(null)
  const cancelarRef = useRef(onCancelar)
  const excluindoRef = useRef(excluindo)

  useEffect(() => {
    cancelarRef.current = onCancelar
    excluindoRef.current = excluindo
  }, [excluindo, onCancelar])

  useEffect(() => {
    if (!aberto) return

    const elementoFocadoAnterior = document.activeElement as HTMLElement | null
    const animacao = window.requestAnimationFrame(() => {
      botaoCancelarRef.current?.focus()
    })

    function controlarTeclado(evento: KeyboardEvent) {
      if (evento.key === 'Escape' && !excluindoRef.current) {
        cancelarRef.current()
        return
      }

      if (evento.key !== 'Tab') return

      const botoes = Array.from(
        modalRef.current?.querySelectorAll<HTMLButtonElement>(
          'button:not(:disabled)',
        ) ?? [],
      )
      const primeiroBotao = botoes.at(0)
      const ultimoBotao = botoes.at(-1)

      if (!primeiroBotao || !ultimoBotao) {
        evento.preventDefault()
        return
      }

      if (evento.shiftKey && document.activeElement === primeiroBotao) {
        evento.preventDefault()
        ultimoBotao.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimoBotao) {
        evento.preventDefault()
        primeiroBotao.focus()
      }
    }

    document.addEventListener('keydown', controlarTeclado)
    return () => {
      window.cancelAnimationFrame(animacao)
      document.removeEventListener('keydown', controlarTeclado)
      elementoFocadoAnterior?.focus()
    }
  }, [aberto])

  if (!aberto) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget && !excluindo) onCancelar()
      }}
    >
      <div
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="titulo-modal-exclusao"
        aria-describedby="descricao-modal-exclusao"
        className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between bg-danger px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <Trash2 size={22} aria-hidden="true" />
            <h2 id="titulo-modal-exclusao" className="text-lg font-semibold">
              {titulo}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Fechar confirmação"
            title="Fechar"
            disabled={excluindo}
            onClick={onCancelar}
            className="cursor-pointer rounded-md p-1 text-white transition-colors hover:bg-danger-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div id="descricao-modal-exclusao" className="px-5 py-6 text-muted">
          {descricao}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border bg-surface px-5 py-4 sm:flex-row sm:justify-end">
          <button
            ref={botaoCancelarRef}
            type="button"
            disabled={excluindo}
            onClick={onCancelar}
            className="cursor-pointer rounded-md bg-card px-5 py-2.5 font-medium text-foreground transition-colors hover:bg-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={excluindo}
            onClick={onConfirmar}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-md bg-danger px-5 py-2.5 font-medium text-white transition-colors hover:bg-danger-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:cursor-not-allowed disabled:opacity-60"
          >
            {excluindo ? (
              <LoaderCircle
                size={18}
                className="animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Trash2 size={18} aria-hidden="true" />
            )}
            {excluindo ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  )
}
