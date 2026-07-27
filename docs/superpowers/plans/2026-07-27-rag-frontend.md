# RAG Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar o frontend Next.js do chat RAG em `app-langflow.cledson.com.br`, com sessão segura, projetos, conversas e mensagens.

**Architecture:** O Next.js App Router atuará como BFF. O browser recebe apenas um cookie `httpOnly`; Route Handlers leem o cookie no servidor e chamam a API com bearer token. Componentes de servidor compõem páginas e componentes cliente ficam limitados a formulários e chat.

**Tech Stack:** Next.js App Router, TypeScript estrito, Ant Design, Zod, Vitest, Testing Library, Playwright, Docker, Nginx e GitHub Actions.

## Global Constraints

- Use `create-next-app` com App Router, TypeScript, Tailwind, ESLint, `src/` e alias `@/*`.
- Use `antd` e `@ant-design/nextjs-registry`; não adicione outro kit visual ou store global.
- Guarde o JWT apenas em `langflow_rag_session`, `httpOnly`, `secure`, `sameSite: 'lax'` e `path: '/'`.
- `API_BASE_URL` nunca pode alcançar o bundle do browser; `NEXT_PUBLIC_APP_URL` é a única URL pública.
- Valide entrada e respostas externas com Zod; não use `any` nem casts para silenciar TypeScript.
- Rotas privadas são dinâmicas e não usam cache compartilhado.
- Finalize com `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:e2e` e `npm run build`.

---

## Estrutura prevista

```text
src/
  app/(auth)/{login,register}/
  app/(protected)/projects/[projectId]/conversations/[conversationId]/
  app/api/auth/{login,register,logout,me}/route.ts
  app/api/projects/[projectId]/conversations/[conversationId]/messages/route.ts
  components/layout/
  config/env.ts
  lib/session.ts
  services/backend-client.ts
  types/{api,schemas}.ts
tests/{unit,components,e2e}/
```

### Task 1: Bootstrap, Ant Design SSR e ferramentas

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `src/app/{layout,page,globals}.tsx`, `.env.example`
- Create: `vitest.config.ts`, `tests/setup.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`
- Test: `tests/unit/app.test.tsx`

