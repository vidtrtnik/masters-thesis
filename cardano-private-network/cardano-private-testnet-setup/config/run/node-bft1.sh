#!/usr/bin/env bash

cardano-node run \
  --config                          config/configuration.yaml \
  --topology                        config/node-bft1/topology.json \
  --database-path                   config/node-bft1/db \
  --socket-path                     'config/node-bft1/node.sock' \
  --shelley-kes-key                 config/node-bft1/shelley/kes.skey \
  --shelley-vrf-key                 config/node-bft1/shelley/vrf.skey \
  --shelley-operational-certificate config/node-bft1/shelley/node.cert \
  --port                            3001 \
  --delegation-certificate          config/node-bft1/byron/delegate.cert \
  --signing-key                     config/node-bft1/byron/delegate.key \
  | tee -a config/node-bft1/node.log
