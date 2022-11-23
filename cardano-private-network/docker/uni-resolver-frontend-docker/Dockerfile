FROM node:14
ENV BACKEND_URL="http://localhost:8080/"
ENV NODE_ENV=development

RUN git clone --recursive --depth=1 https://github.com/decentralized-identity/universal-resolver-frontend

WORKDIR /universal-resolver-frontend

RUN npm install

CMD ["npm", "run", "dev"]
