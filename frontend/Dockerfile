FROM node:20-alpine

MAINTAINER gear

WORKDIR /app

COPY . .

RUN apk update

RUN apk add xsel

ARG VITE_NODE_ADDRESS \
    VITE_CONTRACT_ADDRESS
ENV VITE_NODE_ADDRESS=${VITE_NODE_ADDRESS} \
    VITE_CONTRACT_ADDRESS=${VITE_CONTRACT_ADDRESS} \
    DISABLE_ESLINT_PLUGIN=true

RUN npm install --force

RUN npm run build

RUN npm install --global serve

CMD ["serve", "-s", "/app/dist"]
