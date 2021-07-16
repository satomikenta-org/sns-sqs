FROM node:alpine

COPY ./package* ./

RUN npm ci

COPY . .

CMD [ "node", "index.js" ]