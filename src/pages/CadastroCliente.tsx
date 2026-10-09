import { useState } from 'react'
import { UserRoundPlus } from 'lucide-react'

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
    <form onSubmit={handleSubmit} className="flex min-h-full flex-1 flex-col">
      <header className="pb-5">
        <div className="mx-auto flex w-full max-w-200 items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-foreground">
            Cadastrar cliente
          </h1>
          <UserRoundPlus
            size={28}
            aria-hidden="true"
            className="shrink-0 text-primary"
          />
        </div>
      </header>

      <div className="mx-auto w-full max-w-200 py-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          {[
            {
              nome: 'nome',
              label: 'Nome',
              tipo: 'text',
              placeholder: 'Nome completo',
              autocomplete: 'name',
              classe: 'sm:col-span-2',
            },
            {
              nome: 'cpfCnpj',
              label: 'CPF/CNPJ',
              tipo: 'text',
              placeholder: 'Digite o CPF ou CNPJ',
              autocomplete: 'off',
            },
            {
              nome: 'telefone',
              label: 'Telefone',
              tipo: 'tel',
              placeholder: '(00) 00000-0000',
              autocomplete: 'tel',
            },
            {
              nome: 'email',
              label: 'E-mail',
              tipo: 'email',
              placeholder: 'nome@exemplo.com',
              autocomplete: 'email',
              classe: 'sm:col-span-2',
            },
            {
              nome: 'endereco',
              label: 'Endereço',
              tipo: 'text',
              placeholder: 'Rua, número, bairro e cidade',
              autocomplete: 'street-address',
              classe: 'sm:col-span-2',
            },
          ].map((campo) => (
            <div key={campo.nome} className={campo.classe}>
              <label
                htmlFor={campo.nome}
                className="mb-2 block text-sm font-medium text-foreground"
              >
                {campo.label}
              </label>

              <input
                id={campo.nome}
                name={campo.nome}
                type={campo.tipo}
                placeholder={campo.placeholder}
                autoComplete={campo.autocomplete}
                value={cliente[campo.nome as keyof typeof cliente]}
                onChange={handleChange}
                required
                className="h-12 w-full rounded-md border-2 border-border/40 bg-surface px-4 text-foreground outline-none placeholder:text-muted focus:border-primary"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="mt-7 w-full cursor-pointer rounded-md bg-primary px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
        >
          Salvar
        </button>
      </div>
    </form>
  )
}
