import type { FormaPagamento, SituacaoOS } from '../types/ordemServico'

const situacoes: Record<
  SituacaoOS,
  { texto: string; classe: string; classeSuave: string }
> = {
  ORCADO: {
    texto: 'Orçado',
    classe: 'bg-border',
    classeSuave: 'border-border bg-border/30 text-foreground',
  },
  EM_FILA: {
    texto: 'Em fila',
    classe: 'bg-warning',
    classeSuave: 'border-warning/40 bg-warning/15 text-warning',
  },
  EM_ANDAMENTO: {
    texto: 'Em andamento',
    classe: 'bg-primary',
    classeSuave: 'border-primary/40 bg-primary/15 text-primary-light',
  },
  AGUARDANDO_PECA: {
    texto: 'Aguardando peça',
    classe: 'bg-warning',
    classeSuave: 'border-warning/40 bg-warning/15 text-warning',
  },
  FINALIZADO: {
    texto: 'Finalizado',
    classe: 'bg-success',
    classeSuave: 'border-success/40 bg-success/15 text-green-400',
  },
  PAGO: {
    texto: 'Pago',
    classe: 'bg-success',
    classeSuave: 'border-success/40 bg-success/15 text-green-400',
  },
}

export const rotulosPagamento: Record<FormaPagamento, string> = {
  DINHEIRO: 'Dinheiro',
  PIX: 'Pix',
  CARTAO: 'Cartão',
}

const formatadorDataHora = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const formatadorData = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
})

export function obterSituacaoOS(situacao: SituacaoOS) {
  return situacoes[situacao]
}

export function formatarDataOS(data?: string, incluirHora = true) {
  if (!data) return 'Não informado'

  const valor = new Date(data)
  if (Number.isNaN(valor.getTime())) return 'Data inválida'

  return (incluirHora ? formatadorDataHora : formatadorData).format(valor)
}
