import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/MainLayout'
import { Home } from './pages/Home'
import { Relatorios } from './pages/Relatorios'
import { CadastroCliente } from './pages/CadastroCliente'
import { Login } from './pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/clientes/cadastro" element={<CadastroCliente />} />
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}