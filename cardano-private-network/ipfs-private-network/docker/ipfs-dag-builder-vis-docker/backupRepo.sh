#!/bin/bash
deleteAfter=1

REPO="ipfs-dag-builder-vis"
URL="https://github.com/ipfs-shipyard/ipfs-dag-builder-vis"
BRANCH="master"
COMMIT="2259b61"

git clone --recursive -b $BRANCH $URL
cd $REPO
git checkout $COMMIT
cd ..

tar -czf "$REPO.tar.gz" $REPO

if [[ $deleteAfter -eq 1 ]]; then rm -rf $REPO; fi
