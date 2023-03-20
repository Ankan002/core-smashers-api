FROM node:alpine

ARG PORT
ARG DATABASE_URL
ARG JWT_SCRET

ENV NODE_ENV="production"

WORKDIR /usr/big-winner-clone-proto-api

RUN echo ${DATABASE_URL}

COPY package.json .
COPY yarn.lock .

RUN yarn
RUN yarn add -D @swc/cli @swc/core

COPY . .

RUN yarn build

EXPOSE ${PORT}

CMD [ "yarn", "start" ]