#frontend dockerfile
FROM node:18-alpine AS frontend

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["echo", "Frontend build complete"]
