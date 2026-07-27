# Langflow RAG Frontend

Interface web para criar projetos, iniciar conversas e consultar documentos com RAG. O navegador fala apenas com os endpoints BFF em `/api`; a URL do backend e o cookie de sessão permanecem no servidor.

## Desenvolvimento local

Copie `.env.example` para `.env.local` e preencha as variáveis com valores do ambiente de desenvolvimento. Não exponha tokens, chaves de backend ou credenciais em variáveis `NEXT_PUBLIC_*`.

```bash
npm install
npm run dev
```

## Qualidade

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

O cenário Playwright `tests/e2e/rag-chat.spec.ts` executa cadastro, projeto, conversa com `openai/gpt-4.1-mini`, mensagem e fonte `README.md`. Ele inicia um backend efêmero em loopback e intercepta os endpoints BFF no navegador; não usa credenciais nem a API de produção. Na primeira execução, instale o navegador de teste com `npx playwright install chromium`.
