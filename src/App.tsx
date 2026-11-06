import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/MainLayout'
import { Home } from './pages/Home'
import { Relatorios } from './pages/Relatorios'
import { CadastroCliente } from './pages/CadastroCliente'
import { Clientes } from './pages/Clientes'
import { Veiculos } from './pages/Veiculos'
import { CadastroVeiculo } from './pages/CadastroVeiculo'
import { Servicos } from './pages/Servicos'
import { CadastroServico } from './pages/CadastroServico'
import { Pecas } from './pages/Pecas'
import { CadastroPeca } from './pages/CadastroPeca'
import { DetalhesCliente } from './pages/DetalhesCliente'
import { OrdensServico } from './pages/OrdensServico'
import { CadastroOrdemServico } from './pages/CadastroOrdemServico'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/cadastro" element={<CadastroCliente />} />
          <Route path="/clientes/:id" element={<DetalhesCliente />} />
          <Route path="/clientes/:id/editar" element={<CadastroCliente />} />
          <Route path="/veiculos" element={<Veiculos />} />
          <Route path="/veiculos/cadastro" element={<CadastroVeiculo />} />
          <Route path="/veiculos/:id/editar" element={<CadastroVeiculo />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/servicos/cadastro" element={<CadastroServico />} />
          <Route path="/servicos/:id/editar" element={<CadastroServico />} />
          <Route path="/pecas" element={<Pecas />} />
          <Route path="/pecas/cadastro" element={<CadastroPeca />} />
          <Route path="/pecas/:id/editar" element={<CadastroPeca />} />
          <Route path="/ordens-servico" element={<OrdensServico />} />
          <Route
            path="/ordens-servico/cadastro"
            element={<CadastroOrdemServico />}
          />
          <Route path="/ordens-servico/:id" element={<OrdensServico />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
