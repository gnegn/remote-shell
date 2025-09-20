#!/bin/sh

CERT_PATH="/etc/letsencrypt/live/remoteshellsoftcom.duckdns.org/fullchain.pem"

if [ ! -f "$CERT_PATH" ]; then
    echo "[INFO] SSL certificate not found. Using HTTP config..."
    cp /etc/nginx/nginx-http.conf /etc/nginx/conf.d/default.conf
else
    echo "[INFO] SSL certificate found. Using HTTPS config..."
    cp /etc/nginx/nginx-https.conf /etc/nginx/conf.d/default.conf
fi

nginx -t || exit 1

exec nginx -g 'daemon off;'
