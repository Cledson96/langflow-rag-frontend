# Task 6 — Chat RAG, fontes e uso

## Entregue

- BFF `GET` e `POST` para mensagens com sessão Bearer, validação de UUID de projeto/conversa e conteúdo não vazio.
- Página de conversa no servidor que carrega o histórico autenticado.
- Cliente de chat com histórico cronológico, estado pendente, sem atualização otimista e inclusão somente das mensagens persistidas devolvidas pelo BFF.
- Componentes Ant Design para lista, compositor e metadados de fonte/uso. A fonte utiliza apenas `metadata.source.displayName`; sem fonte e sem uso, o componente não renderiza conteúdo.

## TDD e validação

- RED observado: `npm test -- tests/unit/message-route.test.ts tests/components/chat-client.test.tsx` falhou inicialmente porque o handler e o cliente ainda não existiam.
- GREEN: o mesmo comando passou com 7 testes, cobrindo conteúdo vazio, UUIDs, Bearer no `GET`/`POST`, payload/resposta persistida, ordem do histórico, pendência, `source.displayName` e preservação do rascunho em erro para retry.
- `npm run typecheck` passou.
- `npm run lint` passou.
- `npm run build` passou; o build lista a rota BFF e a página de conversa como dinâmicas.

## Observações

- A execução ampla de testes existentes emite avisos prévios do jsdom (`getComputedStyle` com pseudo-elementos) e avisos de depreciação do `List` do Ant Design. Eles não ocorreram na verificação focada desta tarefa e não impedem typecheck, lint ou build.
- Correção posterior: o compositor agora só limpa seu conteúdo após a confirmação de persistência; quando o BFF falha, o conteúdo digitado permanece disponível para uma nova tentativa.
