const { WalletServer, AssetWallet, TokenWallet, AddressWallet, Seed } = require('cardano-wallet-js');
const { GQL_QUERY_GETMETADATAS } = require('../queries/gqlQueries.js');
const axios = require('axios');

async function pickWallet(wallets) {
  var passphrase = null;
  var wallet_id = null;

  while (passphrase === null) {
    var r = 1 + Math.floor(Math.random() * 10);
    for (const w of wallets) {
      await w.refresh();
      var b = await w.getAvailableBalance();
      if (w.name == "ShelleyWallet01") {
        wallet_id = w.id;
        if (r == 1 && b > 1000000) {
          passphrase = "ShelleyWallet01Passphrase";
          break;
        }
      }

      if (w.name == "ShelleyWallet02") {
        wallet_id = w.id;
        if (r == 2 && b > 1000000) {
          passphrase = "ShelleyWallet02Passphrase";
          break;
        }
      }

      if (w.name == "ShelleyWallet03") {
        wallet_id = w.id;
        if (r == 3 && b > 1000000) {
          passphrase = "ShelleyWallet03Passphrase";
          break;
        }
      }

      if (w.name == "ShelleyWallet04") {
        wallet_id = w.id;
        if (r == 4 && b > 1000000) {
          passphrase = "ShelleyWallet04Passphrase";
          break;
        }
      }

      if (w.name == "ShelleyWallet05") {
        wallet_id = w.id;
        if (r == 5 && b > 1000000) {
          passphrase = "ShelleyWallet05Passphrase";
          break;
        }
      }

      if (w.name == "ShelleyWallet06") {
        wallet_id = w.id;
        if (r == 6 && b > 1000000) {
          passphrase = "ShelleyWallet06Passphrase";
          break;
        }
      }

      if (w.name == "ShelleyWallet07") {
        wallet_id = w.id;
        if (r == 7 && b > 1000000) {
          passphrase = "ShelleyWallet07Passphrase";
          break;
        }
      }

      if (w.name == "ShelleyWallet08") {
        wallet_id = w.id;
        if (r == 8 && b > 1000000) {
          passphrase = "ShelleyWallet08Passphrase";
          break;
        }
      }

      if (w.name == "ShelleyWallet09") {
        wallet_id = w.id;
        if (r == 9 && b > 1000000) {
          passphrase = "ShelleyWallet09Passphrase";
          break;
        }
      }

      if (w.name == "ShelleyWallet10") {
        wallet_id = w.id;
        if (r == 10 && b > 1000000) {
          passphrase = "ShelleyWallet10Passphrase";
          break;
        }
      }
    }

    return { wallet_id: wallet_id, passphrase: passphrase }
  }
}

async function getWallet(wallet_server, wallet_name) {
  let walletServer = WalletServer.init(wallet_server);

  let wallets = await walletServer.wallets();
  var wallet_id = null;
  for (const w of wallets) {
    if (w.name == wallet_name) {
      wallet_id = w.id;
    }
  }
  console.log("ShelleyFaucetWallet ID: ", wallet_id);
  let wallet = await walletServer.getShelleyWallet(wallet_id);

  return wallet;
}

async function sendNFT(policyId, address) {
  console.log("sendNFT...");
  console.log(policyId);

  let walletServer = WalletServer.init(process.env.WALLET_SERVER);
  let info = await walletServer.getNetworkInformation();
  let ttl = info.node_tip.absolute_slot_number * 12000;

  var wallet = await getWallet(process.env.WALLET_SERVER, process.env.WALLET_NAME);

  let amounts = [1344798];

  let addresses = [new AddressWallet(address)];
  let asset = new AssetWallet(policyId, process.env.TOKEN_NAME, 1);

  let assets = {};
  assets[addresses[0].id] = [asset];

  let data = [];
  let coinSelection = await wallet.getCoinSelection(addresses, amounts, data, assets);
  console.log(coinSelection)

  var rootKey;
  var signingKeys;
  try {
    rootKey = Seed.deriveRootKey(process.env.WALLET_PASSPHRASE_RECOVERY.split());
    signingKeys = coinSelection.inputs.map(i => {
      let privateKey = Seed.deriveKey(rootKey, i.derivation_path).to_raw_key();
      return privateKey;
    });
  } catch { }
  let metadata = Seed.buildTransactionMetadata(data);
  let txBuild = Seed.buildTransaction(coinSelection, ttl, { metadata: metadata });
  let txBody = Seed.sign(txBuild, signingKeys, metadata);
  let signed = Buffer.from(txBody.to_bytes()).toString('hex');
  let txId;

  try {
    txId = await walletServer.submitTx(signed);
  } catch { }

  return txId;
}

