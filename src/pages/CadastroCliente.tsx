import { useState } from 'react'

export function CadastroCliente() {
  const [cliente, setCliente] = useState({
    nome: '',
    cpfCnpj: '',
    telefone: '',
    email: '',
    endereco: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCliente({
      ...cliente,
      [e.target.name]: e.target.value,
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    console.log('Cliente:', cliente)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-2xl font-bold">Cadastro de clientes</h1>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl bg-card p-6">
        {[
          { nome: 'nome', label: 'Nome', tipo: 'text' },
          { nome: 'cpfCnpj', label: 'CPF/CNPJ', tipo: 'text' },
          { nome: 'telefone', label: 'Telefone', tipo: 'tel' },
          { nome: 'email', label: 'E-mail', tipo: 'email' },
          { nome: 'endereco', label: 'Endereço', tipo: 'text' },
        ].map((campo) => (
          <div key={campo.nome}>
            <label htmlFor={campo.nome} className="mb-2 block text-sm">
              {campo.label}
            </label>

            <input
              id={campo.nome}
              name={campo.nome}
              type={campo.tipo}
              value={cliente[campo.nome as keyof typeof cliente]}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-border bg-background p-3 outline-none focus:border-primary"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full cursor-pointer rounded-lg bg-primary p-3 font-medium text-white hover:opacity-90"
        >
          Cadastrar cliente
        </button>
      </form>
    </div>
  )
}