**Produces:** scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test` e `test:e2e`; layout raiz com `AntdRegistry`.

- [ ] **Step 1: Inicializar dependências**

```bash
npx create-next-app@latest /tmp/langflow-rag-frontend-scaffold --ts --eslint --tailwind --app --src-dir --import-alias '@/*' --use-npm --yes
rsync -a --exclude='.git' --exclude='docs' /tmp/langflow-rag-frontend-scaffold/ ./
npm install antd @ant-design/nextjs-registry zod
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event playwright
```

O scaffold temporário evita que `create-next-app` altere ou recuse os documentos de arquitetura já presentes no repositório. Removê-lo após a cópia é opcional e só pode ocorrer depois de conferir seu caminho exato.

- [ ] **Step 2: Escrever teste em falha**

Create `tests/unit/app.test.tsx`:

```tsx
it('renders Langflow RAG', () => {
  render(<Home />);
  expect(screen.getByRole('heading', { name: 'Langflow RAG' })).toBeVisible();
});
```

- [ ] **Step 3: Confirmar falha**

Run: `npm test -- tests/unit/app.test.tsx`

Expected: falha por ausência de configuração ou página compatível.

- [ ] **Step 4: Implementar mínimo**

Configurar Vitest com `jsdom`, importar `@testing-library/jest-dom` em `tests/setup.ts`, configurar Playwright e adicionar `<AntdRegistry>` no layout. A página raiz renderiza o `h1` testado.

- [ ] **Step 5: Verificar e commit**

Run: `npm test -- tests/unit/app.test.tsx && npm run lint && npm run typecheck`

```bash
git add .
git commit -m "feat: bootstrap Next.js frontend"
```

### Task 2: Configuração, schemas e cliente do backend

**Files:**
- Create: `src/config/env.ts`, `src/types/api.ts`, `src/types/schemas.ts`, `src/services/backend-client.ts`
- Test: `tests/unit/env.test.ts`, `tests/unit/backend-client.test.ts`

**Consumes:** `API_BASE_URL`, `NEXT_PUBLIC_APP_URL`, `SESSION_COOKIE_NAME`.

**Produces:** `parseEnv`, `createBackendClient`, `User`, `Project`, `Conversation`, `Message` e `BackendApiError`.

- [ ] **Step 1: Escrever testes em falha**

Testar `parseEnv` com URL inválida e válida. Mockar `fetch` e confirmar que `getProjects(token)` envia `Authorization: Bearer <token>`, valida o array `{ id, name, slug }` e rejeita JSON inválido.

- [ ] **Step 2: Confirmar falha**

Run: `npm test -- tests/unit/env.test.ts tests/unit/backend-client.test.ts`

Expected: falha porque os exports não existem.

- [ ] **Step 3: Implementar limite de IO**

`createBackendClient(fetcher)` usa `AbortSignal.timeout(30_000)`, `accept: application/json`, schemas Zod e converte respostas não 2xx ou não JSON em `BackendApiError`, sem logar token.

- [ ] **Step 4: Verificar e commit**

Run: `npm test -- tests/unit/env.test.ts tests/unit/backend-client.test.ts`

```bash
git add src/config src/types src/services tests/unit .env.example
git commit -m "feat: add typed backend client"
```

### Task 3: BFF de sessão e autenticação

**Files:**
- Create: `src/lib/session.ts`, `src/app/api/auth/{login,register,logout,me}/route.ts`
- Test: `tests/unit/session.test.ts`, `tests/unit/auth-routes.test.ts`

**Consumes:** `createBackendClient`, `env.sessionCookieName`.

**Produces:** `readSessionToken`, `setSessionCookie`, `clearSessionCookie` e handlers de auth.

- [ ] **Step 1: Escrever testes em falha**

Testar login BFF simulado: JSON contém apenas `{ user }`, enquanto `Set-Cookie` contém `HttpOnly`, `Secure`, `SameSite=Lax` e `Path=/`. Testar logout limpando o mesmo cookie e login inválido com 401 seguro.

- [ ] **Step 2: Confirmar falha**

Run: `npm test -- tests/unit/session.test.ts tests/unit/auth-routes.test.ts`

Expected: falha pois os helpers e handlers não existem.

- [ ] **Step 3: Implementar**

Validar body com Zod, chamar `/auth/register`, `/auth/login` e `/me` pelo cliente servidor, definir/remover cookie somente no Route Handler e retornar mensagens seguras em português.

- [ ] **Step 4: Verificar e commit**

Run: `npm test -- tests/unit/session.test.ts tests/unit/auth-routes.test.ts`

```bash
git add src/lib src/app/api/auth tests/unit
git commit -m "feat: add secure BFF authentication"
```

### Task 4: Layout protegido e páginas de login/cadastro

**Files:**
- Create: `src/app/(auth)/layout.tsx`, `src/app/(auth)/login/{page,login-form}.tsx`, `src/app/(auth)/register/{page,register-form}.tsx`
- Create: `src/app/(protected)/layout.tsx`, `src/components/layout/app-shell.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/components/login-form.test.tsx`, `tests/components/register-form.test.tsx`

**Consumes:** BFF auth e `readSessionToken`.

**Produces:** formulário acessível de login/cadastro e `redirect('/login')` para sessão inexistente.

- [ ] **Step 1: Escrever testes em falha**

Testar erro para e-mail/senha inválidos, submit JSON de `/api/auth/login`, navegação para `/projects` no sucesso e senha de cadastro com mínimo 12 caracteres.

- [ ] **Step 2: Confirmar falha**

Run: `npm test -- tests/components/login-form.test.tsx tests/components/register-form.test.tsx`

Expected: falha por componentes ausentes.

- [ ] **Step 3: Implementar**

Usar `Form`, `Input`, `Button`, `Alert` e `Card` do Ant Design. O layout protegido consulta sessão no servidor, e a raiz encaminha para `/projects` ou `/login`.

- [ ] **Step 4: Verificar e commit**

Run: `npm test -- tests/components/login-form.test.tsx tests/components/register-form.test.tsx`

```bash
git add 'src/app/(auth)' 'src/app/(protected)' src/components src/app/page.tsx tests/components
git commit -m "feat: add authenticated application shell"
```

### Task 5: Projetos e conversas configuráveis

**Files:**
- Create: `src/app/api/projects/route.ts`, `src/app/api/projects/[projectId]/conversations/route.ts`
- Create: `src/app/(protected)/projects/{page,projects-client}.tsx`, `src/app/(protected)/projects/components/create-project-modal.tsx`
- Create: `src/app/(protected)/projects/[projectId]/page.tsx`, `src/components/layout/project-sidebar.tsx`
- Test: `tests/unit/project-routes.test.ts`, `tests/components/projects-client.test.tsx`

**Produces:** projetos, sidebar e criação de conversa com `openai/gpt-4.1-mini`.

- [ ] **Step 1: Escrever testes em falha**

Cobrir 401 sem cookie, validação de `name`/`slug`, estado vazio de projetos, abertura do modal e renderização do projeto retornado.

- [ ] **Step 2: Confirmar falha**

Run: `npm test -- tests/unit/project-routes.test.ts tests/components/projects-client.test.tsx`

Expected: falha por routes e componentes ausentes.

- [ ] **Step 3: Implementar**

Validar `projectId`/`conversationId` como UUID antes da URL externa. O modal envia `{ title, modelId }`; após criar, navega para `/projects/{projectId}/conversations/{conversationId}`.

- [ ] **Step 4: Verificar e commit**

Run: `npm test -- tests/unit/project-routes.test.ts tests/components/projects-client.test.tsx`

```bash
git add src/app/api/projects 'src/app/(protected)/projects' src/components tests
git commit -m "feat: add projects and conversations"
```

### Task 6: Chat RAG, fontes e uso

**Files:**
- Create: `src/app/api/projects/[projectId]/conversations/[conversationId]/messages/route.ts`
- Create: `src/app/(protected)/projects/[projectId]/conversations/[conversationId]/{page,chat-client}.tsx`
- Create: `src/app/(protected)/projects/[projectId]/conversations/[conversationId]/components/{message-list,message-composer,message-sources}.tsx`
- Test: `tests/unit/message-route.test.ts`, `tests/components/chat-client.test.tsx`

**Consumes:** `Message.metadata.source`, `Message.metadata.usage`, `getMessages`, `sendMessage`.

**Produces:** histórico, envio pendente e fonte/uso abaixo da resposta.

- [ ] **Step 1: Escrever testes em falha**

Cobrir rejeição de conteúdo vazio, encaminhamento de `{ content }` com bearer token, resposta com `userMessage`/`assistantMessage`, botão desabilitado durante envio e visualização de `source.displayName`.

- [ ] **Step 2: Confirmar falha**

Run: `npm test -- tests/unit/message-route.test.ts tests/components/chat-client.test.tsx`

Expected: falha por handler e componentes ausentes.

- [ ] **Step 3: Implementar**

Renderizar mensagens em ordem cronológica. `Input.TextArea` envia pelo BFF e atualiza estado apenas com a resposta persistida. `MessageSources` não renderiza espaço se não existir fonte/uso.

- [ ] **Step 4: Verificar e commit**

Run: `npm test -- tests/unit/message-route.test.ts tests/components/chat-client.test.tsx`

```bash
git add src/app/api/projects 'src/app/(protected)/projects' tests
git commit -m "feat: add RAG chat interface"
```

### Task 7: Estados de produto, SEO e acessibilidade

**Files:**
- Create: `src/app/(protected)/loading.tsx`, `src/app/(protected)/error.tsx`, `src/app/(protected)/projects/[projectId]/conversations/[conversationId]/loading.tsx`
- Create: `src/app/{robots,sitemap}.ts`, `src/lib/metadata.ts`
- Modify: `src/app/{layout,globals}.tsx`
- Test: `tests/components/accessibility.test.tsx`

**Produces:** skeletons, erro recuperável, metadados, sitemap e robots.

- [ ] **Step 1: Escrever teste em falha**

Renderizar login e chat com fixtures; verificar labels dos campos, botão de envio com nome acessível e título da página.

- [ ] **Step 2: Confirmar falha**

Run: `npm test -- tests/components/accessibility.test.tsx`

Expected: falha enquanto a estrutura acessível não existe.

- [ ] **Step 3: Implementar**

Definir `metadataBase`, título, descrição e Open Graph. `robots.ts` permite apenas páginas públicas e layouts protegidos usam `robots: { index: false, follow: false }`.

- [ ] **Step 4: Verificar e commit**

Run: `npm test -- tests/components/accessibility.test.tsx && npm run build`

```bash
git add src/app src/lib tests/components
git commit -m "feat: add product states and metadata"
```

### Task 8: Docker, CI/CD, domínio e healthcheck

**Files:**
- Create: `src/app/api/health/route.ts`, `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `scripts/deploy-docker.sh`
- Create: `deploy/nginx/app-langflow.cledson.com.br.conf.template`, `.github/workflows/deploy.yml`, `docs/operations.md`, `.env.production.example`
- Modify: `.github/workflows/ci.yml`
- Test: `tests/unit/health-route.test.ts`

