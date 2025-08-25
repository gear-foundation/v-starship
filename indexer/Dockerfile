FROM node:20-alpine
MAINTAINER GEAR
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 4350
CMD ["node", "--version"]
