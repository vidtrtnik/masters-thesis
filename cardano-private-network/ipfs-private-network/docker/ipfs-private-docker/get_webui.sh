#!/bin/bash

IPGET_BIN=/home/user/test/ipget/ipget

function download_cid()
{
    $IPGET_BIN $1 -o $1
}

function create_tar_gz()
{
    tar czf $1.tar.gz $1
}

function get_ipfs_webui()
{
    download_cid $1
    create_tar_gz $1
}

get_ipfs_webui bafybeiednzu62vskme5wpoj4bjjikeg3xovfpp4t7vxk5ty2jxdi4mv4bu #v2.15.0

get_ipfs_webui bafybeiet6eoo4vjqev7cj5qczqwk6f7ao6pjtmj3uu3kfezldugi5eizei #v2.14.0

get_ipfs_webui bafybeihcyruaeza7uyjd6ugicbcrqumejf6uf353e5etdkhotqffwtguva #v2.13.0

get_ipfs_webui bafybeiflkjt66aetfgcrgvv75izymd5kc47g6luepqmfq6zsf5w6ueth6y #v2.12.4
