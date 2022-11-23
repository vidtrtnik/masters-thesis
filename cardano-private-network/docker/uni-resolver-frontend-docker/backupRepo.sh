#!/bin/bash
deleteAfter=1

REPO="universal-resolver-frontend"
URL="https://github.com/decentralized-identity/universal-resolver-frontend"
BRANCH="main"
COMMIT="6657d66"

git clone --recursive -b $BRANCH $URL
cd $REPO
git checkout $COMMIT
cd ..

tar -czf "$REPO.tar.gz" $REPO

if [[ $deleteAfter -eq 1 ]]; then rm -rf $REPO; fi
