#!/usr/bin/env bash
# Деплой Stringly на сервер. Запуск с твоей машины (НЕ на сервере), из корня проекта.
#
#   ./deploy/deploy.sh mock   # конфигурация 3 — ДЕМО ДЕВ (моки в браузере, бэк не нужен)
#   ./deploy/deploy.sh real   # конфигурация 4 — ДЕМО ПРОД (фронт ходит на бэк через nginx)
#
# По умолчанию (без аргумента) — mock.
set -euo pipefail

SERVER="root@144.31.235.244"
REMOTE_DIR="/var/www/stringly"
MODE="${1:-mock}"

case "$MODE" in
  mock)
    echo "→ Сборка ДЕМО ДЕВ (mock)…"
    npm run build:demo-mock
    ;;
  real)
    echo "→ Сборка ДЕМО ПРОД (real, фронт ждёт бэк на /api/v1)…"
    npm run build:demo-real
    ;;
  *)
    echo "Неизвестный режим: '$MODE'. Используй: mock | real" >&2
    exit 1
    ;;
esac

echo "→ Загрузка dist/ на сервер ($SERVER:$REMOTE_DIR)…"
# --delete: удаляет на сервере файлы, которых больше нет в dist (чистый деплой).
rsync -avz --delete dist/ "$SERVER:$REMOTE_DIR/"

echo "→ Проверка конфига и перезагрузка nginx…"
ssh "$SERVER" 'nginx -t && systemctl reload nginx'

echo "✓ Готово: https://144.31.235.244.nip.io:8443 (первый раз подтверди предупреждение о сертификате)"
if [ "$MODE" = "real" ]; then
  echo "  ⚠ Режим real: убедись, что (1) Kotlin-бэк запущен на сервере (127.0.0.1:8080),"
  echo "    (2) в /etc/nginx/sites-available/stringly раскомментирован блок location /api/v1/."
fi
