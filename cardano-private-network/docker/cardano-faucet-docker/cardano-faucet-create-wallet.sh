#!/bin/bash
mkdir -pv /var/lib/cardano-faucet/
mkdir -pv /config/cardano-faucet
WALLET_API_URL="http://cardano-wallet1:8090"
#FAUCET_WALLET_ID_PATH=/opt/cardano-faucet/faucet.walletid
#FAUCET_PASSPHRASE_PATH=/opt/cardano-faucet/faucet.passphrase
FAUCET_PASSPHRASE_PATH=/var/lib/cardano-faucet/faucet.passphrase
FAUCET_WALLET_ID_PATH=/var/lib/cardano-faucet/faucet.id
FAUCET_ADDRESS_PATH=/config/cardano-faucet/faucet.address

if [[ ! -f "/config/cardano-faucet/faucet.address" ]]; then
     echo "Creating new faucet wallet..."
     #echo '"slab","praise","suffer","rabbit","during","dream","arch","harvest","culture","book","owner","loud","wool","salon","table","animal","vivid","arrow","dirt","divide","humble","tornado","solution","jungle"' | tr -d '"' | tr "," " "

     OUTPUT=$(curl -X POST $WALLET_API_URL/v2/wallets \
     -d '{"mnemonic_sentence":["slab","praise","suffer","rabbit","during","dream","arch","harvest","culture","book","owner","loud","wool","salon","table","animal","vivid","arrow","dirt","divide","humble","tornado","solution","jungle"],
          "passphrase":"ShelleyFaucetWalletPassphrase",
          "name":"ShelleyFaucetWallet",
          "address_pool_gap":20}' \
     -H "Content-Type: application/json"
     )
     WALLET_ID=$(echo "$OUTPUT" | jq -r '.id')
     ADDRESS_1=$(curl -s $WALLET_API_URL/v2/wallets/$WALLET_ID/addresses | jq -r '.[].id' | head -n1)
     # STATES: arr=$(curl -s $WALLET_API_URL/v2/wallets/1299b5d429f8a79abc507ea6b906b16afb0a3625/addresses | jq -r '.[]' | jq -r '.state')

     printf "$WALLET_ID" > $FAUCET_WALLET_ID_PATH
     cp $FAUCET_WALLET_ID_PATH /config/cardano-faucet/faucet.id

     printf "ShelleyFaucetWalletPassphrase" > $FAUCET_PASSPHRASE_PATH
     cp $FAUCET_PASSPHRASE_PATH /config/cardano-faucet/faucet.passphrase

     printf "$ADDRESS_1" > $FAUCET_ADDRESS_PATH

else
     echo "Faucet wallet already exists..."
     cp /config/cardano-faucet/faucet.id $FAUCET_WALLET_ID_PATH
     cp /config/cardano-faucet/faucet.passphrase $FAUCET_PASSPHRASE_PATH
fi