**Consumes:** GitHub environment `production`: `VPS_HOST`, `VPS_PORT`, `VPS_USER`, `VPS_SSH_KEY`, `GHCR_PULL_TOKEN` e `CERTBOT_EMAIL` opcional. O host recebe `API_BASE_URL=https://api-langflow.cledson.com.br`, `NEXT_PUBLIC_APP_URL=https://app-langflow.cledson.com.br` e `SESSION_COOKIE_NAME=langflow_rag_session` em arquivo de ambiente local, sem expor o JWT ou as variáveis de servidor ao browser.

**Produces:** healthcheck `/api/health`, imagem GHCR e deploy em `/opt/langflow-rag-frontend` com Nginx e HTTPS.

- [ ] **Step 1: Escrever teste em falha**

Testar `GET /api/health` esperando status 200 e `{ status: 'ok' }`.

- [ ] **Step 2: Confirmar falha**

Run: `npm test -- tests/unit/health-route.test.ts`

Expected: falha por route ausente.

- [ ] **Step 3: Implementar deploy**

Docker multi-stage Node 22 executa `next start`; compose expõe somente `127.0.0.1:${APP_PORT}:3000`; deploy aguarda até 30 segundos por healthcheck, aplica Nginx e Certbot. CI executa lint, tipos, testes e build antes do push de imagem.

