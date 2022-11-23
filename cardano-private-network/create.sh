#!/bin/sh

CONF_DIR="$1"
if [[ "$CONF_DIR" == "" ]]; then CONF_DIR="config"; fi

TESTNET_SETUP_PROJECT="$PWD/cardano-private-testnet-setup"
ROOT="$TESTNET_SETUP_PROJECT/$CONF_DIR"

function fix_config()
{
    NUM=$1
    EKG_PORT=$2
    PROM_PORT=$3
    SOC_PORT=$4
    SOC_HOST=$5

    cp ${ROOT}/configuration.yaml ${ROOT}/configuration$NUM.yaml
    sed -i "s/{EKG_PORT}/$EKG_PORT/g" ${ROOT}/configuration$NUM.yaml
    sed -i "s/{PROM_PORT}/$PROM_PORT/g" ${ROOT}/configuration$NUM.yaml
    sed -i "s/{SOC_PORT}/$SOC_PORT/g" ${ROOT}/configuration$NUM.yaml
    sed -i "s/{SOC_HOST}/$SOC_HOST/g" ${ROOT}/configuration$NUM.yaml
}

function fix_topology()
{
    NODE_NAME=$1
    ADDR1=$2
    PORT1=$3
    ADDR2=$4
    PORT2=$5

    cp configuration/topologyTemplate.json ${ROOT}/$NODE_NAME/topology.json
    sed -i "s/{ADDR1}/$ADDR1/g" ${ROOT}/$NODE_NAME/topology.json
    sed -i "s/{PORT1}/$PORT1/g" ${ROOT}/$NODE_NAME/topology.json
    sed -i "s/{ADDR2}/$ADDR2/g" ${ROOT}/$NODE_NAME/topology.json
    sed -i "s/{PORT2}/$PORT2/g" ${ROOT}/$NODE_NAME/topology.json
}

function main()
{
    echo "Root folder: $ROOT"
    rm -rf $ROOT

    echo "Copying configuration template..."
    cp config-templates/configurationTemplate.yaml $TESTNET_SETUP_PROJECT/configuration/defaults/byron-mainnet/configuration.yaml
    cp config-templates/topologyTemplate.json $TESTNET_SETUP_PROJECT/configuration/

    echo "Changing root directory name..."
    sed -i "s/ROOT=.*/ROOT=$CONF_DIR/g" $TESTNET_SETUP_PROJECT/scripts/config.cfg

    cd $TESTNET_SETUP_PROJECT
    echo "PWD: $PWD"

    echo "Running mkfiles.sh..." && sleep 1
    bash scripts/mkfiles.sh alonzo

    cp templates/db-sync-config-template.yaml $ROOT/configurationDB.yaml

    fix_config "1" "12718" "12719" "3331" "cardano-rt-view"
    fix_config "2" "12728" "12729" "3332" "cardano-rt-view"
    fix_config "3" "12738" "12739" "3333" "cardano-rt-view"

    fix_topology "node-bft1" "cardano-node2" "3002" "cardano-node3" "3003"
    fix_topology "node-bft2" "cardano-node1" "3001" "cardano-node3" "3003"
    fix_topology "node-pool1" "cardano-node1" "3001" "cardano-node2" "3002"
}

main $@
