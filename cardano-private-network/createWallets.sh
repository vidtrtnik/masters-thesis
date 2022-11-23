#!/bin/bash
WALLET_API_URL="http://localhost:8090"

MNEMONIC01=$(for w in $(echo 'riot rib fashion gaze wide subject shy kingdom differ example farm utility vanish idle limb crane target admit arm purse sock scan sphere jelly'); do printf "\"$w\"," ; done | head -c-1)
NAME01="ShelleyWallet01"
PASSPHRASE01="ShelleyWallet01Passphrase"

MNEMONIC02=$(for w in $(echo 'critic venue palace clinic body search stadium parent casual loan hover galaxy special check duty any vault cute position early rival nest patrol gesture'); do printf "\"$w\"," ; done | head -c-1)
NAME02="ShelleyWallet02"
PASSPHRASE02="ShelleyWallet02Passphrase"

MNEMONIC03=$(for w in $(echo 'case say room stone aim visa column clown tunnel black absurd slow section giggle jump remember demise coast blue discover alien clarify buddy truck'); do printf "\"$w\"," ; done | head -c-1)
NAME03="ShelleyWallet03"
PASSPHRASE03="ShelleyWallet03Passphrase"

MNEMONIC04=$(for w in $(echo 'audit disagree coconut shoot vast valve rail reject ill blind find lawsuit total that chest expire layer mirror memory odor basket chimney girl buffalo'); do printf "\"$w\"," ; done | head -c-1)
NAME04="ShelleyWallet04"
PASSPHRASE04="ShelleyWallet04Passphrase"

MNEMONIC05=$(for w in $(echo 'number rate frequent science seat sphere august diesel bread copy vicious joy hospital hurry useful obscure chest asset flower gold melt gesture brown undo'); do printf "\"$w\"," ; done | head -c-1)
NAME05="ShelleyWallet05"
PASSPHRASE05="ShelleyWallet05Passphrase"

MNEMONIC06=$(for w in $(echo 'stomach chapter daughter exile famous rifle put humble battle stool blur caught electric radio resist step decide clinic news road that toast emerge search'); do printf "\"$w\"," ; done | head -c-1)
NAME06="ShelleyWallet06"
PASSPHRASE06="ShelleyWallet06Passphrase"

MNEMONIC07=$(for w in $(echo 'horn path swamp boat coral manual wide jelly provide rubber improve arrow pet patient slot include artefact quality certain panther milk subway knife exercise'); do printf "\"$w\"," ; done | head -c-1)
NAME07="ShelleyWallet07"
PASSPHRASE07="ShelleyWallet07Passphrase"

MNEMONIC08=$(for w in $(echo 'gas wheel range tape add earth describe spare slam clump nose unveil rain crop language mistake check action wire nature used fiber calm clever'); do printf "\"$w\"," ; done | head -c-1)
NAME08="ShelleyWallet08"
PASSPHRASE08="ShelleyWallet08Passphrase"

MNEMONIC09=$(for w in $(echo 'happy prize hour used ignore saddle feed balcony era firm sibling spice pause since trigger transfer good parent buffalo snap copper toddler dune clog'); do printf "\"$w\"," ; done | head -c-1)
NAME09="ShelleyWallet09"
PASSPHRASE09="ShelleyWallet09Passphrase"

MNEMONIC10=$(for w in $(echo 'skate crime soda myself multiply jacket bridge category armed mother diamond harsh cycle safe science lyrics aunt bullet fan reveal during hotel tent divorce'); do printf "\"$w\"," ; done | head -c-1)
NAME10="ShelleyWallet10"
PASSPHRASE10="ShelleyWallet10Passphrase"

OUTPUT1=$(curl -X POST $WALLET_API_URL/v2/wallets \
     -d "{\"mnemonic_sentence\": [$MNEMONIC01],
          \"passphrase\":\"$PASSPHRASE01\",
          \"name\":\"$NAME01\",
          \"address_pool_gap\":20}" \
     -H "Content-Type: application/json")
     

OUTPUT2=$(curl -X POST $WALLET_API_URL/v2/wallets \
     -d "{\"mnemonic_sentence\": [$MNEMONIC02],
          \"passphrase\":\"$PASSPHRASE02\",
          \"name\":\"$NAME02\",
          \"address_pool_gap\":20}" \
     -H "Content-Type: application/json")
     

OUTPUT3=$(curl -X POST $WALLET_API_URL/v2/wallets \
     -d "{\"mnemonic_sentence\": [$MNEMONIC03],
          \"passphrase\":\"$PASSPHRASE03\",
          \"name\":\"$NAME03\",
          \"address_pool_gap\":20}" \
     -H "Content-Type: application/json")
     
OUTPUT4=$(curl -X POST $WALLET_API_URL/v2/wallets \
     -d "{\"mnemonic_sentence\": [$MNEMONIC04],
          \"passphrase\":\"$PASSPHRASE04\",
          \"name\":\"$NAME04\",
          \"address_pool_gap\":20}" \
     -H "Content-Type: application/json")
     
OUTPUT5=$(curl -X POST $WALLET_API_URL/v2/wallets \
     -d "{\"mnemonic_sentence\": [$MNEMONIC05],
          \"passphrase\":\"$PASSPHRASE05\",
          \"name\":\"$NAME05\",
          \"address_pool_gap\":20}" \
     -H "Content-Type: application/json")
     
