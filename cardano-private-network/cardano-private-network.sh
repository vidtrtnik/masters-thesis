#!/bin/bash
CURRENT_DIR=$PWD
#PROJECT_DIR=$HOME/cardano/docker-test
PROJECT_DIR=$CURRENT_DIR
CONFIG_DIR_NAME="config"
CARDANO_BIN_DIR="$HOME/cardano-bin"
CARDANO_BIN_URL="https://hydra.iohk.io/build/9941151/download/1/cardano-node-1.33.0-linux.tar.gz"
DISABLE_IPV6_TEMP=0
FILESEL="-f docker-compose.yml -f ipfs-private-network/docker-compose.yml -f postgres/docker-compose.yml"
#FILESEL="-f docker-composeCOMBINED.yml"
source prints.sh

function install()
{
    if [[ "$1" == "build" ]]; then
        docker compose -f docker-compose.yml build
        exit 0
    fi
    print_wrn "--> install $1..."

    if [[ "$1" == "local" ||  "$2" == "local" ]]; then
        wget $CARDANO_BIN_URL

        mkdir -pv $CARDANO_BIN_DIR
        tar -xvf $(basename $CARDANO_BIN_URL) -C $CARDANO_BIN_DIR

        echo "PATH=$PATH:$CARDANO_BIN_DIR" >> $HOME/.bashrc
        rm $(basename $CARDANO_BIN_URL)
        source $HOME/.bashrc
    fi

    cd $PROJECT_DIR
    docker compose $FILESEL pull
    #docker compose $FILESEL build

    docker compose build
    docker compose $FILESEL build
    # cd ipfs-private-network && docker compose build && cd $PROJECT_DIR
    # cd postgres && docker compose build && cd $PROJECT_DIR
}

function start()
{
    print_wrn "--> start $1..."
    cd $PROJECT_DIR
    docker compose $FILESEL up
    docker compose $FILESEL up $1
}

function stop()
{
    print_wrn "--> stop $1..."
    cd $PROJECT_DIR
    docker compose $FILESEL down
    docker compose $FILESEL down $1
}

function restart()
{
    print_wrn "--> restart $1..."
    if [[ $DISABLE_IPV6_TEMP -eq 1 ]]; then disable_ipv6_temp; fi
    cd $PROJECT_DIR
    #docker compose $FILESEL down
    #docker compose $FILESEL up $1
    docker compose $FILESEL restart -t 3
}

function remove()
{
    print_wrn "--> remove $1..."
    cd $PROJECT_DIR
    docker compose $FILESEL down -t 2
    docker compose $FILESEL down -t 2 -v

    sudo rm -rf volumes/$CONFIG_DIR_NAME
}

function reset()
{
    print_wrn "--> reset $1..."
    if [[ $DISABLE_IPV6_TEMP -eq 1 ]]; then disable_ipv6_temp; fi
    cd $PROJECT_DIR
    docker compose $FILESEL down -t 2
    docker compose $FILESEL down -t 2 -v

    sudo rm -rf $PROJECT_DIR/volumes/$CONFIG_DIR_NAME

    # EITHER (cardano-cli is installed locally)
    # bash create.sh "$CONFIG_DIR_NAME"
    # cp -r $PROJECT_DIR/cardano-private-testnet-setup/$CONFIG_DIR_NAME $PROJECT_DIR/volumes/
    # OR
    docker compose run --rm cardano-config-generator bash -c "bash create.sh config; cp -r ./cardano-private-testnet-setup/config /home/user/generated-config-tmp/; chown -R $(id -u $USER):$(id -g $USER) /home/user/generated-config-tmp/; echo OK"
    cp -r ./volumes/generated-config-tmp/config $PROJECT_DIR/volumes/$CONFIG_DIR_NAME

    cd $PROJECT_DIR
    docker compose $FILESEL up $1
}

