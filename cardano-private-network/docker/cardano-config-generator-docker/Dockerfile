FROM ubuntu:20.04
ENV CONFIG_DIR_NAME="config"
ENV CARDANO_BIN_DIR="/home/user/cardano-bin"
ENV CARDANO_BIN_URL="https://hydra.iohk.io/build/9941151/download/1/cardano-node-1.33.0-linux.tar.gz"

RUN apt update && \
    apt upgrade -y && \
    apt install -y nano wget curl git && \
    apt autoremove -y && \
    apt clean

#RUN useradd -rm -d /home/user -s /bin/bash -u 1000 user

WORKDIR /home/user/cardano-private-network
COPY ../../cardano-private-testnet-setup/cardano-private-testnet-setup.tar.gz ../../prints.sh ../../create.sh .
COPY ../../config-templates/ ./config-templates

RUN tar -xvf ./cardano-private-testnet-setup.tar.gz && \
    wget $CARDANO_BIN_URL && \
    mkdir -pv $CARDANO_BIN_DIR && \
    tar -xvf $(basename $CARDANO_BIN_URL) -C $CARDANO_BIN_DIR && \
    echo "PATH=$PATH:$CARDANO_BIN_DIR" >> /root/.bashrc && \
    rm $(basename $CARDANO_BIN_URL) && \
    /bin/bash -c "source /root/.bashrc" && \
    cp /home/user/cardano-bin/cardano-node /home/user/cardano-bin/cardano-cli /usr/bin/ && \
    mkdir -pv /home/user/generated-config-tmp/config
    #chown -R 1000:1000 /home/user && \

#USER user

WORKDIR /home/user/cardano-private-network
CMD ["/bin/bash", "-c", "echo Sleeping...; echo Run any command using docker exec...; sleep infinity;"]
