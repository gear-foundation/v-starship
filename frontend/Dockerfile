FROM node:20-alpine

MAINTAINER gear

WORKDIR /app

COPY . .

RUN apk update

RUN apk add xsel

RUN npm install --force

RUN npm run build

RUN npm install --global serve

CMD ["serve", "-s", "/app/dist"]