function query_tip()
{
    if [[ -z "$2" ]]; then
        print_wrn "--> query_tip $1..."
    fi

    CARDANO_NODE_CONTAINER="$(docker ps -q -f "name=cardano-node1")"
    if [[ "$CARDANO_NODE_CONTAINER" == "" ]]; then print_err "Error: cardano-node1 not running..."; return; fi
    SELECTION=$1
    if [[ "$SELECTION" == "" ]]; then
        docker exec -it $CARDANO_NODE_CONTAINER bash -c \
        "cardano-cli query tip --testnet-magic 42"
    else
        OUTPUT=$(docker exec -it $CARDANO_NODE_CONTAINER bash -c \
        "cardano-cli query tip --testnet-magic 42" \
        | jq "$SELECTION")
        if [[ -z "$2" ]]; then
            printf "$OUTPUT"
        else
            echo $OUTPUT
        fi
    fi
}

function attach()
{
    CONTAINER_NAME=$1
    print_wrn "--> attach $CONTAINER_NAME..."
    CARDANO_NODE_CONTAINER="$(docker ps -q -f "name=$CONTAINER_NAME")"
    if [[ "$CARDANO_NODE_CONTAINER" == "" ]]; then print_err "Error: $CONTAINER_NAME not running..."; return; fi

    docker exec -it $CARDANO_NODE_CONTAINER bash
}

function check1()
{
    print_wrn "--> check $1..."
    CARDANO_NODE_CONTAINER="$(docker ps -q -f "name=cardano-node1")"
    if [[ "$CARDANO_NODE_CONTAINER" != "" ]]; then
        USER1_ADDRESS=$(docker exec -it $CARDANO_NODE_CONTAINER bash -c \
        "cat /$CONFIG_DIR_NAME/addresses/user1.addr")
        echo "UTxO balances of user1 (address: \"$USER1_ADDRESS\"):"
        docker exec -it $CARDANO_NODE_CONTAINER bash -c \
        "cardano-cli query utxo --address \$(cat /$CONFIG_DIR_NAME/addresses/user1.addr) --testnet-magic 42"
    else
        print_err "Error: cardano-node1 not running..."
    fi
}

function check()
{
    print_wrn "--> check $1..."
    ADDRESS="$1"
    if [[ "$ADDRESS" == "" || "$ADDRESS" == "-d" ]]; then read -p "Enter address: " ADDRESS; fi

    CARDANO_NODE_CONTAINER="$(docker ps -q -f "name=cardano-node1")"
    if [[ "$CARDANO_NODE_CONTAINER" != "" ]]; then
        echo "UTxO balances of address: \"$ADDRESS\"):"
        docker exec -it $CARDANO_NODE_CONTAINER bash -c \
        "cardano-cli query utxo --address $ADDRESS --testnet-magic 42"
    else
        print_err "Error: cardano-node1 not running..."
    fi

}


function update1()
{
    print_wrn "--> update1 ..."
    CARDANO_NODE_CONTAINER="$(docker ps -q -f "name=cardano-node1")"
    if [[ "$CARDANO_NODE_CONTAINER" != "" ]]; then
        FEE=1000000

        GREATEST_INPUT=$(docker exec -it $CARDANO_NODE_CONTAINER bash -c \
        "cardano-cli query utxo --whole-utxo --testnet-magic 42;" \
        | tail -n +3 | awk '{printf "%s#%s %s \n", $1 , $2, $3}' | sort -rn -k2 | head -n1)
        echo $GREATEST_INPUT

        TXID0=$(echo ${GREATEST_INPUT} | awk '{print $1}')
        COINS_IN_INPUT=$(echo ${GREATEST_INPUT} | awk '{print $2}')
        echo "Using ${TXID0}, containing ${COINS_IN_INPUT} lovelace"

        docker exec -it $CARDANO_NODE_CONTAINER bash -c \
        "cardano-cli transaction build-raw \
            --alonzo-era \
            --fee ${FEE} \
            --tx-in ${TXID0}\
            --tx-out \$(cat /$CONFIG_DIR_NAME/addresses/user1.addr)+$((${COINS_IN_INPUT} / 2)) \
            --tx-out \$(cat /$CONFIG_DIR_NAME/addresses/user1.addr)+$((${COINS_IN_INPUT} / 2 - ${FEE})) \
            --certificate-file /$CONFIG_DIR_NAME/addresses/pool-owner1-stake.reg.cert \
            --certificate-file /$CONFIG_DIR_NAME/node-pool1/registration.cert \
            --certificate-file /$CONFIG_DIR_NAME/addresses/user1-stake.reg.cert \
            --certificate-file /$CONFIG_DIR_NAME/addresses/user1-stake.deleg.cert \
            --out-file /$CONFIG_DIR_NAME/tx2.txbody"

        docker exec -it $CARDANO_NODE_CONTAINER bash -c \
        "cardano-cli transaction sign \
            --signing-key-file /$CONFIG_DIR_NAME/shelley/utxo-keys/utxo1.skey \
            --signing-key-file /$CONFIG_DIR_NAME/addresses/user1-stake.skey \
            --signing-key-file /$CONFIG_DIR_NAME/node-pool1/owner.skey \
            --signing-key-file /$CONFIG_DIR_NAME/node-pool1/shelley/operator.skey \
            --signing-key-file /$CONFIG_DIR_NAME/shelley/genesis-keys/genesis1.skey \
            --signing-key-file /$CONFIG_DIR_NAME/shelley/genesis-keys/genesis2.skey \
            --signing-key-file /$CONFIG_DIR_NAME/shelley/delegate-keys/delegate1.skey \
            --signing-key-file /$CONFIG_DIR_NAME/shelley/delegate-keys/delegate2.skey \
            --testnet-magic 42 \
            --tx-body-file  /$CONFIG_DIR_NAME/tx2.txbody \
            --out-file      /$CONFIG_DIR_NAME/tx2.tx"

        docker exec -it $CARDANO_NODE_CONTAINER bash -c \
        "cardano-cli transaction submit --tx-file /$CONFIG_DIR_NAME/tx2.tx --testnet-magic 42"
    else
        print_err "Error: cardano-node1 not running..."
    fi
}