async function mintNFT(address) {
  console.log("mintNFT...")
  console.log(address)

  let walletServer = WalletServer.init(process.env.WALLET_SERVER);

  let info = await walletServer.getNetworkInformation();
  let ttl = info.node_tip.absolute_slot_number * 12000;

  let wallets = await walletServer.wallets();
  //console.log("wallets:");
  //console.log(wallets);

  var wallet_id = null;
  for (const w of wallets) {
    if (w.name == process.env.WALLET_NAME) {
      wallet_id = w.id;
    }
  }
  console.log("ShelleyFaucetWallet ID: ", wallet_id);
  let wallet = await walletServer.getShelleyWallet(wallet_id);
  //console.log(wallet);

  let addresses = (await wallet.getUnusedAddresses()).slice(0, 1);


  let rootKey = Seed.deriveRootKey(process.env.WALLET_PASSPHRASE_RECOVERY.split());
  let accountKey = Seed.deriveAccountKey(rootKey, 0);
  const key = accountKey.to_public();

  let pair = {
    privateKey: accountKey,
    publicKey: key
  }

  let keyHash = Seed.getKeyHash(key);
  let script = Seed.buildSingleIssuerScript(keyHash);

  let scriptHash = Seed.getScriptHash(script);
  let policyId = Seed.getPolicyId(scriptHash);

  let data = {};

  let tokenData = {
    [policyId]: {
      [process.env.TOKEN_NAME]: {
        "name": process.env.TOKEN_NAME,
        "image": address
      }
    }
  }

  data["721"] = tokenData;

  let asset = new AssetWallet(policyId, process.env.TOKEN_NAME, 1);

  let tokens = [new TokenWallet(asset, script, [pair])];

  let scripts = tokens.map(t => t.script);

  let amounts = [1344798];
  console.log(amounts);

  let coinSelection = await wallet.getCoinSelection(addresses, amounts, data);

  let signingKeys = coinSelection.inputs.map(i => {
    let privateKey = Seed.deriveKey(rootKey, i.derivation_path).to_raw_key();
    return privateKey;
  });

  tokens.filter(t => t.scriptKeyPairs).forEach(t => signingKeys.push(...t.scriptKeyPairs.map(k => k.privateKey.to_raw_key())));
  console.log(tokens);
  let metadata = Seed.buildTransactionMetadata(data);

  coinSelection.outputs = coinSelection.outputs.map(output => {
    if (output.address === addresses[0].address) {
      output.assets = tokens.map(t => {
        let asset = {
          policy_id: t.asset.policy_id,
          asset_name: process.env.TOKEN_NAME,
          quantity: t.asset.quantity
        };
        return asset;
      });
    }
    return output;
  });

  let txBody = Seed.buildTransactionWithToken(coinSelection, ttl, tokens, signingKeys, { data: data });
  let tx = Seed.sign(txBody, signingKeys, metadata, scripts);

  let signed = Buffer.from(tx.to_bytes()).toString('hex');
  let txId = await walletServer.submitTx(signed);

  //console.log(txId)

  return policyId;

}

