FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Etc/UTC

RUN apt update && apt upgrade -y && apt install -y git curl wget nano gnupg
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt update && \
    apt install -y yarn

WORKDIR /opt/

RUN git clone --recursive --depth=1 https://github.com/input-output-hk/cardano-explorer-app
# ||
# COPY cardano-explorer-app.tar.gz .
# RUN tar -xvf cardano-explorer-app.tar.gz

WORKDIR /opt/cardano-explorer-app
RUN yarn --offline && yarn static:build
