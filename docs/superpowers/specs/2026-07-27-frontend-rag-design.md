# Frontend RAG Design

## Objetivo

Construir o frontend web em `app-langflow.cledson.com.br` para que uma pessoa crie conta, organize projetos, escolha o modelo de cada conversa e use o chat conectado ao RAG do Langflow.

## Escopo da primeira versão

- Cadastro, login e logout.
- Sessão persistida em cookie `httpOnly`, `Secure` e `SameSite=Lax`.
- Lista e criação de projetos.
- Lista e criação de conversas por projeto.
- Seletor de modelo permitido ao criar uma conversa.
- Chat com histórico de mensagens e exibição de fonte/uso retornados pelo RAG.
- Estados de carregamento, vazio, erro e envio pendente.

Não inclui compartilhamento de projetos, upload de arquivos, administração de usuários ou ferramentas externas nesta etapa.

## Arquitetura

O browser conversa apenas com o mesmo domínio do Next.js. Route Handlers internos funcionam como BFF: recebem o cookie de sessão, chamam `https://api-langflow.cledson.com.br` com `Authorization: Bearer <JWT>` e devolvem dados validados ao cliente. O JWT nunca é exposto a JavaScript do navegador nem guardado em `localStorage`.

```text
Browser → Next.js App Router/BFF → API backend → Postgres + Langflow + Qdrant
           cookie httpOnly       Authorization Bearer JWT
```

O frontend usará Server Components para layouts e páginas sem interação. Componentes cliente serão limitados aos formulários, seleção de conversa/modelo e envio de mensagens. Ant Design fornecerá os componentes de aplicação (formulários, layout, menu, lista, feedback e modal), com tokens e CSS global mínimos.

## Rotas

### Públicas

- `/`: redireciona para `/projects` quando há sessão; caso contrário, para `/login`.
- `/login`: formulário de autenticação.
- `/register`: formulário de cadastro.

### Protegidas

- `/projects`: lista de projetos e ação de criar projeto.
- `/projects/[projectId]`: seleciona a primeira conversa disponível ou mostra estado vazio.
- `/projects/[projectId]/conversations/[conversationId]`: chat, histórico, fontes e criação de conversa.

O layout protegido valida a sessão no servidor e redireciona usuários sem sessão para `/login`.

## Contrato BFF

Os Route Handlers internos normalizam o backend existente:

- `POST /api/auth/register` → `POST /auth/register`; salva o JWT em cookie e devolve usuário público.
- `POST /api/auth/login` → `POST /auth/login`; salva o JWT em cookie e devolve usuário público.
- `POST /api/auth/logout` → remove o cookie.
- `GET /api/auth/me` → `GET /me`.
- `GET|POST /api/projects` → `GET|POST /projects`.
- `GET|POST /api/projects/[projectId]/conversations` → conversa do projeto.
- `GET|POST /api/projects/[projectId]/conversations/[conversationId]/messages` → histórico ou envio ao chat RAG.

O cliente BFF usa timeout, trata respostas não JSON e transforma erros desconhecidos em mensagens seguras. Dados externos são validados com Zod antes de seguirem para os componentes.

## Estado e experiência

O estado de sessão é obtido no servidor. Cada formulário controla apenas seus próprios valores, erro e pendência. A página de chat carrega o histórico pelo BFF e mantém a mensagem digitada localmente; após envio, atualiza a lista com a mensagem do usuário e a resposta persistida. Não haverá store global nesta primeira versão.

Modelos inicialmente disponíveis: `openai/gpt-4.1-mini`. A lista será centralizada em uma configuração pública versionada para poder acompanhar a allowlist do backend sem espalhar strings pela UI.

## Estrutura de arquivos

```text
src/
  app/
    (auth)/login/
    (auth)/register/
    (protected)/projects/
    api/
  components/layout/
  components/ui/
  config/
  lib/
  services/
  types/
```

Componentes específicos de projetos e chat ficarão próximos às respectivas rotas. O cliente HTTP e as validações comuns ficam em `services/` e `types/`.

## Configuração e deploy

Variáveis:

- `API_BASE_URL=https://api-langflow.cledson.com.br` (somente servidor).
- `NEXT_PUBLIC_APP_URL=https://app-langflow.cledson.com.br`.
- `SESSION_COOKIE_NAME=langflow_rag_session`.

O deploy seguirá o padrão do backend: Docker, imagem no GHCR, GitHub Actions, Nginx no VPS e Certbot. O serviço será exposto apenas em loopback e o Nginx publicará `app-langflow.cledson.com.br` com HTTPS.

## Qualidade

- TypeScript estrito, sem `any` e sem token no cliente.
- Testes unitários para validação, cliente BFF e cookie de sessão.
- Testes de componentes para login, criação de projeto e envio de mensagem.
- Playwright para o fluxo login → projeto → conversa → envio ao chat, usando uma API de teste simulada.
- `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` no CI.

## Critérios de aceite

1. Um novo usuário consegue cadastrar-se e entrar sem ver ou armazenar o JWT no JavaScript do browser.
2. Um usuário autenticado consegue criar e selecionar projetos.
3. Em um projeto, consegue criar uma conversa escolhendo um modelo permitido.
4. Uma mensagem enviada exibe a resposta do RAG e sua fonte quando disponível.
5. Usuários sem sessão não acessam rotas protegidas.
6. O domínio HTTPS, healthcheck e pipeline de deploy ficam operacionais.
