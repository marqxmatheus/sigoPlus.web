import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  CarFront,
  CircleCheck,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { listarClientes } from '../api/clientes'
import { excluirVeiculo, listarVeiculos } from '../api/veiculos'
import { CampoBusca } from '../components/CampoBusca'
import { ModalConfirmacaoExclusao } from '../components/ModalConfirmacaoExclusao'
import type { Veiculo } from '../types/veiculo'
import { formatarPlaca } from '../utils/formatters'
import { correspondeABusca } from '../utils/search'

const colunas = ['Placa', 'Marca', 'Modelo', 'Ano', 'Proprietário', 'Ações']

type LocationState = {
  mensagem?: string
}

export function Veiculos() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mensagemRecebida = (location.state as LocationState | null)?.mensagem
  const [mensagem, setMensagem] = useState<string | null>(
    mensagemRecebida ?? null,
  )
  const [erroExclusao, setErroExclusao] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [veiculoExcluindoId, setVeiculoExcluindoId] = useState<number | null>(
    null,
  )
  const [veiculoParaExcluir, setVeiculoParaExcluir] = useState<Veiculo | null>(
    null,
  )
  const veiculosQuery = useQuery({
    queryKey: ['veiculos'],
    queryFn: listarVeiculos,
  })
  const clientesQuery = useQuery({
    queryKey: ['clientes'],
    queryFn: listarClientes,
  })
  const veiculos = veiculosQuery.data ?? []
  const clientesPorId = new Map(
    (clientesQuery.data ?? []).map((cliente) => [cliente.id, cliente.nome]),
  )
  const veiculosFiltrados = veiculos.filter((veiculo) =>
    correspondeABusca(
      busca,
      veiculo.placa,
      formatarPlaca(veiculo.placa),
      veiculo.marca,
      veiculo.modelo,
      veiculo.ano,
      clientesPorId.get(veiculo.cliente_id) ?? 'Cliente excluído',
    ),
  )
  const possuiErro = veiculosQuery.isError || clientesQuery.isError
  const carregando =
    !possuiErro && (veiculosQuery.isLoading || clientesQuery.isLoading)

  useEffect(() => {
    if (!mensagemRecebida) return

    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, mensagemRecebida, navigate])

  useEffect(() => {
    if (!mensagem) return

    const temporizador = window.setTimeout(() => setMensagem(null), 3000)

    return () => window.clearTimeout(temporizador)
  }, [mensagem])

  async function confirmarExclusao() {
    if (!veiculoParaExcluir) return

    const veiculo = veiculoParaExcluir
    setVeiculoExcluindoId(veiculo.id)
    setErroExclusao(null)

    try {
      await excluirVeiculo(veiculo.id)
      await queryClient.invalidateQueries({ queryKey: ['veiculos'] })
      setMensagem('Veículo excluído com sucesso.')
    } catch (erro) {
      setErroExclusao(getApiErrorMessage(erro))
    } finally {
      setVeiculoExcluindoId(null)
      setVeiculoParaExcluir(null)
    }
  }

  function tentarNovamente() {
    void veiculosQuery.refetch()
    void clientesQuery.refetch()
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <CarFront aria-hidden="true" className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Veículos</h1>
          </div>
          {!carregando && !possuiErro && (
            <p className="mt-2 text-sm text-muted">
              {veiculos.length}{' '}
              {veiculos.length === 1
                ? 'veículo cadastrado'
                : 'veículos cadastrados'}
            </p>
          )}
        </div>

        <Link
          to="/veiculos/cadastro"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
        >
          <Plus size={20} aria-hidden="true" />
          Cadastrar veículo
        </Link>
      </header>

      {mensagem && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 z-50 flex w-[calc(100%-2.5rem)] max-w-sm items-center gap-3 rounded-md bg-success px-4 py-3 text-sm font-medium text-white shadow-lg"
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

      {erroExclusao && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-md bg-danger px-4 py-3 text-sm font-medium text-white"
        >
          <span>{erroExclusao}</span>
          <button
            type="button"
            aria-label="Fechar erro"
            title="Fechar"
            onClick={() => setErroExclusao(null)}
            className="cursor-pointer rounded-sm p-1 transition-colors hover:bg-danger-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}

      {carregando && (
        <div className="flex flex-1 items-center justify-center gap-3 py-20 text-muted">
          <LoaderCircle
            className="animate-spin text-primary"
            aria-hidden="true"
          />
          Carregando veículos...
        </div>
      )}

      {possuiErro && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-md bg-danger px-6 py-12 text-center text-white">
          <AlertCircle aria-hidden="true" />
          <div>
            <p className="font-medium text-white">
              Não foi possível carregar os veículos
            </p>
            <p className="mt-1 text-sm text-white/80">
              {getApiErrorMessage(veiculosQuery.error ?? clientesQuery.error)}
            </p>
          </div>
          <button
            type="button"
            onClick={tentarNovamente}
            className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-foreground"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!carregando && !possuiErro && veiculos.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-card px-6 py-16 text-center">
          <CarFront size={40} className="text-muted" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">
              Nenhum veículo cadastrado
            </p>
            <p className="mt-1 text-sm text-muted">
              Cadastre o primeiro veículo para começar.
            </p>
          </div>
        </div>
      )}

      {!carregando && !possuiErro && veiculos.length > 0 && (
        <CampoBusca
          valor={busca}
          onChange={setBusca}
          placeholder="Buscar por placa, marca, modelo ou proprietário"
          ariaLabel="Buscar veículos"
        />
      )}

      {!carregando &&
        !possuiErro &&
        veiculos.length > 0 &&
        veiculosFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border bg-card px-6 py-12 text-center">
            <CarFront size={40} className="text-muted" aria-hidden="true" />
            <div>
              <p className="font-medium text-foreground">
                Nenhum veículo encontrado
              </p>
              <p className="mt-1 text-sm text-muted">
                Tente buscar por outra placa, modelo ou proprietário.
              </p>
            </div>
          </div>
        )}

      {!carregando && !possuiErro && veiculosFiltrados.length > 0 && (
        <div className="overflow-hidden rounded-sm border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-5xl border-collapse text-left">
              <thead className="bg-surface text-sm text-muted">
                <tr>
                  {colunas.map((coluna) => (
                    <th
                      key={coluna}
                      scope="col"
                      className={`border-b border-border px-5 py-4 font-medium ${
                        coluna === 'Ações'
                          ? 'sticky right-0 z-10 border-l border-border bg-surface text-right'
                          : ''
                      }`}
                    >
                      {coluna}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {veiculosFiltrados.map((veiculo) => (
                  <tr
                    key={veiculo.id}
                    className="group text-sm text-foreground transition-colors hover:bg-surface"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-medium">
                      {formatarPlaca(veiculo.placa)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {veiculo.marca || '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {veiculo.modelo || '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {veiculo.ano || '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-muted">
                      {clientesPorId.get(veiculo.cliente_id) ??
                        'Cliente excluído'}
                    </td>
                    <td className="sticky right-0 z-10 w-px border-l border-border bg-card px-5 py-4 text-right whitespace-nowrap transition-colors group-hover:bg-surface">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/veiculos/${veiculo.id}/editar`}
                          aria-label={`Editar veículo ${formatarPlaca(veiculo.placa)}`}
                          title="Editar veículo"
                          className="inline-flex rounded-md bg-primary p-2 text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          <Pencil size={18} aria-hidden="true" />
                        </Link>
                        <button
                          type="button"
                          aria-label={`Excluir veículo ${formatarPlaca(veiculo.placa)}`}
                          title="Excluir veículo"
                          disabled={veiculoExcluindoId !== null}
                          onClick={() => {
                            setErroExclusao(null)
                            setVeiculoParaExcluir(veiculo)
                          }}
                          className="inline-flex cursor-pointer rounded-md bg-danger p-2 text-white transition-colors hover:bg-danger-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {veiculoExcluindoId === veiculo.id ? (
                            <LoaderCircle
                              size={18}
                              className="animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <Trash2 size={18} aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ModalConfirmacaoExclusao
        aberto={veiculoParaExcluir !== null}
        titulo="Excluir veículo"
        excluindo={veiculoExcluindoId !== null}
        onCancelar={() => setVeiculoParaExcluir(null)}
        onConfirmar={confirmarExclusao}
        descricao={
          <div className="space-y-2">
            <p>
              Tem certeza que deseja excluir o veículo{' '}
              <strong className="text-foreground">
                {veiculoParaExcluir
                  ? formatarPlaca(veiculoParaExcluir.placa)
                  : ''}
              </strong>
              ?
            </p>
            <p className="text-sm">Esta ação não poderá ser desfeita.</p>
          </div>
        }
      />
    </section>
  )
}
