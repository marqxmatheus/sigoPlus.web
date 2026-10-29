import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Package, Wrench } from 'lucide-react'
import { MainLayout } from './components/MainLayout'
import { Home } from './pages/Home'
import { Relatorios } from './pages/Relatorios'
import { CadastroCliente } from './pages/CadastroCliente'
import { Clientes } from './pages/Clientes'
import { Login } from './pages/Login'
import { ModuloEmDesenvolvimento } from './pages/ModuloEmDesenvolvimento'
import { Veiculos } from './pages/Veiculos'
import { CadastroVeiculo } from './pages/CadastroVeiculo'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/cadastro" element={<CadastroCliente />} />
          <Route path="/clientes/:id/editar" element={<CadastroCliente />} />
          <Route path="/veiculos" element={<Veiculos />} />
          <Route path="/veiculos/cadastro" element={<CadastroVeiculo />} />
          <Route path="/veiculos/:id/editar" element={<CadastroVeiculo />} />
          <Route
            path="/servicos"
            element={
              <ModuloEmDesenvolvimento titulo="Serviços" icone={Wrench} />
            }
          />
          <Route
            path="/pecas"
            element={<ModuloEmDesenvolvimento titulo="Peças" icone={Package} />}
          />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
