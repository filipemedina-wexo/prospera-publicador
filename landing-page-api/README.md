# API de Publicação de Landing Pages

Este é um backend em Node.js + Express projetado para receber uploads de Landing Pages (arquivos `.zip`) e servi-las dinamicamente baseada em subdomínios.

## Pré-requisitos

- Node.js 18+
- NPM ou Yarn

## Instalação

1. Acesse a pasta do projeto:
   ```bash
   cd landing-page-api
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```

## Configuração (.env)

O sistema usa variáveis de ambiente para configuração. Crie um arquivo `.env` na raiz se desejar alterar os padrões (opcional):

```env
PORT=4000
SITES_BASE=/caminho/para/pasta/de/sites
```

- `PORT`: Porta onde o servidor vai rodar (Padrão: 4000).
- `SITES_BASE`: Pasta onde os sites descompactados serão armazenados. Padrão: pasta `sites` dentro do projeto.

## Como Rodar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## Endpoints

### Publicar Landing Page

**POST** `/publish`

- **Tipo**: `multipart/form-data`
- **Parâmetros**:
  - `subdomain` (texto): O subdomínio desejado (ex: `padaria-joao`). Apenas letras minúsculas, números e hífens.
  - `file` (arquivo): O arquivo `.zip` contendo os arquivos estáticos da página (`index.html`, css, js, etc).

**Exemplo de Resposta (Sucesso):**
```json
{
  "success": true,
  "url": "https://padaria-joao.useprospera.com.br",
  "message": "LP publicada com sucesso."
}
```

## Como funciona o servimento de sites

A API possui um middleware que verifica o **Host Header** da requisição.
Se o host for `padaria-joao.useprospera.com.br` (exemplo), o sistema buscará na pasta `sites/padaria-joao` e servirá o conteúdo estático.

**Nota para Reverse Proxy (Nginx/Caddy/EasyPanel):**
Configure seu proxy para encaminhar todo o tráfego `*.useprospera.com.br` para esta aplicação Node.js. A aplicação decidirá qual pasta servir baseada no subdomínio recebido.
