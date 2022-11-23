FROM nixos/nix:2.9.2

RUN echo 'substituters = https://hydra.iohk.io https://iohk.cachix.org https://cache.nixos.org/' > /etc/nix/nix.conf && \
    echo 'trusted-public-keys = hydra.iohk.io:f/Ea+s+dFdN+3Y/G+FDgSq+a5NEWhJGzdjvKNGv0/EQ= iohk.cachix.org-1:DpRUyj7h7V830dp/i6Nti+NEO2/nhblbov/8MW7Rqoo= cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY=volume' >> /etc/nix/nix.conf && \
    echo 'experimental-features = nix-command flakes' >> /etc/nix/nix.conf && \
    echo 'allow-import-from-derivation = true' >> /etc/nix/nix.conf && \
    git clone --recursive --depth=1 https://github.com/input-output-hk/plutus-apps && \
    cd plutus-apps && \
    nix-channel --update && \
    nix-build --cores 16 -A plutus-playground.server -A plutus-playground.client && \
    nix-shell && \
    nix-shell --command 'cd plutus-playground-client && npm install'

# ||
# COPY plutus-apps.tar.gz .
# RUN tar -xvf plutus-apps.tar.gz

WORKDIR /plutus-apps

#WORKDIR /plutus-apps/plutus-playground-client
#RUN cd plutus-playground-client && nix-shell --command 'npm install'
#RUN nix-build --quiet --no-build-output ../default.nix -A plutus-apps.haskell.packages.plutus-playground-server.components.exes.plutus-playground-server

#WORKDIR /plutus-apps
#RUN source /nix/var/nix/profiles/default/etc/profile.d/nix.sh && CG_DONT_GC=1 nix-shell --command plutus-playground-server

#WORKDIR /plutus-apps/plutus-playground-server
#RUN cd /plutus-apps/plutus-playground-server && screen -d -m -S server /nix/store/jp9q9shdyh5c9r8ziizycpr20vm6vlvw-plutus-playground-server/bin/plutus-playground-server

#WORKDIR /plutus-apps
#CMD ["bash", "-c", "cd plutus-playground-client && nix-shell --command 'npm run start'"]
COPY start.sh .
CMD ["bash", "start.sh"]
