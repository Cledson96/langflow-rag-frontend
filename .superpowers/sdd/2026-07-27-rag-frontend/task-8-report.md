# Task 8 — Deploy de produção e healthcheck

## Entregue

- Rota `GET /api/health` que responde `200` com `{ "status": "ok" }`.
- Imagem multi-stage baseada em Node 22 que executa `next start` como usuário sem privilégios.
- Compose que publica a aplicação apenas em `127.0.0.1:3020` (configurável por `APP_PORT`) e faz healthcheck interno.
- Script idempotente de deploy que obtém a imagem GHCR, aguarda até 30 segundos pelo healthcheck, instala a configuração Nginx e provisiona HTTPS com Certbot.
- Template Nginx para `app-langflow.cledson.com.br`, workflow de CI/deploy com imagem GHCR e ambiente GitHub `production`, exemplo de ambiente e documentação operacional.

## TDD

1. `tests/unit/health-route.test.ts` foi criado antes da rota e confirmou o contrato de status e JSON.
2. RED observado com `npm test -- tests/unit/health-route.test.ts`: a importação de `@/app/api/health/route` falhou porque a rota ainda não existia.
3. Após a implementação mínima, o teste focado passou com 1 teste aprovado.

## Verificação

- `npm test -- tests/unit/health-route.test.ts` — 1 teste aprovado.
- `npm test -- --reporter=dot` — 15 arquivos e 49 testes aprovados.
- `npm run lint` — aprovado.
- `npm run typecheck` — aprovado.
- `npm run build` — aprovado.
- `APP_ENV_FILE=.env.production.example APP_PORT=3020 FRONTEND_IMAGE=langflow-rag-frontend:smoke docker compose config` — aprovado.
- `bash -n scripts/deploy-docker.sh` e `git diff --check` — aprovados.

## Observações

- A suíte completa mantém avisos preexistentes do Ant Design/jsdom (`getComputedStyle` com pseudo-elementos e atualizações fora de `act`), sem falhas.
- O smoke build Docker foi iniciado com `docker build -t langflow-rag-frontend:smoke .`, mas o executor local interrompeu o processo durante `next build` antes de produzir a imagem. O Dockerfile alcançou a compilação do Next; a conclusão do smoke build deve ser reexecutada em ambiente sem esse limite.
- O workflow não inclui JWT ou credenciais de backend no ambiente público. Apenas `NEXT_PUBLIC_APP_URL` é exposto ao navegador; os demais valores ficam no arquivo local do VPS.
