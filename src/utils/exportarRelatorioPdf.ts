import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoUrl from '../assets/Logo.png'
import type {
  RelatorioEstoque,
  RelatorioOSCliente,
  RelatorioOSPeriodo,
} from '../types/relatorio'
import type {
  FiltrosRelatorioEstoque,
  FiltrosRelatorioPeriodo,
} from '../api/relatorios'
import { formatarMoeda, formatarPlaca } from './formatters'
import { formatarDataOS, obterSituacaoOS, rotulosPagamento } from './ordemServico'

type DefinicaoPdf = {
  titulo: string
  filtros: string[]
  cabecalho: string[]
  linhas: string[][]
  nomeArquivo: string
  larguras?: Record<number, { cellWidth: number }>
}

function carregarLogo() {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const imagem = new Image()
    imagem.onload = () => resolve(imagem)
    imagem.onerror = () => reject(new Error('Não foi possível carregar a logo.'))
    imagem.src = logoUrl
  })
}

function formatarDataCalendario(data?: string) {
  if (!data) return 'Não informada'
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

function sufixoArquivo() {
  const agora = new Date()
  const partes = [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, '0'),
    String(agora.getDate()).padStart(2, '0'),
  ]
  return partes.join('-')
}

async function gerarPdf(definicao: DefinicaoPdf, dataEmissao: string) {
  const logo = await carregarLogo()
  const documento = new jsPDF({ orientation: 'landscape', format: 'a4' })
  const larguraPagina = documento.internal.pageSize.getWidth()

  documento.setFillColor(28, 28, 32)
  documento.rect(0, 0, larguraPagina, 34, 'F')
  documento.addImage(logo, 'PNG', 14, 4, 26, 26)
  documento.setTextColor(255, 255, 255)
  documento.setFontSize(18)
  documento.setFont('helvetica', 'bold')
  documento.text(definicao.titulo, 45, 15)
  documento.setFontSize(9)
  documento.setFont('helvetica', 'normal')
  documento.setTextColor(210, 210, 215)
  documento.text(`Emitido em ${formatarDataOS(dataEmissao)}`, 45, 22)

  documento.setTextColor(30, 30, 34)
  documento.setFontSize(9)
  documento.setFont('helvetica', 'bold')
  documento.text('Filtros utilizados', 14, 43)
  documento.setFont('helvetica', 'normal')
  definicao.filtros.forEach((filtro, indice) => {
    documento.text(`• ${filtro}`, 14, 49 + indice * 5)
  })

  autoTable(documento, {
    startY: 54 + definicao.filtros.length * 5,
    head: [definicao.cabecalho],
    body: definicao.linhas,
    theme: 'grid',
    margin: { left: 14, right: 14, top: 14, bottom: 16 },
    showHead: 'everyPage',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2.2,
      lineColor: [215, 215, 220],
      lineWidth: 0.15,
      textColor: [35, 35, 39],
      valign: 'middle',
    },
    headStyles: {
      fillColor: [228, 108, 12],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: { fillColor: [247, 247, 248] },
    columnStyles: definicao.larguras,
  })

  const totalPaginas = documento.getNumberOfPages()
  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    documento.setPage(pagina)
    const alturaPagina = documento.internal.pageSize.getHeight()
    documento.setDrawColor(210, 210, 215)
    documento.line(14, alturaPagina - 11, larguraPagina - 14, alturaPagina - 11)
    documento.setFont('helvetica', 'normal')
    documento.setFontSize(8)
    documento.setTextColor(100, 100, 105)
    documento.text('SIGO+ — Sistema de Gestão de Oficina', 14, alturaPagina - 6)
    documento.text(
      `Página ${pagina} de ${totalPaginas}`,
      larguraPagina - 14,
      alturaPagina - 6,
      { align: 'right' },
    )
  }

  documento.save(`${definicao.nomeArquivo}-${sufixoArquivo()}.pdf`)
}

export function exportarEstoquePdf(
  relatorio: RelatorioEstoque,
  filtros: FiltrosRelatorioEstoque,
) {
  return gerarPdf(
    {
      titulo: 'Relatório de estoque de peças',
      filtros: [
        `Busca: ${filtros.busca || 'Todas as peças'}`,
        `Situação: ${filtros.abaixo_minimo ? 'Somente abaixo do estoque mínimo' : 'Todos os estoques'}`,
      ],
      cabecalho: [
        'Código',
        'Descrição',
        'Quantidade',
        'Estoque mínimo',
        'Valor unitário',
        'Valor em estoque',
        'Situação',
      ],
      linhas: relatorio.itens.map((item) => [
        item.codigo,
        item.descricao,
        String(item.qtd_estoque),
        String(item.estoque_minimo),
        formatarMoeda(item.valor_unitario),
        formatarMoeda(item.valor_total),
        item.abaixo_minimo ? 'Abaixo do mínimo' : 'Regular',
      ]),
      nomeArquivo: 'relatorio-estoque',
      larguras: { 0: { cellWidth: 25 }, 2: { cellWidth: 23 }, 3: { cellWidth: 27 } },
    },
    relatorio.data_emissao,
  )
}

function linhasOrdens(
  relatorio: RelatorioOSPeriodo | RelatorioOSCliente,
) {
  return relatorio.itens.map((item) => [
    `#${item.ordem_servico_id}`,
    formatarDataOS(item.data_abertura),
    item.cliente_nome,
    `${formatarPlaca(item.veiculo_placa)} — ${item.veiculo_marca} ${item.veiculo_modelo}`,
    obterSituacaoOS(item.situacao).texto,
    item.forma_pagamento
      ? `${rotulosPagamento[item.forma_pagamento]} — ${formatarDataOS(item.data_pagamento ?? undefined)}`
      : 'Pendente',
    formatarMoeda(item.valor_total),
  ])
}

const cabecalhoOrdens = [
  'Ordem',
  'Abertura',
  'Cliente',
  'Veículo',
  'Situação',
  'Pagamento',
  'Valor',
]

const largurasOrdens = {
  0: { cellWidth: 16 },
  1: { cellWidth: 29 },
  4: { cellWidth: 27 },
  6: { cellWidth: 25 },
}

export function exportarOrdensPeriodoPdf(
  relatorio: RelatorioOSPeriodo,
  filtros: FiltrosRelatorioPeriodo,
) {
  return gerarPdf(
    {
      titulo: 'Relatório de ordens de serviço por período',
      filtros: [
        `Data inicial: ${formatarDataCalendario(filtros.data_inicio)}`,
        `Data final: ${formatarDataCalendario(filtros.data_fim)}`,
      ],
      cabecalho: cabecalhoOrdens,
      linhas: linhasOrdens(relatorio),
      nomeArquivo: 'relatorio-ordens-periodo',
      larguras: largurasOrdens,
    },
    relatorio.data_emissao,
  )
}

export function exportarOrdensClientePdf(relatorio: RelatorioOSCliente) {
  return gerarPdf(
    {
      titulo: 'Relatório de ordens de serviço por cliente',
      filtros: [
        `Cliente: ${relatorio.cliente?.nome || 'Todos os clientes'}`,
      ],
      cabecalho: cabecalhoOrdens,
      linhas: linhasOrdens(relatorio),
      nomeArquivo: 'relatorio-ordens-cliente',
      larguras: largurasOrdens,
    },
    relatorio.data_emissao,
  )
}
