FROM node:14
ENV uniresolver_driver_did_ada_node_url='http://cardano-sidetree:3000'

RUN git clone --recursive --depth=1 https://github.com/rodolfomiranda/uni-resolver-driver-did-ada/

WORKDIR /uni-resolver-driver-did-ada

RUN sed -i 's|https://testnet.sidetree-cardano.com|http://cardano-sidetree:3000|g' service/DefaultService.js && \
    sed -i 's|var serverPort = 8080;|var serverPort = 8000;|g' index.js

ENV NODE_ENV=development
RUN npm install

CMD ["node", "index.js"]
