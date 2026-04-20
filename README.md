# Clinica SaaS Frontend

Frontend React para gestao de clinica psicologica com design estilo dashboard SaaS.

## Stack

- React + Vite
- Tailwind CSS
- React Router
- Axios
- Recharts

## Estrutura

```
src
|-- components
|-- hooks
|-- layouts
|-- pages
|-- services
|-- utils
|-- App.jsx
```

## Configuracao de API

O projeto usa integracao com API externa no arquivo `src/services/api.js`.

```js
const api = axios.create({
	baseURL: 'https://SEU_BACKEND_RENDER_URL',
})
```

Atualize a URL para o backend publicado no Render.

## Rodando localmente

1. Instale dependencias:

```bash
npm install
```

2. Execute o projeto:

```bash
npm run dev
```

3. Acesse no navegador:

```
http://localhost:5173
```

## Build de producao

```bash
npm run build
npm run preview
```

## Deploy na Vercel

1. Suba este projeto para um repositorio Git.
2. Acesse Vercel e clique em "Add New Project".
3. Importe o repositorio.
4. Configure:
	 - Framework Preset: `Vite`
	 - Build Command: `npm run build`
	 - Output Directory: `dist`
5. Deploy.

Depois do deploy do backend no Render, ajuste a `baseURL` em `src/services/api.js` e redeploy na Vercel.
