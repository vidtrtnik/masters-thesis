#!/bin/bash
#sudo dnf remove docker \
#                  docker-client \
#                  docker-client-latest \
#                  docker-common \
#                  docker-latest \
#                  docker-latest-logrotate \
#                  docker-logrotate \
#                  docker-selinux \
#                  docker-engine-selinux \
#                  docker-engine

echo Tested on Fedora Workstation 36 only

echo Installing NodeJS
sudo dnf -y install nodejs npm

echo Installing Chromium
sudo dnf -y install chromium

echo Installing Docker
sudo dnf -y install dnf-plugins-core
sudo dnf config-manager \
    --add-repo \
    https://download.docker.com/linux/fedora/docker-ce.repo

sudo dnf install docker-ce-3:20.10.17-3.fc36 docker-ce-cli-1:20.10.17-3.fc36 containerd.io-1.6.6-3.1.fc36 docker-compose-plugin-2.6.0-3.fc36
#sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
#sudo dnf install -y docker-compose

echo $USER
sudo usermod -aG docker $USER

echo Restart PC or Logout and log in again
