#!/bin/sh

cd /plutus-apps/plutus-playground-server
echo "Running plutus-playground-server..."
#screen -d -m -S server /nix/store/jp9q9shdyh5c9r8ziizycpr20vm6vlvw-plutus-playground-server/bin/plutus-playground-server
/nix/store/jp9q9shdyh5c9r8ziizycpr20vm6vlvw-plutus-playground-server/bin/plutus-playground-server &

cd /plutus-apps/
nix-shell --command 'cd /plutus-apps/plutus-playground-client && npm run start'
