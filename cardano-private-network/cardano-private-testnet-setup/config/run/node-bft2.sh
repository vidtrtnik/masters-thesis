#!/usr/bin/env bash

cardano-node run \
  --config                          config/configuration.yaml \
  --topology                        config/node-bft2/topology.json \
  --database-path                   config/node-bft2/db \
  --socket-path                     'config/node-bft2/node.sock' \
  --shelley-kes-key                 config/node-bft2/shelley/kes.skey \
  --shelley-vrf-key                 config/node-bft2/shelley/vrf.skey \
  --shelley-operational-certificate config/node-bft2/shelley/node.cert \
  --port                            3002 \
  --delegation-certificate          config/node-bft2/byron/delegate.cert \
  --signing-key                     config/node-bft2/byron/delegate.key \
  | tee -a config/node-bft2/node.log