- [ ] **Step 4: Verificar e commit**

Run: `npm test -- tests/unit/health-route.test.ts && npm run build && docker build -t langflow-rag-frontend:smoke .`

```bash
git add Dockerfile .dockerignore docker-compose.yml scripts deploy .github docs src/app/api/health tests
git commit -m "feat: add frontend production deployment"
```

### Task 9: E2E, documentação e aceite

**Files:**
- Create: `tests/e2e/rag-chat.spec.ts`
- Modify: `README.md`, `docs/operations.md`, `playwright.config.ts`

**Produces:** cenário Playwright cadastro → projeto → conversa → mensagem → fonte, sem credenciais de produção.

- [ ] **Step 1: Escrever cenário em falha**

O cenário cria conta, projeto, conversa com `openai/gpt-4.1-mini`, envia “O que é RAG?” e espera a fonte `README.md`.

- [ ] **Step 2: Confirmar falha**

Run: `npm run test:e2e -- tests/e2e/rag-chat.spec.ts`

Expected: falha enquanto o servidor e as respostas BFF simuladas não estiverem configurados.

- [ ] **Step 3: Configurar interceptações locais**

Configurar `webServer` do Playwright e `page.route('**/api/**')` com contratos válidos. O teste não acessa a API de produção.

- [ ] **Step 4: Executar matriz final e commit**

Run: `npm run lint && npm run typecheck && npm test && npm run test:e2e && npm run build`

```bash
git add README.md docs tests/e2e playwright.config.ts
git commit -m "test: cover frontend RAG journey"
```

## Revisão do plano

- Cobertura: bootstrap, BFF seguro, autenticação, projetos, conversas, chat, fontes, acessibilidade, SEO, testes e deploy possuem tarefas.
- Consistência: todas as chamadas usam `createBackendClient`; toda sessão usa `langflow_rag_session`.
- Escopo preservado: upload, ferramentas externas, membros de projeto e administração continuam fora da primeira versão.
