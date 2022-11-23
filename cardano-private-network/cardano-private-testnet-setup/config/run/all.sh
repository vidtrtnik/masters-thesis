#!/usr/bin/env bash

config/run/node-bft1.sh &
config/run/node-bft2.sh &
config/run/node-pool1.sh &

wait
