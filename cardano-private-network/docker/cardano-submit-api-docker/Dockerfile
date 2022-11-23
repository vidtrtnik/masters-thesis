FROM ubuntu:20.04

RUN apt update && \
    apt install -y wget curl nano jq

RUN wget https://hydra.iohk.io/build/9941151/download/1/cardano-node-1.33.0-linux.tar.gz && \
    tar -xvf cardano-node-1.33.0-linux.tar.gz -C /usr/bin/

RUN mkdir -pv /cardano-submit-api-config/ && \
    wget https://github.com/input-output-hk/cardano-node/raw/master/cardano-submit-api/config/tx-submit-mainnet-config.yaml -P /cardano-submit-api-config/

CMD ["cardano-submit-api", "--config", "/cardano-submit-api-config/tx-submit-mainnet-config.yaml", "--socket-path", "/ipc/node.socket", "--listen-address", "0.0.0.0", "--port", "5555", "--testnet-magic", "42" ]
