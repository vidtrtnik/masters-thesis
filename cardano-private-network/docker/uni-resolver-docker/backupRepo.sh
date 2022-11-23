#!/bin/bash
deleteAfter=1

REPO="universal-resolver"
URL="https://github.com/decentralized-identity/universal-resolver"
BRANCH="main"
COMMIT="22d0f8f"

git clone --recursive -b $BRANCH $URL
cd $REPO
git checkout $COMMIT
cd ..

tar -czf "$REPO.tar.gz" $REPO

if [[ $deleteAfter -eq 1 ]]; then rm -rf $REPO; fi
