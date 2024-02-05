
FROM node:20-slim

WORKDIR /usr/src/app

COPY package*.json ./

COPY src/ .
RUN ls
RUN npm install

EXPOSE 3000

CMD [ "node", "index.js" ]
