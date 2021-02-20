FROM node
WORKDIR /usr/src/app

COPY ./ .

RUN npm install

RUN npm build

CMD npm run serve