# Operação

## Secrets GitHub (environment `production`)

Configure `VPS_HOST`, `VPS_PORT`, `VPS_USER`, `VPS_SSH_KEY` e `GHCR_PULL_TOKEN`. `CERTBOT_EMAIL` é opcional, mas recomendado para receber avisos sobre renovação do certificado.

`GHCR_PULL_TOKEN` precisa da permissão `read:packages` para que o VPS consiga baixar uma imagem privada do GHCR. Se a imagem for pública, ele não é necessário.

## Ambiente no VPS

O deploy cria `/opt/langflow-rag-frontend/.env.production` com:

- `API_BASE_URL=https://api-langflow.cledson.com.br`
- `NEXT_PUBLIC_APP_URL=https://app-langflow.cledson.com.br`
- `SESSION_COOKIE_NAME=langflow_rag_session`

Não coloque JWT, credenciais de backend ou qualquer segredo em variáveis `NEXT_PUBLIC_*`: elas podem ser incluídas no JavaScript enviado ao navegador. O arquivo `.env.production` fica no VPS e não é versionado.

## Rede e HTTPS

O container publica somente `127.0.0.1:3020`; Nginx é o único serviço exposto externamente. Antes do primeiro deploy, faça o DNS de `app-langflow.cledson.com.br` apontar para o VPS e garanta que as portas 80 e 443 estejam abertas. O script valida a configuração Nginx e solicita/renova HTTPS via Certbot.

## Verificação e rollback

Após o deploy, valide `https://app-langflow.cledson.com.br/api/health`. O script aguarda até 30 segundos por esse endpoint antes de publicar Nginx. Para rollback, reexecute o workflow com uma imagem GHCR conhecida, atualizando `FRONTEND_IMAGE` em `/opt/langflow-rag-frontend/.env`, e execute `scripts/deploy-docker.sh` no VPS com os mesmos valores de `DEPLOY_PATH` e `APP_PORT`.
