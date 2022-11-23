#!/bin/bash
deleteAfter=1

REPO="sidetree-cardano"
URL="https://github.com/rodolfomiranda/sidetree-cardano"
BRANCH="master"
COMMIT="86576e8"

git clone --recursive -b $BRANCH $URL
cd $REPO
git checkout $COMMIT
cd ..

tar -czf "$REPO.tar.gz" $REPO

if [[ $deleteAfter -eq 1 ]]; then rm -rf $REPO; fi
