FROM node:16

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY ./src /app/src

CMD node ./src/server.js
