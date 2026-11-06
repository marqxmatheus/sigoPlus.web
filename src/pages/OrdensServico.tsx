import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  CircleCheck,
  ClipboardList,
  LoaderCircle,
  Plus,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { listarOrdensServico } from '../api/ordensServico'
import { CampoBusca } from '../components/CampoBusca'
import { ModalOrdemServico } from '../components/ModalOrdemServico'
import { OrdemServicoCard } from '../components/OrdemServicoCard'
import { formatarMoeda, formatarPlaca } from '../utils/formatters'
import { obterSituacaoOS } from '../utils/ordemServico'
import { correspondeABusca } from '../utils/search'

type LocationState = {
  mensagem?: string
}

export function OrdensServico() {
  const { id } = useParams<{ id?: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const mensagemRecebida = (location.state as LocationState | null)?.mensagem
  const idNumerico = id ? Number(id) : null
  const idValido =
    idNumerico === null || (Number.isInteger(idNumerico) && idNumerico > 0)
  const ordemAbertaId = idValido ? idNumerico : null
  const [mensagem, setMensagem] = useState<string | null>(
    mensagemRecebida ?? null,
  )
  const [busca, setBusca] = useState('')
  const ordensQuery = useQuery({
    queryKey: ['ordens-servico'],
    queryFn: listarOrdensServico,
  })
  const ordens = ordensQuery.data ?? []
  const ordensFiltradas = ordens.filter((ordem) => {
    const situacao = obterSituacaoOS(ordem.situacao)

    return correspondeABusca(
      busca,
      ordem.id,
      `#${ordem.id}`,
      ordem.cliente_nome,
      ordem.veiculo_placa,
      formatarPlaca(ordem.veiculo_placa),
      ordem.veiculo_marca,
      ordem.veiculo_modelo,
      ordem.veiculo_ano,
      ordem.situacao,
      situacao.texto,
      formatarMoeda(ordem.valor_total),
    )
  })

  useEffect(() => {
    if (!mensagemRecebida) return

    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, mensagemRecebida, navigate])

  useEffect(() => {
    if (idValido) return

    navigate('/ordens-servico', { replace: true })
  }, [idValido, navigate])

  useEffect(() => {
    if (!mensagem) return

    const temporizador = window.setTimeout(() => setMensagem(null), 3000)
    return () => window.clearTimeout(temporizador)
  }, [mensagem])

  return (
    <section className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ClipboardList aria-hidden="true" className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Ordens de serviço
            </h1>
          </div>
          {!ordensQuery.isLoading && !ordensQuery.isError && (
            <p className="mt-2 text-sm text-muted">
              {ordens.length}{' '}
              {ordens.length === 1
                ? 'ordem de serviço cadastrada'
                : 'ordens de serviço cadastradas'}
            </p>
          )}
        </div>

        <Link
          to="/ordens-servico/cadastro"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Plus size={20} aria-hidden="true" />
          Nova ordem
        </Link>
      </header>

      {mensagem && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 z-[60] flex w-[calc(100%-2.5rem)] max-w-sm items-center gap-3 rounded-md bg-success px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          <CircleCheck className="shrink-0" size={20} aria-hidden="true" />
          <span className="flex-1">{mensagem}</span>
          <button
            type="button"
            aria-label="Fechar alerta"
            title="Fechar"
            onClick={() => setMensagem(null)}
            className="cursor-pointer rounded-sm p-1 text-white transition-colors hover:bg-success-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      {ordensQuery.isLoading && (
        <div className="flex flex-1 items-center justify-center gap-3 py-20 text-muted">
          <LoaderCircle
            className="animate-spin text-primary"
            aria-hidden="true"
          />
          Carregando ordens de serviço...
        </div>
      )}

      {ordensQuery.isError && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-md bg-danger px-6 py-12 text-center text-white">
          <AlertCircle aria-hidden="true" />
          <div>
            <p className="font-medium text-white">
              Não foi possível carregar as ordens de serviço
            </p>
            <p className="mt-1 text-sm text-white/80">
              {getApiErrorMessage(ordensQuery.error)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => ordensQuery.refetch()}
            className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-foreground"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {ordensQuery.isSuccess && ordens.length === 0 && (
        <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
          <p className="text-sm text-muted">
            Nenhuma ordem de serviço cadastrada
          </p>
        </div>
      )}

      {ordensQuery.isSuccess && ordens.length > 0 && (
        <CampoBusca
          valor={busca}
          onChange={setBusca}
          placeholder="Buscar por ordem, cliente, placa, modelo ou situação"
          ariaLabel="Buscar ordens de serviço"
        />
      )}

      {ordensQuery.isSuccess &&
        ordens.length > 0 &&
        ordensFiltradas.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-card px-6 py-12 text-center">
            <ClipboardList
              size={40}
              className="text-muted"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium text-foreground">
                Nenhuma ordem de serviço encontrada
              </p>
              <p className="mt-1 text-sm text-muted">
                Tente buscar por outro número, cliente, placa, modelo ou
                situação.
              </p>
            </div>
          </div>
        )}

      {ordensQuery.isSuccess && ordensFiltradas.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {ordensFiltradas.map((ordem) => (
            <OrdemServicoCard key={ordem.id} ordem={ordem} />
          ))}
        </div>
      )}

      {ordemAbertaId !== null && (
        <ModalOrdemServico
          key={ordemAbertaId}
          ordemId={ordemAbertaId}
          onFechar={() => navigate('/ordens-servico', { replace: true })}
          onExcluida={() => {
            setMensagem('Ordem de serviço excluída com sucesso.')
            navigate('/ordens-servico', { replace: true })
          }}
        />
      )}
    </section>
  )
}
