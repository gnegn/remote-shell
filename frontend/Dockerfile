FROM node:18-alpine AS frontend

WORKDIR /app

# спочатку копіюємо тільки маніфести, щоб кешувався npm install
COPY package*.json ./

# якщо маєш package-lock.json → краще npm ci
RUN npm install

# тепер копіюємо весь код
COPY . .

# збірка у /app/dist
RUN npm run build

# цей контейнер нічого не запускає — артефакт піде у volume
CMD ["echo", "Frontend build complete"]
