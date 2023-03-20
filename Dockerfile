FROM node:alpine

ENV PORT ${PORT}
ENV NODE_ENV = "production"

WORKDIR /usr/big-winner-clone-proto-api

COPY package.json .
COPY yarn.lock .

RUN yarn
RUN yarn add -D @swc/cli @swc/core

COPY . .

RUN yarn build

EXPOSE ${PORT}

CMD [ "yarn", "start" ]