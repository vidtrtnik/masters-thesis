FROM node:14

RUN git clone --recursive --depth=1 https://github.com/cluster-labs/horizon

WORKDIR /horizon

#ENV NODE_ENV=development
RUN npm install
#RUN npm install --ignore-scripts

CMD ["npm", "start"]