function create_new_address()
{
    print_wrn "--> create new address..."
    CARDANO_NODE_CONTAINER="$(docker ps -q -f "name=cardano-node1")"
    if [[ "$CARDANO_NODE_CONTAINER" == "" ]]; then print_err "Error: cardano-node1 not running..."; return; fi

    ADDRESS="$1"
    if [[ "$ADDRESS" == "" || "$ADDRESS" == "-d" ]]; then ADDRESS="user-$RANDOM"; fi
    print_wrn "Creating new address ($ADDRESS)..."

    docker exec -it $CARDANO_NODE_CONTAINER bash -c \
    "cardano-cli address key-gen \
        --verification-key-file /$CONFIG_DIR_NAME/addresses/${ADDRESS}.vkey \
        --signing-key-file      /$CONFIG_DIR_NAME/addresses/${ADDRESS}.skey"

    docker exec -it $CARDANO_NODE_CONTAINER bash -c \
    "cardano-cli stake-address key-gen \
        --verification-key-file /$CONFIG_DIR_NAME/addresses/${ADDRESS}-stake.vkey \
        --signing-key-file      /$CONFIG_DIR_NAME/addresses/${ADDRESS}-stake.skey"

    docker exec -it $CARDANO_NODE_CONTAINER bash -c \
    "cardano-cli address build \
        --payment-verification-key-file /$CONFIG_DIR_NAME/addresses/${ADDRESS}.vkey \
        --stake-verification-key-file /$CONFIG_DIR_NAME/addresses/${ADDRESS}-stake.vkey \
        --testnet-magic 42 \
        --out-file /$CONFIG_DIR_NAME/addresses/${ADDRESS}.addr"

    docker exec -it $CARDANO_NODE_CONTAINER bash -c \
    "cardano-cli stake-address build \
        --stake-verification-key-file /$CONFIG_DIR_NAME/addresses/${ADDRESS}-stake.vkey \
        --testnet-magic 42 \
        --out-file /$CONFIG_DIR_NAME/addresses/${ADDRESS}-stake.addr"

    docker exec -it $CARDANO_NODE_CONTAINER bash -c \
    "cardano-cli stake-address registration-certificate \
        --stake-verification-key-file /$CONFIG_DIR_NAME/addresses/${ADDRESS}-stake.vkey \
        --out-file /$CONFIG_DIR_NAME/addresses/${ADDRESS}-stake.reg.cert"

    NEW_ADDRESS=$(docker exec -it $CARDANO_NODE_CONTAINER bash -c \
    "cat /$CONFIG_DIR_NAME/addresses/${ADDRESS}.addr")

    print_wrn "$NEW_ADDRESS"

}

