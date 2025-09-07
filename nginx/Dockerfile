FROM nginx:1.27-alpine

# чистимо дефолтну конфігурацію
RUN rm /etc/nginx/conf.d/default.conf

# додаємо свою
COPY nginx.conf /etc/nginx/nginx.conf

# фронтенд буде підключений через volume (frontend_build:/usr/share/nginx/html)
