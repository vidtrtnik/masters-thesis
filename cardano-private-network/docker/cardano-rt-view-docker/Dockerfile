FROM ubuntu:20.04

RUN apt update && apt upgrade -y && apt install -y wget curl
WORKDIR /cardano-rt-view

RUN wget https://hydra.iohk.io/build/5643768/download/1/cardano-rt-view-0.3.0-linux-x86_64.tar.gz
# ||
# COPY cardano-rt-view-0.3.0-linux-x86_64.tar.gz .

RUN tar -xvf cardano-rt-view-0.3.0-linux-x86_64.tar.gz && chmod +x cardano-rt-view

CMD ["./cardano-rt-view", "--config", "cardano-rt-view.json"]
