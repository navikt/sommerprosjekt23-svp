FROM node:alpine

WORKDIR /usr/src/app

RUN apk add --no-cache curl
RUN curl -f -o fallback-decorator.html "https://appres.nav.no/common-html/v4/navno?header=true&styles=true&scripts=true&footer=true"

COPY dist ./dist

COPY server.js .
COPY node_modules ./node_modules
COPY package.json .
COPY src/build/scripts/decorator.js ./src/build/scripts/decorator.js
COPY src/build/scripts/envSettings.js ./src/build/scripts/envSettings.js

EXPOSE 8080
CMD ["npm", "run", "start-express"]