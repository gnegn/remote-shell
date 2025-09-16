#!/bin/bash
set -e

#DOMAIN="remoteshellsoftcom.duckdns.org"
#EMAIL="gnegenngne@gmail.com"
#WEBROOT="/var/www/certbot"

# Перевіряємо, чи сертифікат існує
#if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
#  echo "Сертифікат не знайдено. Генеруємо новий..."
#  certbot certonly --webroot -w $WEBROOT \
#    --email $EMAIL --agree-tos --no-eff-email \
#    -d $DOMAIN -d www.$DOMAIN
#fi

# Запускаємо Nginx в foreground
nginx -g "daemon off;"
