# SIGO+ Web

Frontend do SIGO+ desenvolvido com React, TypeScript e Vite.

## Executar o ambiente completo com Docker

O Docker Compose fica no repositório `sigoPlus.api` e inicia PostgreSQL,
migrations, API e web. Com os repositórios `sigoPlus.api` e `sigoPlus.web` no
mesmo diretório, execute:

```bash
cd ../sigoPlus.api
docker compose up --build
```

Depois, acesse http://localhost:5173. Consulte o README da API para os demais
comandos e opções de configuração.

## Executar localmente

Instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm run dev
```

Por padrão, as chamadas para `/api` são encaminhadas para
`http://localhost:8080`, endereço padrão do projeto `sigoPlus.api`.

Para usar outro endereço durante o desenvolvimento, copie `.env.example` para
`.env.local` e altere `VITE_API_PROXY_TARGET`.

Em ambientes onde web e API possuem origens diferentes, defina
`VITE_API_URL` com a origem pública da API durante o build.

## Verificações

```bash
npm run lint
npm run build
```
