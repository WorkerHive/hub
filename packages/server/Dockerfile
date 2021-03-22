FROM node:14

RUN apt-get install python3 -y

WORKDIR /graph

COPY package*.json ./

RUN npm i

COPY . .

