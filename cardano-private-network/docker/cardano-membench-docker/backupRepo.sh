#!/bin/bash
deleteAfter=1

REPO="cardano-faucet"
URL="https://github.com/input-output-hk/cardano-faucet"
BRANCH="alonzo-wallet"
COMMIT="46a3239"

git clone --recursive -b $BRANCH $URL
cd $REPO
git checkout $COMMIT
cd ..

tar -czf "$REPO.tar.gz" $REPO

if [[ $deleteAfter -eq 1 ]]; then rm -rf $REPO; fi

wget https://github.com/input-output-hk/cardano-wallet/releases/download/v2022-01-18/cardano-wallet-v2022-01-18-linux64.tar.gz
