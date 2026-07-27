# Task 7 — Estados de produto, SEO e acessibilidade

## Entregue

- Estados de carregamento Ant Design para a área protegida e para conversas,
  ambos anunciados a tecnologias assistivas.
- Boundary de erro recuperável na área protegida, com ação `Tentar novamente`.
- Metadados centralizados com `metadataBase` na URL pública, título com
  template, descrição e Open Graph em português.
- `robots.txt` permite somente `/login` e `/register`; sitemap publica apenas
  essas rotas, enquanto o layout protegido declara `noindex, nofollow`.
- Estilos globais receberam as cores base de fundo e texto do produto.

## TDD

1. O novo teste renderizou os componentes reais de login e chat com fixtures,
   confirmou labels e nome acessível do envio, e exigiu título SEO estruturado.
2. RED observado com `npm test -- tests/components/accessibility.test.tsx`:
   `metadata.title` era a string `Langflow RAG`, em vez de título padrão e
   template.
3. Após a implementação, a suíte focada aprovou 4 testes. Ela também cobre a
   exclusão de rotas protegidas de indexação, a ação de recuperação e os dois
   anúncios de carregamento.

## Verificação

- `npm test -- tests/components/accessibility.test.tsx` — 4 testes aprovados.
- `npm test` — 13 arquivos e 46 testes aprovados.
- `npm run lint` — aprovado.
- `npm run typecheck` — aprovado.
- `npm run build` — aprovado; gerou `/robots.txt` e `/sitemap.xml` estáticos.
- `git diff --check` — aprovado.

## Observações

- A suíte completa ainda imprime cinco avisos conhecidos do jsdom sobre
  `getComputedStyle` com pseudo-elementos do Ant Design; não causam falha.
