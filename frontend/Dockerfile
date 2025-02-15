# Dockerfile pentru Frontend (React + Three.js)
FROM node:18
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npx", "serve", "-s", "build"]
EXPOSE 3000