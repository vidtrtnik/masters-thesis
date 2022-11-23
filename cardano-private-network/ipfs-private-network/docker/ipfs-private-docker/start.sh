#!/bin/sh

echo '/key/swarm/psk/1.0.0/' > $IPFS_PATH/swarm.key
echo '/base16/' >> $IPFS_PATH/swarm.key
echo "$SWARM_KEY" >> $IPFS_PATH/swarm.key

SWARM_KEY_CONTENT=$(cat $IPFS_PATH/swarm.key)
#cat $SWARM_KEY_CONTENT
export IPFS_SWARM_KEY=$SWARM_KEY #$(sed -E ':a;N;$!ba;s/\r{0,1}\n/\\n/g' $IPFS_PATH/swarm.key)

ipfs init #--profile server

tar -xf /webui/bafybeiednzu62vskme5wpoj4bjjikeg3xovfpp4t7vxk5ty2jxdi4mv4bu.tar.gz -C webui
tar -xf /webui/bafybeiet6eoo4vjqev7cj5qczqwk6f7ao6pjtmj3uu3kfezldugi5eizei.tar.gz -C webui
tar -xf /webui/bafybeiflkjt66aetfgcrgvv75izymd5kc47g6luepqmfq6zsf5w6ueth6y.tar.gz -C webui
tar -xf /webui/bafybeihcyruaeza7uyjd6ugicbcrqumejf6uf353e5etdkhotqffwtguva.tar.gz -C webui
tar -xf /webui/Qmexhq2sBHnXQbvyP2GfUdbnY7HCagH2Mw5vUNSBn2nxip.tar.gz -C webui

ipfs add -r /webui/bafybeiednzu62vskme5wpoj4bjjikeg3xovfpp4t7vxk5ty2jxdi4mv4bu
ipfs add -r /webui/bafybeiet6eoo4vjqev7cj5qczqwk6f7ao6pjtmj3uu3kfezldugi5eizei
ipfs add -r /webui/bafybeiflkjt66aetfgcrgvv75izymd5kc47g6luepqmfq6zsf5w6ueth6y
ipfs add -r /webui/bafybeiednzu62vskme5wpoj4bjjikeg3xovfpp4t7vxk5ty2jxdi4mv4bu
ipfs add -r /webui/bafybeihcyruaeza7uyjd6ugicbcrqumejf6uf353e5etdkhotqffwtguva
ipfs add -r /webui/Qmexhq2sBHnXQbvyP2GfUdbnY7HCagH2Mw5vUNSBn2nxip

ipfs config Addresses.API /ip4/0.0.0.0/tcp/$API_PORT
ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/$GATEWAY_PORT

ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization"]'
ipfs config --json API.HTTPHeaders.Access-Control-Expose-Headers '["Location"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'
ipfs config --json Experimental.UrlstoreEnabled true
ipfs config --json Experimental.FilestoreEnabled true

ipfs bootstrap rm --all
if [[ $FIRST_NODE -eq 1 ]]; then
    PEER_ID=$(ipfs config show | grep "PeerID" | tr -d ' "' | cut -d':' -f2)
    IP=$(hostname -i)
    SWARM_ADD_STRING="/ip4/$IP/tcp/4001/ipfs/$PEER_ID"
    printf $SWARM_ADD_STRING > /ipfs-common/swarm_add_string

else
    while true; do
        echo "Waiting for bootstrap node..."
        sleep 3
        if [[ -f "/ipfs-common/swarm_add_string" ]]; then echo OK; break; fi

    done

    SWARM_ADD_STRING=$(cat "/ipfs-common/swarm_add_string")
fi

ipfs bootstrap add $SWARM_ADD_STRING
echo "---------------------------------"
echo "P.ID: $PEER_ID"
echo "IPFS_SWARM_KEY: $SWARM_KEY_CONTENT"
echo "---------------------------------"

ipfs daemon --enable-gc