function payment()
{
    print_wrn "--> payment..."
    CARDANO_NODE_CONTAINER="$(docker ps -q -f "name=cardano-node1")"
    if [[ "$CARDANO_NODE_CONTAINER" == "" ]]; then print_err "Error: cardano-node1 not running..."; return; fi

    AMOUNT="$1"
    ADDRESS="$2"
    if [[ "$AMOUNT" == "" || "$AMOUNT" == "-d" ]]; then read -p "Enter amount of Ada: " AMOUNT; fi
    if [[ "$ADDRESS" == "" ]]; then read -p "Enter address: " ADDRESS; fi
    ADDRESS=$(echo $ADDRESS | tr -cd '[:alnum:]_' | cut -c 1-108)

    docker exec -it $CARDANO_NODE_CONTAINER bash -c \
        "cardano-cli query protocol-parameters \
        --testnet-magic 42 \
        --out-file /$CONFIG_DIR_NAME/protocol-parameters.json"

    TXIN=$(docker exec -it $CARDANO_NODE_CONTAINER bash -c \
        "cardano-cli query utxo --address \$(cat /$CONFIG_DIR_NAME/addresses/user1.addr) --testnet-magic 42;" \
    | tail -n +3 | awk '{printf "%s#%s %s \n", $1 , $2, $3}' | sort -k2 | head -n1 | cut -d' ' -f1)

    if [[ "$TXIN" == "" ]]; then print_err "Error: TXIN empty!"; return; fi
    print_ok "TXIN: $TXIN" ,
    TXOUT_ADDRESS="$ADDRESS+$AMOUNT"
    print_ok "TXOUT Address: $TXOUT_ADDRESS" ,
    CURRENT_SLOT=$(docker exec -it $CARDANO_NODE_CONTAINER bash -c \
        "cardano-cli query tip --testnet-magic 42" \
        | jq '.slot')

    docker exec -it $CARDANO_NODE_CONTAINER bash -c \
    "cardano-cli transaction build \
        --alonzo-era \
        --testnet-magic 42 \
        --change-address \$(cat /$CONFIG_DIR_NAME/addresses/user1.addr) \
        --tx-in $TXIN \
        --tx-out $TXOUT_ADDRESS \
        --invalid-hereafter $(( ${CURRENT_SLOT} + 10000 )) \
        --protocol-params-file /$CONFIG_DIR_NAME/protocol-parameters.json \
        --out-file /$CONFIG_DIR_NAME/tx.body"

    docker exec -it $CARDANO_NODE_CONTAINER bash -c \
    "cardano-cli transaction sign \
        --tx-body-file /$CONFIG_DIR_NAME/tx.body \
        --signing-key-file /$CONFIG_DIR_NAME/addresses/user1.skey \
        --testnet-magic 42 \
        --out-file /$CONFIG_DIR_NAME/tx.signed"

    docker exec -it $CARDANO_NODE_CONTAINER bash -c \
    "cardano-cli transaction submit --tx-file /$CONFIG_DIR_NAME/tx.signed --testnet-magic 42"

}

function give_half_to_faucet()
{
    print_wrn "--> give_half_to_faucet..."
    CARDANO_NODE_CONTAINER="$(docker ps -q -f "name=cardano-node1")"
    if [[ "$CARDANO_NODE_CONTAINER" == "" ]]; then print_err "Error: cardano-node1 not running..."; return; fi

    CURRENT_USER1_BALANCE=$(get_addr_balance "0")
    HALF_BALANCE=$(( CURRENT_USER1_BALANCE / 2))

    FAUCET_ADDRESS=$(docker exec -it $CARDANO_NODE_CONTAINER bash -c "cat /$CONFIG_DIR_NAME/cardano-faucet/faucet.address")

    print_inf "Paying $HALF_BALANCE to $FAUCET_ADDRESS"
    payment $HALF_BALANCE $FAUCET_ADDRESS
}

