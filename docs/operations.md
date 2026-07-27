# Operação

## Secrets GitHub (environment `production`)

Configure `VPS_HOST`, `VPS_PORT`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_SSH_KNOWN_HOSTS` e `GHCR_PULL_TOKEN`. `CERTBOT_EMAIL` é opcional, mas recomendado para receber avisos sobre renovação do certificado.

`VPS_SSH_KNOWN_HOSTS` deve conter a linha exata do `known_hosts` do VPS (incluindo `[host]:porta` quando a porta não for 22). Obtenha-a do provisionador e confirme a impressão digital SHA256 por um canal independente antes de cadastrá-la. O workflow rejeita o deploy quando esse secret não existe e nunca aprende a chave do servidor durante a conexão.

`GHCR_PULL_TOKEN` precisa da permissão `read:packages` para que o VPS consiga baixar uma imagem privada do GHCR. Se a imagem for pública, ele não é necessário.

## Ambiente no VPS

O deploy cria `/opt/langflow-rag-frontend/.env.production` com:

- `API_BASE_URL=https://api-langflow.cledson.com.br`
- `NEXT_PUBLIC_APP_URL=https://app-langflow.cledson.com.br`
- `SESSION_COOKIE_NAME=langflow_rag_session`

Não coloque JWT, credenciais de backend ou qualquer segredo em variáveis `NEXT_PUBLIC_*`: elas podem ser incluídas no JavaScript enviado ao navegador. O arquivo `.env.production` fica no VPS e não é versionado.

## Rede e HTTPS

O container publica somente `127.0.0.1:3020`; Nginx é o único serviço exposto externamente. Antes do primeiro deploy, faça o DNS de `app-langflow.cledson.com.br` apontar para o VPS e garanta que as portas 80 e 443 estejam abertas. O script valida a configuração Nginx e solicita/renova HTTPS via Certbot; `--keep-until-expiring` torna os redeploys idempotentes e evita reemitir certificados válidos.

## Verificação e rollback

Após o deploy, valide `https://app-langflow.cledson.com.br/api/health`. O script aguarda até 30 segundos por esse endpoint antes de publicar Nginx. Para rollback, execute manualmente o workflow `Deploy` e preencha `image_tag` com uma tag GHCR já publicada (por exemplo, o SHA curto ou completo do commit desejado). Com `image_tag` preenchida, o workflow não constrói nem publica uma imagem: ele publica exatamente a tag selecionada no VPS.
