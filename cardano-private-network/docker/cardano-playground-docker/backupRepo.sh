#!/bin/bash
deleteAfter=1

REPO="plutus-apps"
URL="https://github.com/input-output-hk/plutus-apps"
BRANCH="main"
COMMIT="c3139a7" # 22.04.06

git clone --recursive -b $BRANCH $URL
cd $REPO
git checkout $COMMIT
cd ..

tar -czf "$REPO.tar.gz" $REPO

if [[ $deleteAfter -eq 1 ]]; then rm -rf $REPO; fi
