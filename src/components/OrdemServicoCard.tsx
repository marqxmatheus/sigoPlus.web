import {
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Motorbike,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import type { OrdemServico } from '../types/ordemServico'
import { formatarMoeda, formatarPlaca } from '../utils/formatters'
import { formatarDataOS, obterSituacaoOS } from '../utils/ordemServico'

type OrdemServicoCardProps = {
  ordem: OrdemServico
}

export function OrdemServicoCard({ ordem }: OrdemServicoCardProps) {
  const situacao = obterSituacaoOS(ordem.situacao)
  const identificacaoVeiculo = [ordem.veiculo_marca, ordem.veiculo_modelo]
    .filter(Boolean)
    .join(' ')

  return (
    <article className="relative min-h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm hover:border-primary focus-within:border-primary">
      <Link
        to={`/ordens-servico/${ordem.id}`}
        aria-label={`Abrir ordem de serviço ${ordem.id}, veículo ${formatarPlaca(ordem.veiculo_placa)}`}
        className="flex min-h-full flex-col outline-none"
      >
        <div className="relative flex h-40 items-center justify-center overflow-hidden border-b border-border bg-surface">
          <span className="absolute top-3 left-3 text-xs font-semibold tracking-wide text-muted">
            OS #{ordem.id}
          </span>
          <span
            className={`absolute top-3 right-3 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold ${situacao.classeSuave}`}
          >
            {situacao.texto}
          </span>
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-primary/25 bg-background/55 text-primary shadow-inner shadow-black/30">
            <Motorbike size={68} strokeWidth={1.35} aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-1 flex-col px-5 pt-5 pb-4">
          <div className="relative z-10 mx-auto -mt-10 mb-4 rounded-lg border-4 border-card bg-foreground px-5 py-2 text-center shadow-lg shadow-black/30">
            <p className="font-mono text-xl font-black tracking-[0.18em] text-background uppercase">
              {formatarPlaca(ordem.veiculo_placa)}
            </p>
          </div>

          <div className="mb-5 text-center">
            <h2 className="line-clamp-1 text-lg font-bold text-foreground">
              {identificacaoVeiculo || 'Modelo não informado'}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {ordem.veiculo_ano > 0
                ? `Ano ${ordem.veiculo_ano}`
                : 'Ano não informado'}
            </p>
          </div>

          <dl className="space-y-3 border-t border-border pt-4 text-sm">
            <div className="flex items-center gap-3">
              <UserRound
                size={17}
                className="shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <dt className="sr-only">Cliente</dt>
                <dd className="truncate font-medium text-foreground">
                  {ordem.cliente_nome}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CircleDollarSign
                size={17}
                className="shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <dt className="sr-only">Valor</dt>
                <dd className="font-semibold text-foreground">
                  {formatarMoeda(ordem.valor_total)}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarDays
                size={17}
                className="shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <dt className="sr-only">Data de abertura</dt>
                <dd className="text-muted">
                  {formatarDataOS(ordem.created_at, false)}
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-auto flex items-center justify-end gap-1 pt-5 text-sm font-semibold text-primary-light">
            Ver detalhes
            <ChevronRight size={18} aria-hidden="true" />
          </div>
        </div>
      </Link>
    </article>
  )
}
