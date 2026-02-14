# Image Node officielle, légère
FROM node:20-alpine

# Dossier de travail dans le conteneur
WORKDIR /usr/src/app

# Copier les fichiers de dépendances d'abord
COPY package*.json ./

# Installer les dépendances en mode prod
RUN npm install --only=production

# Copier le code de l'application
COPY app.js ./
COPY public ./public

# Le service écoute sur le port 3000
ENV PORT=3000
EXPOSE 3000

# Commande de démarrage
CMD ["node", "app.js"]
