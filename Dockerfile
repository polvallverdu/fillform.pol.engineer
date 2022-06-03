FROM node:16.3.0-alpine

# Here you should set your ENV variables
ENV PORT=8080
ENV DISCORD_WEBHOOK="google.com"

EXPOSE 8080

WORKDIR /app

COPY package.json .

RUN npm i

ADD src/ ./src
ADD tsconfig.json ./

RUN npm run tsc

CMD [ "npm", "run", "start_lite" ]