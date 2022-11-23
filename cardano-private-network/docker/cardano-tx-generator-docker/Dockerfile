FROM ubuntu:20.04

RUN apt update && apt upgrade -y && apt install -y git wget curl cabal-install
WORKDIR /

#COPY ./cardano-benchmarking.tar.gz .
RUN git clone --recursive --depth=1 https://github.com/input-output-hk/cardano-benchmarking
#RUN tar -xvf cardano-benchmarking.tar.gz
WORKDIR /cardano-benchmarking/cardano-tx-generator

#RUN cabal update
#RUN cabal build all
CMD ["/bin/bash", "-c", "sleep 99999"]