function get_addr_balance()
{
    ADDRESS="$1"
    BALANCE="-1"
    if [[ "$ADDRESS" == "" ]]; then read -p "Enter address: " ADDRESS; fi
    if [[ "$ADDRESS" == "0" ]]; then
        BALANCE=$(docker exec -it $CARDANO_NODE_CONTAINER bash -c \
        "cardano-cli query utxo --address \$(cat /$CONFIG_DIR_NAME/addresses/user1.addr) --testnet-magic 42;" \
    | tail -n +3 | awk '{printf "%s#%s %s \n", $1 , $2, $3}' | sort -k2 | head -n1 | tr -s \  | cut -d' ' -f2)
    else
        BALANCE=$(docker exec -it $CARDANO_NODE_CONTAINER bash -c \
        "cardano-cli query utxo --address $ADDRESS --testnet-magic 42;" \
    | tail -n +3 | awk '{printf "%s#%s %s \n", $1 , $2, $3}' | sort -k2 | head -n1 | tr -s \  | cut -d' ' -f2)
    fi

    printf "$BALANCE"
}

function scenario()
{
    if [[ $1 -eq 1 ]]; then
        print_wrn " *** Scenario #1 *** "
        echo
        print_wrn " * 1.1 Perform user1 update..."
        update1
        sleep 3
        echo

        print_wrn " * 1.2 Giving half of the funds to faucet..."
        give_half_to_faucet 0
        sleep 3
        echo
        
        #print_wrn " * 1.3 Creating new address..."
        #out=$(create_new_address)
        #addr=$(echo $out | grep -E -o "addr_test1.*" | tr -d '\n\r\t ')
        #print_wrn "Created new address: $addr"
        #sleep 2
        #echo

        print_wrn " * 1.4.1 Transfering 5000 tADA to "addr_test1qqe85ssrdvr98y6j2acdlexl22meam6p9pnxmcc6fg8xngh033pydfxc3e2n9pn58x0h06j8lq5mjag2kdqq8u4yxw5sk78ljm"..."
        payment 5000000000 "addr_test1qqe85ssrdvr98y6j2acdlexl22meam6p9pnxmcc6fg8xngh033pydfxc3e2n9pn58x0h06j8lq5mjag2kdqq8u4yxw5sk78ljm"
        sleep 3
        echo
        
        print_wrn " * 1.4.2 Transfering 5000 tADA to "addr_test1qraewa55q0pzafc2k5yzuv5q5evp45cr8vpgkt822c7tgwvcpz0uazmcte56lrmqeaulul2yhz80jkmnx3ftk0pjdv8s5z8h6t"..."
        payment 5000000000 "addr_test1qraewa55q0pzafc2k5yzuv5q5evp45cr8vpgkt822c7tgwvcpz0uazmcte56lrmqeaulul2yhz80jkmnx3ftk0pjdv8s5z8h6t"
        sleep 3
        echo
        
        print_wrn " * 1.4.3 Transfering 5000 tADA to "addr_test1qq0qs9lkea302jwa9tv4aeu0wctmg0thsrgck9tvpg99527xsu5pg6vpeul8alq88x4qf3ayth26y7mxr65za5upg8gqg9k0gr"..."
        payment 5000000000 "addr_test1qq0qs9lkea302jwa9tv4aeu0wctmg0thsrgck9tvpg99527xsu5pg6vpeul8alq88x4qf3ayth26y7mxr65za5upg8gqg9k0gr"
        sleep 3
        echo
        
        print_wrn " * 1.4.4 Transfering 5000 tADA to "addr_test1qq6y2ugvp3lyjpz88h2fyfwt5p6yntf80eas3egnjs34rk0dtp6mg2897dvktay2afvkpxst9df0gd357xmj6l2nkhqsxfqp44"..."
        payment 5000000000 "addr_test1qq6y2ugvp3lyjpz88h2fyfwt5p6yntf80eas3egnjs34rk0dtp6mg2897dvktay2afvkpxst9df0gd357xmj6l2nkhqsxfqp44"
        sleep 3
        echo
        
        print_wrn " * 1.4.5 Transfering 5000 tADA to "addr_test1qqkad2hfzz8epl9068wu5wwnh22sse6resr28l86tu0k23f9ktmmynfgxdqlagsj7tsd7cx6qxy55c3xtqf4sv8e4etsgdn72t"..."
        payment 5000000000 "addr_test1qqkad2hfzz8epl9068wu5wwnh22sse6resr28l86tu0k23f9ktmmynfgxdqlagsj7tsd7cx6qxy55c3xtqf4sv8e4etsgdn72t"
        sleep 3
        echo
        
        print_wrn " * 1.4.6 Transfering 5000 tADA to "addr_test1qp8uzeqhpzr30yhg3hrlj8m43s20px4vy35nk8hnz5n4rqmsk7djxs38kntd5xp76d8jlrf8gyd4mzpuak8xmtdhw8mq80fzrp"..."
        payment 5000000000 "addr_test1qp8uzeqhpzr30yhg3hrlj8m43s20px4vy35nk8hnz5n4rqmsk7djxs38kntd5xp76d8jlrf8gyd4mzpuak8xmtdhw8mq80fzrp"
        sleep 3
        echo
        
        print_wrn " * 1.4.7 Transfering 5000 tADA to "addr_test1qrrzh54k4xansk73ddqhkvdaylgd65c4lm0vnmnhr0q9hwd8zd0t7p4734x8z0lulu8hgd0qdn8mw0nyg2a3w2rgrgpsh2cdnv"..."
        payment 5000000000 "addr_test1qrrzh54k4xansk73ddqhkvdaylgd65c4lm0vnmnhr0q9hwd8zd0t7p4734x8z0lulu8hgd0qdn8mw0nyg2a3w2rgrgpsh2cdnv"
        sleep 3
        echo
        
        print_wrn " * 1.4.8 Transfering 5000 tADA to "addr_test1qzgttwckfgsyku95qy93x3nknjfcu9rty3vaqn0zfgsl3wwz2dzcdc4ucgj6fk84yve32hhrhc8cuwu6uqa25yu7srxqkhh3t4"..."
        payment 5000000000 "addr_test1qzgttwckfgsyku95qy93x3nknjfcu9rty3vaqn0zfgsl3wwz2dzcdc4ucgj6fk84yve32hhrhc8cuwu6uqa25yu7srxqkhh3t4"
        sleep 3
        echo
        
        print_wrn " * 1.4.9 Transfering 5000 tADA to "addr_test1qq03n0r7nmsvpmxmurd4dc9uv2mae0r33783vna6smgmn7mrkzl4u6hlmqumhn4hgau8vawdvs02yj28pwx2yd3v2h0qdhhs9h"..."
        payment 5000000000 "addr_test1qq03n0r7nmsvpmxmurd4dc9uv2mae0r33783vna6smgmn7mrkzl4u6hlmqumhn4hgau8vawdvs02yj28pwx2yd3v2h0qdhhs9h"
        sleep 3
        echo
        
        print_wrn " * 1.4.10 Transfering 5000 tADA to "addr_test1qqy2cfuma49cxepf6rl4pj09nfsu752w4uun3cd2qktlex58sefnrqyyd82acva9xavul6xqmlp2aceyfzzjx74n5vxqg4l4nt"..."
        payment 5000000000 "addr_test1qqy2cfuma49cxepf6rl4pj09nfsu752w4uun3cd2qktlex58sefnrqyyd82acva9xavul6xqmlp2aceyfzzjx74n5vxqg4l4nt"
        sleep 3
        echo

        print_wrn " * 1.5.1 Create new DID (1)..."
        out="$(docker exec -it cardano-sidetree bash -c 'node ./examples/create-testIssuer.js')"
        new_did=$(echo "$out" | grep "DID" | grep -E -o "did:ada:.*" | tr -d '{}\n\r\" ')
        if [[ "$new_did" == "" ]]; then print_err "Error creating new DID"; print_err "Output: "; echo $out; print_err "END";  return 1; fi
        mkdir -pv "./did-keys"
        echo "$out" | sed 's/\x1B\[[0-9;]\{1,\}[A-Za-z]//g' > "./did-keys/"$new_did"_KEYS.json"
        print_wrn "Created new DID: $new_did"
        sleep 2
        echo

        print_wrn " * 1.5.2 Create new DID (2)..."
        out="$(docker exec -it cardano-sidetree bash -c 'AUTHKEYHEX=2222222222222222222222222222222222222222222222222222222222222222 node ./examples/create-testDid.js')"
        new_did=$(echo "$out" | grep "DID" | grep -E -o "did:ada:.*" | tr -d '{}\n\r\" ')
        if [[ "$new_did" == "" ]]; then print_err "Error creating new DID"; print_err "Output: "; echo $out; print_err "END";  return 1; fi
        mkdir -pv "./did-keys"
        echo "$out" | sed 's/\x1B\[[0-9;]\{1,\}[A-Za-z]//g' > "./did-keys/"$new_did"_KEYS.json"
        print_wrn "Created new DID: $new_did"
        sleep 2
        echo
        
        print_wrn " * 1.5.2 Create new DID (3)..."
        out="$(docker exec -it cardano-sidetree bash -c 'AUTHKEYHEX=3333333333333333333333333333333333333333333333333333333333333333 node ./examples/create-testDid.js')"
        new_did=$(echo "$out" | grep "DID" | grep -E -o "did:ada:.*" | tr -d '{}\n\r\" ')
        if [[ "$new_did" == "" ]]; then print_err "Error creating new DID"; print_err "Output: "; echo $out; print_err "END";  return 1; fi
        mkdir -pv "./did-keys"
        echo "$out" | sed 's/\x1B\[[0-9;]\{1,\}[A-Za-z]//g' > "./did-keys/"$new_did"_KEYS.json"
        print_wrn "Created new DID: $new_did"
        sleep 2
        echo

        print_wrn " * 1.6 Resolve DID $new_did..."
        for i in $(seq 1 60); do
            printf "\rWaiting for block confirmation... ($((i * 3))s / 180s) "
            sleep 2
            resolve=$( docker exec -it cardano-sidetree bash -c "curl http://localhost:3000/identifiers/$new_did" )
            status=$(echo $resolve | grep 'DID Not Found')
            if [[ "$status" == "" ]]; then echo OK; break; fi
        done
        print_wrn "Resolved:"
        echo "$resolve" | jq
        
        print_wrn " * 1.7 Create wallet addresses..."
        bash createWallets.sh

        echo
        print_wrn "DONE"
    fi
    
    if [[ $1 -eq 2 ]]; then
    	CARDANO_NODE_CONTAINER="$(docker ps -q -f "name=cardano-node1")"
    	if [[ "$CARDANO_NODE_CONTAINER" == "" ]]; then print_err "Error: cardano-node1 not running..."; return; fi
    	print_wrn " *** Scenario #1 *** "
    	echo
    	print_wrn " * 1.1 Perform benchmark..."
    	
    	docker exec -it $CARDANO_NODE_CONTAINER bash -c \
        "cardano-cli generate-txs"
            
    fi
}