async function getTransactionsWithLabel(cardanoGraphqlServer, labelArg) {
  const resp = await axios.post(
    cardanoGraphqlServer,
    {
      query: GQL_QUERY_GETMETADATAS,
      variables: {
        count: 1000,
        offset: 0,
        label: labelArg
      }
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  return resp;
}

async function createAndSignTransaction3(usedvaccine, label) {
  let walletServer = WalletServer.init(process.env.WALLET_SERVER);

  let wallets = await walletServer.wallets();
  var wallet_id = null;
  for (const w of wallets) {
    if (w.name == process.env.WALLET_NAME) {
      wallet_id = w.id;
    }
  }
  console.log("ShelleyFaucetWallet ID: ", wallet_id);
  let wallet = await walletServer.getShelleyWallet(wallet_id);

  console.log(wallet);

  let addresses = (await wallet.getUnusedAddresses()).slice(0, 1);
  let amounts = [1000000];

  let info = await walletServer.getNetworkInformation();
  let ttl = info.node_tip.absolute_slot_number * 12000;

  let data = { [label]: { 0: usedvaccine } };
  console.log(data)
  let coinSelection = await wallet.getCoinSelection(addresses, amounts, data);

  let rootKey = await Seed.deriveRootKey(process.env.WALLET_PASSPHRASE_RECOVERY.split());
  let signingKeys = await coinSelection.inputs.map(i => {
    let privateKey = Seed.deriveKey(rootKey, i.derivation_path).to_raw_key();
    return privateKey;
  });
  let metadata = Seed.buildTransactionMetadata(data);
  let txBuild = Seed.buildTransaction(coinSelection, ttl, { metadata: metadata });
  let txBody = Seed.sign(txBuild, signingKeys, metadata);

  let signed = Buffer.from(txBody.to_bytes()).toString('hex');
  //console.log(signed);
  let txId = await walletServer.submitTx(signed);
  console.log(txId);

  return txId;
};




async function createAndSignTransaction(additionalData, issuerDid, label, action, qr_path1 = null, qr_path2 = null) {

  var chunks = [];
  const maxLen = 64;
  for (var i = 0, charsLength = additionalData.length; i < charsLength; i += maxLen) {
    chunks.push(additionalData.substring(i, i + maxLen));
  }

  let data = { [label]: { 0: issuerDid, 1: action, 2: chunks, 3: qr_path1, 4: qr_path2 } };


  let walletServer = WalletServer.init(process.env.WALLET_SERVER);

  let wallets = await walletServer.wallets();
  //console.log("wallets:");
  //console.log(wallets);

  var selectedWallet = await pickWallet(wallets);
  console.log(selectedWallet)
  var wallet_id = selectedWallet["wallet_id"]
  var passphrase = selectedWallet["passphrase"]

  console.log("ShelleyWallet ID: ", wallet_id, " ", "Passphrase: ", passphrase);
  let wallet = await walletServer.getShelleyWallet(wallet_id);
  //console.log(wallet);

  let address = await wallet.getNextAddress();
  //let address = (await wallet.getUsedAddresses()).slice(0, 1);
  console.log(address);

  //let address2 = address.id;
  //console.log(address2);

  let receiverAddress = [new AddressWallet(address.id)];
  //let receiverAddress = address;
  let amounts = [0];

  let transaction = await wallet.sendPayment(passphrase, receiverAddress, amounts, data);
  return transaction.id;
};



async function createAndSignTransaction2(vacdata, dosage, label, action) {
  console.log("createAndSignTransaction2");
  let data = { [label]: { 0: action, 1: vacdata, 2: dosage } };

  var recovery_phrase = null;
  var passphrase = null;

  let walletServer = WalletServer.init(process.env.WALLET_SERVER);
  let wallets = await walletServer.wallets();
  //console.log("wallets:");
  //console.log(wallets);

  var wallet_id = null;

  var selectedWallet = await pickWallet(wallets);
  console.log(selectedWallet)
  var wallet_id = selectedWallet["wallet_id"]
  var passphrase = selectedWallet["passphrase"]

  console.log("ShelleyWallet ID: ", wallet_id, " ", "Passphrase: ", passphrase);
  let wallet = await walletServer.getShelleyWallet(wallet_id);
  //console.log(wallet);

  let address = await wallet.getNextAddress();
  //let address = (await wallet.getUsedAddresses()).slice(0, 1);
  //console.log(address);

  //let address2 = address.id;
  //console.log(address2);

  let receiverAddress = [new AddressWallet(address.id)];
  //let receiverAddress = address;
  let amounts = [0];

  let transaction = await wallet.sendPayment(passphrase, receiverAddress, amounts, data);
  return transaction.id;
};


module.exports = {
  mintNFT,
  sendNFT,
  getTransactionsWithLabel,
  createAndSignTransaction,
  createAndSignTransaction2,
  createAndSignTransaction3
}


/*
async function createAndSignTransaction2_OLD(server, vacdata, dosage, label, action) {
    let walletServer = WalletServer.init(server);

    var recovery_phrase = ["slab","praise","suffer","rabbit","during","dream","arch","harvest","culture","book","owner","loud","wool","salon","table","animal","vivid","arrow","dirt","divide","humble","tornado","solution","jungle"];
    var passphrase = "ShelleyFaucetWalletPassphrase";
    var name = "ShelleyFaucetWallet";
    let wallets = await walletServer.wallets();
    var wallet_id = null;
    for(const w of wallets) {
        if(w.name == "ShelleyFaucetWallet") {
            wallet_id = w.id;
        }
    }
    console.log("ShelleyFaucetWallet ID: ", wallet_id);
    let wallet = await walletServer.getShelleyWallet(wallet_id);
    
    console.log(wallet);
    
    let addresses = (await wallet.getUnusedAddresses()).slice(0, 1);
    let amounts = [1000000];
    
    let info = await walletServer.getNetworkInformation();
    let ttl = info.node_tip.absolute_slot_number * 12000;
    
    let data = {[label]:{0: action, 1:vacdata, 2: dosage}};
    console.log(data)
    let coinSelection = await wallet.getCoinSelection(addresses, amounts, data);
    
    let rootKey = await Seed.deriveRootKey(recovery_phrase);
    let signingKeys = await coinSelection.inputs.map(i => {
        let privateKey = Seed.deriveKey(rootKey, i.derivation_path).to_raw_key();
        return privateKey;
    });
    let metadata = Seed.buildTransactionMetadata(data);
    let txBuild = Seed.buildTransaction(coinSelection, ttl, {metadata: metadata});
    let txBody = Seed.sign(txBuild, signingKeys, metadata);
    
    let signed = Buffer.from(txBody.to_bytes()).toString('hex');
    //console.log(signed);
    let txId = await walletServer.submitTx(signed);
    console.log(txId);
    
    return txId;
    };

    */