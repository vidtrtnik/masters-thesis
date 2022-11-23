#FROM nixos/nix AS builder

#RUN git clone --recursive --depth=1 -b alonzo-wallet https://github.com/input-output-hk/cardano-faucet
#WORKDIR /cardano-faucet

#RUN echo 'experimental-features = nix-command flakes' | tee -a /etc/nix/nix.conf && \
#    echo 'allow-import-from-derivation = true' | tee -a /etc/nix/nix.conf && \
#    echo 'substituters = https://cache.nixos.org https://hydra.iohk.io' | tee -a /etc/nix/nix.conf && \
#    echo 'trusted-public-keys = iohk.cachix.org-1:DpRUyj7h7V830dp/i6Nti+NEO2/nhblbov/8MW7Rqoo= hydra.iohk.io:f/Ea+s+dFdN+3Y/G+FDgSq+a5NEWhJGzdjvKNGv0/EQ= cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY=' | #tee -a /etc/nix/nix.conf

#RUN nix-channel --update && \
#    nix-build --cores 16 default.nix

#RUN nix-channel --update && \
#    nix-build --cores 16 -A cardano-faucet

#FROM ubuntu:20.04
#COPY --from=builder /cardano-faucet/result/bin/cardano-faucet /usr/bin/
#CMD ["nix-shell", "shell.nix"]

FROM ubuntu:20.04
ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en' LC_ALL='en_US.UTF-8'

RUN apt update && apt upgrade -y && apt install --no-install-recommends -y jq expect nano wget curl locales xz-utils vim ca-certificates && \
    locale-gen en_US.UTF-8 && \
    mkdir -m 0755 /nix && groupadd -r nixbld && chown root /nix && \
    for n in $(seq 1 10); do useradd -c "Nix build user $n" -d /var/empty -g nixbld -G nixbld -M -N -r -s "$(command -v nologin)" "nixbld$n"; done

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN set -o pipefail && curl -L https://nixos.org/nix/install | bash
RUN echo "source /root/.nix-profile/etc/profile.d/nix.sh" >> "/root/.bashrc" && \
    mkdir -pv /etc/nix && \
    touch /etc/nix/nix.conf && \
    echo 'experimental-features = nix-command flakes' | tee -a /etc/nix/nix.conf && \
    echo 'allow-import-from-derivation = true' | tee -a /etc/nix/nix.conf && \
    echo 'substituters = https://cache.nixos.org https://hydra.iohk.io' | tee -a /etc/nix/nix.conf && \
    echo 'trusted-public-keys = iohk.cachix.org-1:DpRUyj7h7V830dp/i6Nti+NEO2/nhblbov/8MW7Rqoo= hydra.iohk.io:f/Ea+s+dFdN+3Y/G+FDgSq+a5NEWhJGzdjvKNGv0/EQ= cache.nixos.org-1:6NCHdD59X431o0gWypbMrAURkbJ16ZPMQFGspcDShjY=' | tee -a /etc/nix/nix.conf
ENV USER=root


RUN apt update && \
    apt install -y git && \
    git clone --recursive --depth=1 -b alonzo-wallet https://github.com/input-output-hk/cardano-faucet && \
    wget https://github.com/input-output-hk/cardano-wallet/releases/download/v2022-01-18/cardano-wallet-v2022-01-18-linux64.tar.gz
# ||
# COPY cardano-faucet.tar.gz cardano-wallet-v2022-01-18-linux64.tar.gz .
# RUN tar -xvf cardano-faucet.tar.gz

RUN tar -xvf cardano-wallet-v2022-01-18-linux64.tar.gz -C /opt && \
    rm cardano-wallet-v2022-01-18-linux64.tar.gz

WORKDIR /cardano-faucet
RUN source "/root/.nix-profile/etc/profile.d/nix.sh" && \
    nix-channel --update && \
    nix-build --cores 16 -A cardano-faucet && \
    mkdir -pv /opt/cardano-faucet && \
    cp /cardano-faucet/result/bin/cardano-faucet /opt/cardano-faucet/
    #cp /cardano-faucet/nix/nixos/create-faucet-wallet/create-faucet-wallet.sh /opt/cardano-faucet/

#RUN sed -i 's|@cardanoWallet@|/opt/cardano-wallet-v2022-01-18-linux64/cardano-wallet|g' /opt/cardano-faucet/create-faucet-wallet.sh && \
#    sed -i 's|@expect@|expect|g' /opt/cardano-faucet/create-faucet-wallet.sh && \
#    sed -i 's|@jq@|jq|g' /opt/cardano-faucet/create-faucet-wallet.sh && \
#    sed -i 's|Please enter a 15–24 word mnemonic sentence|Please enter a 15–24 word recovery phrase|g' /opt/cardano-faucet/create-faucet-wallet.sh && \
#    sed -i 's|reward|recovery|g' /opt/cardano-faucet/create-faucet-wallet.sh && \
#    sed -i 's|Please enter a 9–12 word mnemonic second factor|Please enter a 9–12 word second factor|g' /opt/cardano-faucet/create-faucet-wallet.sh

WORKDIR /opt/cardano-faucet
COPY cardano-faucet-create-wallet.sh .
CMD ["bash", "-c", "sleep 5; bash cardano-faucet-create-wallet.sh; ./cardano-faucet"]
