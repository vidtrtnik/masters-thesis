#!/bin/bash

docker run --rm golang:1.9 sh -c 'go get github.com/Kubuxu/go-ipfs-swarm-key-gen/ipfs-swarm-key-gen && ipfs-swarm-key-gen' > swarm.key
