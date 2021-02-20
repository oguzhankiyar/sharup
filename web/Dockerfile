FROM node
WORKDIR /usr/src/app

COPY ./ .

RUN npm install

RUN npm install -g serve

RUN npm run build

CMD npm run serve