# La web de Howenh Labs: se construye con Astro y se sirve con nginx.
# En Coolify: Build Pack «Dockerfile», puerto 80.
# Node 24 porque Astro 7 pide Node >= 22.23.4 (ver engines en package.json).
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