OUTPUT6=$(curl -X POST $WALLET_API_URL/v2/wallets \
     -d "{\"mnemonic_sentence\": [$MNEMONIC06],
          \"passphrase\":\"$PASSPHRASE06\",
          \"name\":\"$NAME06\",
          \"address_pool_gap\":20}" \
     -H "Content-Type: application/json")

OUTPUT7=$(curl -X POST $WALLET_API_URL/v2/wallets \
     -d "{\"mnemonic_sentence\": [$MNEMONIC07],
          \"passphrase\":\"$PASSPHRASE07\",
          \"name\":\"$NAME07\",
          \"address_pool_gap\":20}" \
     -H "Content-Type: application/json")

OUTPUT8=$(curl -X POST $WALLET_API_URL/v2/wallets \
     -d "{\"mnemonic_sentence\": [$MNEMONIC08],
          \"passphrase\":\"$PASSPHRASE08\",
          \"name\":\"$NAME08\",
          \"address_pool_gap\":20}" \
     -H "Content-Type: application/json")

OUTPUT9=$(curl -X POST $WALLET_API_URL/v2/wallets \
     -d "{\"mnemonic_sentence\": [$MNEMONIC09],
          \"passphrase\":\"$PASSPHRASE09\",
          \"name\":\"$NAME09\",
          \"address_pool_gap\":20}" \
     -H "Content-Type: application/json")

OUTPUT10=$(curl -X POST $WALLET_API_URL/v2/wallets \
     -d "{\"mnemonic_sentence\": [$MNEMONIC10],
          \"passphrase\":\"$PASSPHRASE10\",
          \"name\":\"$NAME10\",
          \"address_pool_gap\":20}" \
     -H "Content-Type: application/json")

WALLET1_ID=$(echo "$OUTPUT1" | jq -r '.id')
WALLET2_ID=$(echo "$OUTPUT2" | jq -r '.id')
WALLET3_ID=$(echo "$OUTPUT3" | jq -r '.id')
WALLET4_ID=$(echo "$OUTPUT4" | jq -r '.id')
WALLET5_ID=$(echo "$OUTPUT5" | jq -r '.id')
WALLET6_ID=$(echo "$OUTPUT6" | jq -r '.id')
WALLET7_ID=$(echo "$OUTPUT7" | jq -r '.id')
WALLET8_ID=$(echo "$OUTPUT8" | jq -r '.id')
WALLET9_ID=$(echo "$OUTPUT9" | jq -r '.id')
WALLET10_ID=$(echo "$OUTPUT10" | jq -r '.id')

ADDRESS_1=$(curl -s $WALLET_API_URL/v2/wallets/$WALLET1_ID/addresses | jq -r '.[].id' | head -n1)
ADDRESS_2=$(curl -s $WALLET_API_URL/v2/wallets/$WALLET2_ID/addresses | jq -r '.[].id' | head -n1)
ADDRESS_3=$(curl -s $WALLET_API_URL/v2/wallets/$WALLET3_ID/addresses | jq -r '.[].id' | head -n1)
ADDRESS_4=$(curl -s $WALLET_API_URL/v2/wallets/$WALLET4_ID/addresses | jq -r '.[].id' | head -n1)
ADDRESS_5=$(curl -s $WALLET_API_URL/v2/wallets/$WALLET5_ID/addresses | jq -r '.[].id' | head -n1)
ADDRESS_6=$(curl -s $WALLET_API_URL/v2/wallets/$WALLET6_ID/addresses | jq -r '.[].id' | head -n1)
ADDRESS_7=$(curl -s $WALLET_API_URL/v2/wallets/$WALLET7_ID/addresses | jq -r '.[].id' | head -n1)
ADDRESS_8=$(curl -s $WALLET_API_URL/v2/wallets/$WALLET8_ID/addresses | jq -r '.[].id' | head -n1)
ADDRESS_9=$(curl -s $WALLET_API_URL/v2/wallets/$WALLET9_ID/addresses | jq -r '.[].id' | head -n1)
ADDRESS_10=$(curl -s $WALLET_API_URL/v2/wallets/$WALLET10_ID/addresses | jq -r '.[].id' | head -n1)

echo $OUTPUT1
echo $OUTPUT2
echo $OUTPUT3
echo $OUTPUT4
echo $OUTPUT5
echo $OUTPUT6
echo $OUTPUT7
echo $OUTPUT8
echo $OUTPUT9
echo $OUTPUT10
echo
echo $WALLET1_ID
echo $WALLET2_ID
echo $WALLET3_ID
echo $WALLET4_ID
echo $WALLET5_ID
echo $WALLET6_ID
echo $WALLET7_ID
echo $WALLET8_ID
echo $WALLET9_ID
echo $WALLET10_ID
echo
echo $ADDRESS_1
echo $ADDRESS_2
echo $ADDRESS_3
echo $ADDRESS_4
echo $ADDRESS_5
echo $ADDRESS_6
echo $ADDRESS_7
echo $ADDRESS_8
echo $ADDRESS_9
echo $ADDRESS_10
