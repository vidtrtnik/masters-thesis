#!/bin/sh
set -e

echo "Logging"
export IPFS_LOGGING=debug

user=ipfs
repo="$IPFS_PATH"

if [ `id -u` -eq 0 ]; then
  echo "Changing user to $user"
  if [ ! -z $SWARM_KEY ]; then echo "HERE IS A KEY" && echo "$SWARM_KEY" > /root/swarm.key; fi
  # ensure folder is writable
  su-exec "$user" test -w "$repo" || chown -R -- "$user" "$repo"
  # restart script with new privileges
  exec su-exec "$user" "$0" "$@"
fi

# 2nd invocation with regular user
ipfs version

# if [ ! -e "$repo/swarm.key" ]; then echo "$SWARM_KEY" > $repo/swarm.key; fi
if [ ! -z $SWARM_KEY ]; then echo "$SWARM_KEY" > $repo/swarm.key; fi

if [ -e "$repo/config" ]; then
  echo "Found IPFS fs-repo at $repo"
else
  echo 'Initializing IPFS...'
  ipfs init
  ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
  ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
  echo 'Removing default bootstrap nodes...'
  ipfs bootstrap rm --all
fi

#ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:5001", "https://webui.ipfs.io"]'
#ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["GET", "POST"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Headers '["Authorization"]'
ipfs config --json API.HTTPHeaders.Access-Control-Expose-Headers '["Location"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Credentials '["true"]'

PEER_ID=$(ipfs config show | grep "PeerID")
echo "Peer ID: $PEER_ID"

#if [ ! -z $SWARM_PEER ]; then ipfs bootstrap add $SWARM_PEER; fi

# if the first argument is daemon
if [ "$1" = "daemon" ]; then
  # filter the first argument until
  # https://github.com/ipfs/go-ipfs/pull/3573
  # has been resolved
  shift
else
  # print deprecation warning
  # go-ipfs used to hardcode "ipfs daemon" in it's entrypoint
  # this workaround supports the new syntax so people start setting daemon explicitly
  # when overwriting CMD
  echo "DEPRECATED: arguments have been set but the first argument isn't 'daemon'" >&2
  echo "DEPRECATED: run 'docker run ipfs/go-ipfs daemon $@' instead" >&2
  echo "DEPRECATED: see the following PRs for more information:" >&2
  echo "DEPRECATED: * https://github.com/ipfs/go-ipfs/pull/3573" >&2
  echo "DEPRECATED: * https://github.com/ipfs/go-ipfs/pull/3685" >&2
fi

exec ipfs daemon "$@"
