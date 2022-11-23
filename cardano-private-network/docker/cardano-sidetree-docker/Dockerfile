FROM node:16

RUN git clone --recursive --depth=1 https://github.com/rodolfomiranda/sidetree-cardano
# ||
# COPY sidetree-cardano.tar.gz
# RUN tar -xvf sidetree-cardano.tar.gz

WORKDIR /sidetree-cardano
RUN rm package-lock.json

#RUN sed -i 's|"strict": true,|"strict": false,|g' tsconfig.json && \
#    sed -i 's|// "noImplicitAny": true,|"noImplicitAny": false,|g' tsconfig.json
RUN sed -i 's|https://testnet.sidetree-cardano.com/cardano|http://localhost:3000|g' examples/create.js && \
    sed -i 's|https://submit-api.testnet.dandelion.link/api/submit/tx|http://cardano-submit-api:5555/api/submit/tx|g' src/cardano/CardanoClient_dandelion.ts && \
    sed -i 's|https://submit-api.mainnet.dandelion.link/api/submit/tx|http://cardano-submit-api:5555/api/submit/tx|g' src/cardano/CardanoClient_dandelion.ts && \
    sed -i 's|https://graphql-api.testnet.dandelion.link/api/submit/tx|http://cardano-graphql:3100/graphql|g' src/cardano/CardanoClient_dandelion.ts && \
    sed -i 's|https://graphql-api.mainnet.dandelion.link/api/submit/tx|http://cardano-graphql:3100/graphql|g' src/cardano/CardanoClient_dandelion.ts

#ENV NODE_ENV=development
#RUN npm install
#RUN npm install --global --save-dev
#RUN npm install --save-dev @types/bson
#RUN yarn add @types/bson -D
#RUN npx typesync

RUN yarn install
RUN yarn build

CMD ["yarn", "start"]
