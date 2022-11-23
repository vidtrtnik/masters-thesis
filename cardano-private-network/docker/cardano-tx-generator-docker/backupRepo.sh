#!/bin/bash
deleteAfter=1

REPO="cardano-benchmarking"
URL="https://github.com/input-output-hk/cardano-benchmarking"
BRANCH="master"
COMMIT="6eca6bb"

git clone --recursive -b $BRANCH $URL
cd $REPO
git checkout $COMMIT
cd ..

tar -czf "$REPO.tar.gz" $REPO

if [[ $deleteAfter -eq 1 ]]; then rm -rf $REPO; fi
