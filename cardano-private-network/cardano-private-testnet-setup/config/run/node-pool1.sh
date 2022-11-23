#!/usr/bin/env bash

cardano-node run \
  --config                          config/configuration.yaml \
  --topology                        config/node-pool1/topology.json \
  --database-path                   config/node-pool1/db \
  --socket-path                     'config/node-pool1/node.sock' \
  --shelley-kes-key                 config/node-pool1/shelley/kes.skey \
  --shelley-vrf-key                 config/node-pool1/shelley/vrf.skey \
  --shelley-operational-certificate config/node-pool1/shelley/node.cert \
  --port                            3003 \
  | tee -a config/node-pool1/node.log
