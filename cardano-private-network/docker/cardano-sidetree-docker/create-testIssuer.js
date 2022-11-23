/**  Example on how to create a DID */
(async () => {
  const IonSdk = require('@decentralized-identity/ion-sdk');
  const randomBytes = require('randombytes');
  const ed25519 = require('@transmute/did-key-ed25519');
  const secp256k1 = require('@transmute/did-key-secp256k1');
  const x25519kp = require('@transmute/x25519-key-pair');
  const request = require('request');
  const util = require('util');

  const requestPromise = util.promisify(request);

  const nodeURL = 'http://localhost:3000';
  //const nodeURL = 'https://testnet.sidetree-cardano.com/cardano';

  const issuerPrivateKeyOverride = "1111111111111111111111111111111111111111111111111111111111111111";
  const keys = await generateKeys(issuerPrivateKeyOverride);
  const keys2 = await generateKeys2(issuerPrivateKeyOverride);
  const authKeyPair = keys.authKeyPair;
  const updateKeyPair = keys.updateKeyPair;
  const recoveryKeyPair = keys.recoveryKeyPair;
  const agreKeyPair = keys2.aggreementKeyPair;


  // Create you rW3C DID document
  const didDocument = {
    publicKeys: [
      {
        id: 'key-1',
        type: 'EcdsaSecp256k1VerificationKey2019',
        publicKeyJwk: authKeyPair.publicKeys.jwk,
        purposes: ['authentication']
      },
      {
        id: 'key-2',
        type: 'X25519KeyAgreementKey2019',
        publicKeyJwk: agreKeyPair.publicKeys.jwk,
        purposes: ['authentication']
      }
    ],
    services: [
      {
        id: 'domain-1',
        type: 'LinkedDomains',
        serviceEndpoint: 'https://foo.example.com'
      }
    ]
  };

  // Create the request body ready to be posted in /operations of Sidetree API
  const createRequest = await IonSdk.IonRequest.createCreateRequest({
    recoveryKey: recoveryKeyPair.publicKeys.jwk,
    updateKey: updateKeyPair.publicKeys.jwk,
    document: didDocument
  });
  //console.log('POST operation: ' + JSON.stringify(createRequest));

  // POST request body to Sidetree-Cardano node API
  const resp = await requestPromise({
    url: nodeURL + '/operations',
    method: 'POST',
    body: JSON.stringify(createRequest)
  });
  const respBody = JSON.parse(resp.body);
  //console.log(JSON.stringify(respBody));

  console.log('{ "DID": ' + "\"" + respBody.didDocument.id + "\"");
  console.log(', "KEYS":');
  console.log(JSON.stringify(keys, null, 2));
  console.log(",");
  console.log(JSON.stringify(keys2, null, 2).slice(1,-1));
  console.log('}');


  async function getHexKeyPair(kp) {
      return {
        privateKeyHex: Buffer.from(kp.privateKeyBuffer, "base64").toString("hex"),
        publicKeyHex: Buffer.from(kp.publicKeyBuffer, "base64").toString("hex")
      }
    }
    
 async function getHexKeyPair2(kp) {
      return {
        privateKeyHex: Buffer.from(kp.privateKey, "base64").toString("hex"),
        publicKeyHex: Buffer.from(kp.publicKey, "base64").toString("hex")
      }
    }
    
async function genKeyPair2 (randomBytesOverride) {
      let keyGenerator = x25519kp.X25519KeyPair;
      //console.log(keyGenerator)
//console.log(randomBytesOverride);
      var keyPair = null;
      if(typeof randomBytesOverride === 'undefined') {
        keyPair = await keyGenerator.generate({secureRandom: () => randomBytes(32)});
      }
      else {
        keyPair = await keyGenerator.generate({secureRandom: () => {return Buffer.from(randomBytesOverride, 'hex')}});
      }

      const { publicKeyJwk, privateKeyJwk } = await keyPair.export({
        type: 'JsonWebKey2020',
        privateKey: true,
      });

      const { publicKeyHex, privateKeyHex } = await getHexKeyPair2(keyPair);

        return {
          privateKeys: {
            jwk: privateKeyJwk,
            hex: privateKeyHex,
            buf: keyPair.privateKey
          },
          publicKeys: {
            jwk: publicKeyJwk,
            hex: publicKeyHex,
            buf: keyPair.publicKey
          }
        };    }
        
  async function genKeyPair (randomBytesOverride) {
      let keyGenerator = secp256k1.Secp256k1KeyPair;

      var keyPair = null;
      if(typeof randomBytesOverride === 'undefined') {
        keyPair = await keyGenerator.generate({secureRandom: () => randomBytes(32)});
      }
      else {
        keyPair = await keyGenerator.generate({secureRandom: () => {return Buffer.from(randomBytesOverride, 'hex')}});
      }

      const { publicKeyJwk, privateKeyJwk } = await keyPair.toJsonWebKeyPair(true);

      const { publicKeyHex, privateKeyHex } = await getHexKeyPair(keyPair);

        return {
          privateKeys: {
            jwk: privateKeyJwk,
            hex: privateKeyHex,
            buf: keyPair.privateKeyBuffer
          },
          publicKeys: {
            jwk: publicKeyJwk,
            hex: publicKeyHex,
            buf: keyPair.publicKeyBuffer
          }
        };
    }
    
async function generateKeys2(override) {
      const agreementKP = await genKeyPair2(override);

      return {
          aggreementKeyPair: agreementKP,
      };
  }
  
  async function generateKeys(override) {
        const updateKP = await genKeyPair(override);
        const recoveryKP = await genKeyPair(override);
        const authKP = await genKeyPair(override);

        return {
            updateKeyPair: updateKP,
            recoveryKeyPair: recoveryKP,
            authKeyPair: authKP
        };
    }



    async function generateKeyPair (type) {
    let keyGenerator = secp256k1.Secp256k1KeyPair;
    if (type === 'Ed25519') { keyGenerator = ed25519.Ed25519KeyPair; };
    const keyPair = await keyGenerator.generate({
      secureRandom: () => {return Buffer.from(issuerPrivateKeyOverride, 'hex');}
    });
    const { publicKeyJwk, privateKeyJwk } = await keyPair.toJsonWebKeyPair(true);
    return {
      publicJwk: publicKeyJwk,
      privateJwk: privateKeyJwk
    };
  }

})();