function disable_ipv6_temp()
{
    print_wrn "Temporarily disabling ipv6..."
    sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
    sudo sysctl -w net.ipv6.conf.default.disable_ipv6=1
    sudo sysctl -w net.ipv6.conf.lo.disable_ipv6=1
}

function check_health()
{
    if [[ -z "$(docker ps -aq -f status=running -f name=cardano-node1)" ]]; then printf "N/A"; return -1; fi

    CONTAINERS="cardano-node1 cardano-db-sync-extended cardano-graphql cardano-sidetree cardano-faucet cardano-wallet1 cardano-submit-api ipfs"

    health=0
    for con in $CONTAINERS; do
        status="$(docker inspect --format='{{json .State.Health.Status}}' $con 2>/dev/null | tr -d '\"')"
        if [[ "$status" == "healthy" ]]; then result=0; else result=1; fi
        health=$((health + result))
    done

    if [[ $health -gt 0 ]]; then printf ERR; fi
    if [[ $health -eq 0 ]]; then printf OK; fi
    return $health
}

function showinfo()
{
    print_wrn "List containers..."
    watch docker ps
}

function print_network_status()
{
    echo
    if [[ "$HEALTH" == "OK" ]]; then BLOCK_STRING="block: $(query_tip ".block" -s)"; fi
    if [[ "$HEALTH" == "OK" ]]; then
        print_ok "Network status: $HEALTH, $BLOCK_STRING" ,
    elif [[ "$HEALTH" == "ERR" ]]; then
        print_err "Network status: $HEALTH"
    else
        print_wrn "Network status: $HEALTH"
    fi
}

