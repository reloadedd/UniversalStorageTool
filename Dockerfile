FROM node:16

MAINTAINER Ionuț Roșca <ionut.rosca@info.uaic.ro>
LABEL version="0.1.0"

# Create the app's folder on the container
WORKDIR /usr/share/src/app

# Ensure that both package.json and package-lock.json are copied
COPY package*.json ./

RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
