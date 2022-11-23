FROM node:16
COPY ipfs-dag-builder-vis.tar.gz /opt/

WORKDIR /opt
RUN tar -xvf ipfs-dag-builder-vis.tar.gz

WORKDIR ipfs-dag-builder-vis
RUN npm install
RUN npm run build

CMD [ "npm", "start" ]