function check_docker()
{
    #if [[ ! -z $(systemctl list-units --full -all | grep -Fq 'docker.service' || echo ERR) ]]; then
    if [[ ! -x "$(command -v docker)" ]]; then
        print_err "Docker not installed"
        exit 1
    fi
    if [[ "$(systemctl is-active docker)" == "inactive" ]]; then
        print_wrn "Docker service is inactive. Run it? (y/n) " ,
        read c
        if [[ "$c" == "y" ]]; then
            sudo systemctl start docker
        else
            exit 2
        fi
    fi
}

function main()
{
    COMMAND=$1 #( echo $1 | tr '[:upper:]' '[:lower:]' )
    ARG1=$2
    ARG2=$3

    check_docker
    HEALTH=$(check_health)

    if [[ "$COMMAND" == "" ]]; then
        print_title "*************************************"
        print_title "****** CARDANO PRIVATE NETWORK ******"
        print_title "*************************************"
        print_network_status
        printf "\ni)\tInstall\n\n"
        printf "1)\tStart\n"
        printf "2)\tStop\n"
        printf "3)\tRestart\n"
        printf "4)\tRemove\n"
        printf "5)\tReset\n"
        printf "\n"
        printf "6)\tGet current tip\n"
        printf "7)\tAttach to cardano-node1\n"
        printf "8)\tShow containers info\n"
        printf "\n"
        printf "n)\tCreate new address\n"
        printf "p)\tPerform payment\n"
        printf "c)\tCheck UTXO of address\n"
        printf "\n"
        printf "x)\tPerform user1 update\n"
        printf "y)\tCheck user1 address\n"
        printf "z)\tGive half to faucet\n"
        printf "w)\tExecute scenario #1\n"
        print_title "*************************************"
        echo; echo
        print_inf "Select: "
        read -n1 COMMAND
        COMMAND=$( echo $COMMAND | tr '[:upper:]' '[:lower:]' )
        #echo "Command: $COMMAND"
        ARG1="-d"
    fi
    echo; echo; echo

    if [[ "$COMMAND" == "install" || "$COMMAND" == "i" ]]; then install $ARG1;

    elif [[ "$COMMAND" == "start" || "$COMMAND" == "1" ]]; then start $ARG1;
    elif [[ "$COMMAND" == "stop" || "$COMMAND" == "2" ]]; then stop $ARG1;
    elif [[ "$COMMAND" == "restart" || "$COMMAND" == "3" ]]; then restart $ARG1;
    elif [[ "$COMMAND" == "remove" || "$COMMAND" == "4" ]]; then remove $ARG1;
    elif [[ "$COMMAND" == "reset" || "$COMMAND" == "5" ]]; then reset $ARG1;

    elif [[ "$COMMAND" == "querytip" || "$COMMAND" == "6" ]]; then query_tip;
    elif [[ "$COMMAND" == "attach" || "$COMMAND" == "7" ]]; then attach "cardano-node1";
    #elif [[ "$COMMAND" == "queryera" || "$COMMAND" == "8" ]]; then query_tip ".era";
    elif [[ "$COMMAND" == "showinf" || "$COMMAND" == "8" ]]; then showinfo;

    elif [[ "$COMMAND" == "newaddr" || "$COMMAND" == "n" ]]; then create_new_address $ARG1;
    elif [[ "$COMMAND" == "pay" || "$COMMAND" == "p" ]]; then payment $ARG1 $ARG2;
    elif [[ "$COMMAND" == "check" || "$COMMAND" == "c" ]]; then check $ARG1 $ARG2;

    elif [[ "$COMMAND" == "update1" || "$COMMAND" == "x" ]]; then update1;
    elif [[ "$COMMAND" == "check1" || "$COMMAND" == "y" ]]; then check1;
    elif [[ "$COMMAND" == "give1" || "$COMMAND" == "z" ]]; then give_half_to_faucet 0;
    elif [[ "$COMMAND" == "sc1" || "$COMMAND" == "w" ]]; then scenario 1;
    elif [[ "$COMMAND" == "sc2" || "$COMMAND" == "w" ]]; then scenario 2;

    else print_err "Unknown command: $COMMAND"; fi
}

main $@
