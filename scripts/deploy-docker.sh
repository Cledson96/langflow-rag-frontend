#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_PATH:?}" "${FRONTEND_IMAGE:?}" "${APP_PORT:=3020}"

cd "$DEPLOY_PATH"

if [ -f .deploy-secrets ]; then
  set -a
  . ./.deploy-secrets
  set +a
fi

if [ -n "${GHCR_TOKEN:-}" ]; then
  printf '%s' "$GHCR_TOKEN" | docker login ghcr.io --username "${GHCR_USERNAME:?GHCR_USERNAME obrigatório quando GHCR_TOKEN estiver definido}" --password-stdin
fi

docker compose --env-file .env pull
docker compose --env-file .env up -d --remove-orphans

for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error "http://127.0.0.1:${APP_PORT}/api/health" >/dev/null; then
    break
  fi
  sleep 1
done

curl --fail --silent --show-error "http://127.0.0.1:${APP_PORT}/api/health" >/dev/null

sed "s|__APP_PORT__|${APP_PORT}|g" deploy/nginx/app-langflow.cledson.com.br.conf.template > /etc/nginx/sites-available/app-langflow.cledson.com.br.conf
ln -sf /etc/nginx/sites-available/app-langflow.cledson.com.br.conf /etc/nginx/sites-enabled/app-langflow.cledson.com.br.conf
nginx -t && systemctl reload nginx

if [ "${ENABLE_CERTBOT:-true}" = 'true' ]; then
  certbot_args=(--nginx --non-interactive --agree-tos --keep-until-expiring -d app-langflow.cledson.com.br)
  if [ -n "${CERTBOT_EMAIL:-}" ]; then
    certbot_args+=(-m "$CERTBOT_EMAIL")
  else
    certbot_args+=(--register-unsafely-without-email)
  fi
  certbot "${certbot_args[@]}"
fi
