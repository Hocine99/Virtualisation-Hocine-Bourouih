# Image Node officielle légère
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --only=production

COPY app.js ./

ENV PORT=4000
EXPOSE 4000

CMD ["node", "app.js"]
