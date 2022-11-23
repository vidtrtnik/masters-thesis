#!/bin/bash
deleteAfter=1

REPO="cardano-explorer-app"
URL="https://github.com/input-output-hk/cardano-explorer-app"
BRANCH="develop"
COMMIT="4321423" # 1.6.0

git clone --recursive -b $BRANCH $URL
cd $REPO
git checkout $COMMIT
cd ..

tar -czf "$REPO.tar.gz" $REPO

if [[ $deleteAfter -eq 1 ]]; then rm -rf $REPO; fi
