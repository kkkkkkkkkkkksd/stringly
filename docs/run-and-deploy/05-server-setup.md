# Настройка сервера (разовая) — nginx + самоподписанный HTTPS по IP

Нужно один раз для серверных конфигураций ([3 — демо дев](./03-demo-dev-mock.md) и
[4 — демо прод](./04-demo-prod-real.md)). Раздаём статичную сборку фронта через nginx на
арендованном сервере `144.31.235.244`. MSW работает через Service Worker → нужен HTTPS,
поэтому используем самоподписанный сертификат (браузер один раз покажет предупреждение).

Рабочие файлы лежат в `deploy/` (в корне репозитория): `deploy/nginx-stringly.conf` (конфиг
nginx) и `deploy/deploy.sh` (скрипт деплоя). Предполагается Ubuntu/Debian на сервере; на твоей
машине нужны `npm`, `ssh`, `rsync`. Подключение к серверу — вручную (`ssh root@144.31.235.244`).

## Шаг 1 — настройка сервера

Зайди на сервер и выполни:

```bash
ssh root@144.31.235.244

# 1. nginx
apt update && apt install -y nginx

# 2. Папка под сайт
mkdir -p /var/www/stringly

# 3. Самоподписанный сертификат на IP (валиден ~2 года)
mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 825 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/stringly.key \
  -out    /etc/nginx/ssl/stringly.crt \
  -subj   "/CN=144.31.235.244" \
  -addext "subjectAltName=IP:144.31.235.244"

# 4. Firewall — открыть 80 и 8443 (если используется ufw)
#    Демо раздаётся на 8443, т.к. 443 на этом сервере занят VPN-сервисом (xray).
ufw allow 80 && ufw allow 8443 || true
```

## Шаг 2 — установить конфиг nginx

С твоей машины, из корня проекта, загрузи конфиг:

```bash
scp deploy/nginx-stringly.conf root@144.31.235.244:/etc/nginx/sites-available/stringly
```

Активируй его на сервере:

```bash
ssh root@144.31.235.244
ln -sf /etc/nginx/sites-available/stringly /etc/nginx/sites-enabled/stringly
rm -f /etc/nginx/sites-enabled/default      # убрать дефолтную заглушку nginx
nginx -t && systemctl reload nginx
```

После этого можно деплоить (см. [конфиг 3](./03-demo-dev-mock.md) или
[конфиг 4](./04-demo-prod-real.md)).

## Когда появится домен (чистый HTTPS без предупреждений)

1. Направь A-запись домена на `144.31.235.244`.
2. В `deploy/nginx-stringly.conf` замени `server_name` на домен (и перезалей конфиг).
3. На сервере: `apt install -y certbot python3-certbot-nginx && certbot --nginx -d ваш-домен` —
   certbot пропишет Let's Encrypt-сертификат и автопродление. Самоподписанный больше не нужен.

## Когда появится Kotlin-бэк (для конфигурации 4)

1. Запусти бэк на сервере (например, `127.0.0.1:8080`), лучше под systemd/Docker.
2. В `deploy/nginx-stringly.conf` раскомментируй блок `location /api/v1/ { proxy_pass ... }`
   и перезагрузи nginx (`nginx -t && systemctl reload nginx`).
3. Деплой реальной сборки: `./deploy/deploy.sh real` (см. [конфиг 4](./04-demo-prod-real.md)).
