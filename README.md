# masters-thesis
Code repository for my master's thesis

## Description
This repository contains all Docker specifications and scripts to setup local Cardano network for testing. It also contains source code for the Cardano Vaccinator project, Vaccinator Helper extension and didcomm-server.

Visualization of the network:
![Alt text](/screenshots/layout.jpg?raw=true "Visualization of the network using docker-compose-viz")

## Instructions
Confirmed working on Fedora Workstation 36

#### 0. Clone this repository
```bash
git clone git@github.com:vidtrtnik/trtnik-thesis-bma-test.git

cd trtnik-thesis-bma-test
```

#### 1. Run the setup script and restart PC
```bash
bash setup.sh

reboot now
```

#### 2. Run the private Cardano network
```bash
cd cardano-private-network

bash cardano-private-network.sh install

bash cardano-private-network.sh #Select 5 (Reset)

# Wait until network is ready (cca. 2 minutes)
# (If network is still not ready after 5 minutes, perform "Reset" again)

bash cardano-private-network.sh #Select 'w' (prepare environment)

# If new DID is shown at the end, the network is successfully prepared.
```

#### 3. Run the Cardano Vaccinator (Backend and frontend)
```bash
cd cardano-vaccination-js

npm i

npm run dev

cd client

npm i

npm start
```

#### 4. Install the Cardano Vaccinator Helper Extension
```bash
# Tested on Chromium only

# Go to Extensions - Enable Developer Mode - Load Unpacked - Select folder cardano-vaccinator-extension
```

## Videos
Central authority: User registration, vaccine management - https://youtu.be/UHReUt75YXI 

Vaccination Centre: Issuing VC on blockchain - https://youtu.be/QQYLKxmpYNU

Vaccination Centre / Holder: Issuing VC using DID-to-DID - https://youtu.be/fBxQybH1gDc

Holder: Issuing VP on blockchain - https://youtu.be/NGxVMH1qdb8

Verifier: verification using blockchain - https://youtu.be/h3Uc1u-NUfE

Verifier / Holder: verification using DID-to-DID: https://youtu.be/7YqC99A7JI4

Vaccination Centre: VC revocation - https://youtu.be/7ln2cNYJ18o
