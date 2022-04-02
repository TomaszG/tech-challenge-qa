FROM node:14.19.1-slim
ENV CYPRESS_INSTALL_BINARY=0
WORKDIR /src
COPY package*.json /src/
RUN npm ci
CMD [ "npm", "start" ]
