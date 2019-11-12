FROM node:10.16.0

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY . /app

RUN npm install

CMD npm start
