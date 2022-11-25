const IonSdk = require('@decentralized-identity/ion-sdk');
const randomBytes = require('randombytes');
const secp256k1 = require('@transmute/did-key-secp256k1');

//const { randomBytes } = require('crypto')
const x25519kp = require('@transmute/x25519-key-pair');
//const x25519kp = require('@transmute/did-key-x25519');
const ccjs_secp256k1 = require('secp256k1')
const rl = require("vc-revocation-list");

const request = require('request');
const util = require('util');
const didjwt = require('did-jwt');
const didjwtvc = require('did-jwt-vc');
const axios = require('axios');

const RevocationVC = require('../models/RevocationVC.js');

const challengeMsg = randomBytes(32);

async function revokeCredential(issuerDid, issuerAuthKeyOv, index) {
  console.log(issuerDid, "Revoking: ", index);
  const server = "http://127.0.0.1:3333";
  var rvc = await RevocationVC.findOne();
  var counter = 0
  var encoded = ""
  var decoded = null;

  if (rvc !== null) {
    counter = rvc.c;
    encoded = rvc.encodedList;
    console.log(encoded);
    decoded = await rl.decodeList({ encodedList: encoded });
  }
  else {
    decoded = await rl.createList({ length: 100000 });
  }
  decoded.setRevoked(index, true)
  encoded = await decoded.encode();

  const issuerDidDoc = await resolveDID(server, issuerDid);
  const issuerPublicKeyJwk = issuerDidDoc.data.didDocument.verificationMethod[0].publicKeyJwk;

  console.log("issuerPublicKeyJwk: ", issuerPublicKeyJwk);

  const keys = await generateKeys(issuerAuthKeyOv);
  const authPrivKeyHex = keys.authKeyPair.privateKeys.hex;

  const authKeyBuf = Buffer.from(authPrivKeyHex, 'hex');
  console.log(authKeyBuf);

  const issuer = await defIssuer(issuerDid, authKeyBuf, false);
  console.log(issuer);

  const vcrPayload = await createVCRevPayload("http://localhost:5000/graphql?query={RevocationList2020Credential{vc}}", encoded);
  console.log(vcrPayload);

  const vcrJwt = await didjwtvc.createVerifiableCredentialJwt(vcrPayload, issuer, { header: { alg: 'ES256K' } });
  console.log(vcrJwt);

  const vcr = new RevocationVC({ vc: vcrJwt, c: counter, encodedList: encoded });
  vcr.save();

  return encoded;
}

async function generateChallenge(server, did) {
  const didr = await resolveDID(server, did);
  const did_doc = didr.data.didDocument;
  if (did_doc === null)
    return null;

  let challengeMsgString = Buffer.from(challengeMsg).toString('hex');
  const arr = Uint8Array.from(Buffer.from(challengeMsgString, 'hex'));

  return challengeMsgString;
}

async function verifyResponse(server, did, resp) {

  const didr = await resolveDID(server, did);
  const did_doc = didr.data.didDocument;
  if (did_doc === null)
    return null;

  const did_pubkey = did_doc.verificationMethod[0].publicKeyJwk;
  var pubKeyHex = await getHexPubKeyFromJwk(did_pubkey);

  const pubKey = Uint8Array.from(Buffer.from(pubKeyHex, 'hex'));

  console.log(pubKey);

  const respArr = Uint8Array.from(Buffer.from(resp, 'hex'));
  //var respArr = ccjs_secp256k1.signatureImport(respArr);

  var result = ccjs_secp256k1.ecdsaVerify(respArr, challengeMsg, pubKey);


  console.log(result)

  return result;
}

async function createUpdateDoc(didSuffix, data) {
  const updateOperation = {
    didSuffix: didSuffix,
    idsOfPublicKeysToRemove: [],
    publicKeysToAdd: [],
    idsOfServicesToRemove: [],
    servicesToAdd: [{
      id: data,
      type: data,
      serviceEndpoint: data
    }]
  };

  return updateOperation;
}

async function createDeactivateRequest(recoveryPubKeyJwk, recoveryPrivKeyJwk, didSuffix) {

  const deactivateRequest = await IonSdk.IonRequest.createDeactivateRequest({
    didSuffix: didSuffix,
    recoveryPublicKey: recoveryPubKeyJwk,
    signer: IonSdk.LocalSigner.create(recoveryPrivKeyJwk)
  });

  return deactivateRequest;

}

async function createUpdateRequest(didSuffix, updatePublicJwk, updatePrivateJwk, updateOperation) {
  const updateRequest = await IonSdk.IonRequest.createUpdateRequest({
    didSuffix: didSuffix,
    updatePublicKey: updatePublicJwk,
    nextUpdatePublicKey: updatePublicJwk,
    signer: IonSdk.LocalSigner.create(updatePrivateJwk),
    idsOfServicesToRemove: updateOperation.idsOfServicesToRemove,
    servicesToAdd: updateOperation.servicesToAdd,
    idsOfPublicKeysToRemove: updateOperation.idsOfPublicKeysToRemove,
    publicKeysToAdd: updateOperation.publicKeysToAdd
  });

  return updateRequest;
}

async function resolveDID(server, did) {
  console.log(server + '/identifiers/' + did);
  return new Promise((resolve, reject) => {
    axios
      .get(server + '/identifiers/' + did)
      .then(res => {
        resolve(res)
      })
      .catch(error => {
        reject(error)
      });
  });
}

async function createRequest(recoveryPubKeyJwk, updatePubKeyJwk, didDocument) {

  const createRequest = await IonSdk.IonRequest.createCreateRequest({
    recoveryKey: recoveryPubKeyJwk,
    updateKey: updatePubKeyJwk,
    document: didDocument
  });

  return createRequest;

};

async function generateDIDDocument(authPubKeyJwk, agrePubKeyJwk, addServiceData) {

  var serviceData = null;
  if (typeof addServiceData === 'undefined') {
    serviceData = {
      id: 'domain-1',
      type: 'LinkedDomains',
      serviceEndpoint: 'https://foo.example.com'
    }
  }
  else {
    serviceData = addServiceData;
  }
  console.log(serviceData);

  const didDocument = {
    publicKeys: [
      {
        id: 'key-1',
        type: 'EcdsaSecp256k1VerificationKey2019',
        publicKeyJwk: authPubKeyJwk,
        purposes: ['authentication']
      },
      {
        id: 'key-2',
        type: 'X25519KeyAgreementKey2019',
        publicKeyJwk: agrePubKeyJwk,
        purposes: ['authentication']
      }
    ],
    services: [
      serviceData
    ]
  };

  return didDocument;

}

async function getLocalResolver(did, publicKeyJwk) {

  const promise = {
    resolve: () =>
      Promise.resolve({
        '@context': 'https://w3id.org/did-resolution/v1',
        didDocument: {
          id: did,
          '@context': ['https://www.w3.org/ns/did/v1'],
          verificationMethod: [
            {
              id: '#key-1',
              controller: '',
              type: 'EcdsaSecp256k1VerificationKey2019',
              publicKeyJwk,
            },
          ],
          authentication: ['#key-1'],
        },
        didDocumentMetadata: {},
        didResolutionMetadata: {},
      }),
  }

  const result = await promise;

  return result;
}

async function createVCRevPayload(vcrId, vcrEncList) {
  return {
    vc: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://w3id.org/vc-revocation-list-2020/v1"
      ],
      "id": vcrId,
      "type": ["VerifiableCredential", "RevocationList2020Credential"],
      credentialSubject: {
        id: vcrId,
        "type": "RevocationList2020",
        "encodedList": vcrEncList
      },
    },
  }
}

async function createVCPayload(vcNbf, patient, vcentre, vaccine, credStatusId, credStatusListIndex, credStatusListCred, expd=10000000) {
  var vcExp = vcNbf + expd;
  return {
    sub: patient.did,
    nbf: vcNbf,
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ["VerifiableCredential", "VaccinationCertificate"],
      id: "testID",
      name: "COVID-19 Vaccination Certificate",
      description: "COVID-19 Vaccination Certificate",
      issuanceDate: vcNbf,
      expirationDate: vcExp,
      issuer: vcentre.did,
      credentialSubject: {
        type: "VaccinationEvent",
        batchNumber: vaccine.id,
        administeringCentre: vcentre.name,
        healthProfessional: "Ministrstvo za zdravje",
        countryOfVaccination: "SI",
        recipient: {
          type: "VaccineRecipient",
          givenName: patient.name.split(' ')[0],
          familyName: patient.name.split(' ')[1],
          gender: "M",
          birthDate: vcNbf
        },
        vaccine: {
          type: "Vaccine",
          disease: "COVID-19",
          atcCode: vaccine.code,
          medicinalProductName: vaccine.name,
          marketingAuthorizationHolder: vaccine.company
        }
      },
      credentialStatus: {
        id: credStatusId,
        type: "RevocationList2020Status",
        revocationListIndex: credStatusListIndex,
        revocationListCredential: credStatusListCred
      }
    }
  }
}

async function createVCPayload_Small(vcNbf, patient, vcentre, vaccine, credStatusId, credStatusListIndex, credStatusListCred, expd=10000000) {
  var vcExp = vcNbf + expd;
  return {
    sub: patient.did,
    nbf: vcNbf,
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ["VerifiableCredential", "VaccinationCertificate"],
      id: "testID",
      name: "COVID-19 Vaccination Certificate",
      description: "COVID-19 Vaccination Certificate",
      issuanceDate: vcNbf,
      expirationDate: vcExp,
      issuer: vcentre.did,
      credentialSubject: {
        type: "VaccinationEvent",
        batchNumber: vaccine.id,
        administeringCentre: vcentre.did,
        healthProfessional: "Ministrstvo za zdravje",
        countryOfVaccination: "SI",
        recipient: {
          type: "VaccineRecipient",
          givenName: "REDACTED",
          familyName: "REDACTED",
          did: patient.did
        },
        vaccine: {
          type: "Vaccine",
          disease: "COVID-19",
          atcCode: vaccine.code,
        }
      },
      credentialStatus: {
        id: credStatusId,
        type: "RevocationList2020Status",
        revocationListIndex: credStatusListIndex,
        revocationListCredential: credStatusListCred
      }
    }
  }
}

async function createVCPayloadFallback(csName, csType, vcNbf, vcSub, credStatusId, credStatusListIndex, credStatusListCred) {
  console.log(csName, csType, vcNbf, vcSub, credStatusId, credStatusListIndex, credStatusListCred);
  console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
  return {
    sub: vcSub,
    nbf: vcNbf,
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      credentialSubject: {
        id: vcSub,
        degree: {
          type: csType,
          name: csName,
        },
      },
    },
    credentialStatus: {
      id: credStatusId,
      type: "RevocationList2020Status",
      revocationListIndex: credStatusListIndex,
      revocationListCredential: credStatusListCred
    }
  }
}

async function createVPPayload(vcJwts) {
  return {
    vp: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: vcJwts
    }
  }
}


async function defIssuer(did, pkHex, b) {
  const es256ks = await didjwt.ES256KSigner(pkHex, b);

  return {
    did,
    signer: es256ks,
    alg: 'ES256K'
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

async function generateKeys2(override) {
  const agreementKP = await genKeyPair2(override);

  return {
    aggreementKeyPair: agreementKP,
  };
}

async function genKeyPair2(randomBytesOverride) {
  let keyGenerator = x25519kp.X25519KeyPair;

  var keyPair = null;
  if (typeof randomBytesOverride === 'undefined') {
    keyPair = await keyGenerator.generate({ secureRandom: () => randomBytes(32) });
  }
  else {
    keyPair = await keyGenerator.generate({ secureRandom: () => { return Buffer.from(randomBytesOverride, 'hex') } });
  }

  const { publicKeyJwk, privateKeyJwk } = await keyPair.export({
    type: 'JsonWebKey2020',
    privateKey: true,
  });

  const { publicKeyHex, privateKeyHex } = await getHexKeyPair(keyPair);

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
  };
}

async function genKeyPair(randomBytesOverride) {
  let keyGenerator = secp256k1.Secp256k1KeyPair;
  console.log(randomBytesOverride);
  var keyPair = null;
  if (typeof randomBytesOverride === 'undefined') {
    keyPair = await keyGenerator.generate({ secureRandom: () => randomBytes(32) });
  }
  else {
    keyPair = await keyGenerator.generate({ secureRandom: () => { return Buffer.from(randomBytesOverride, 'hex') } });
  }

  const { publicKeyJwk, privateKeyJwk } = await keyPair.export({
    type: 'JsonWebKey2020',
    privateKey: true,
  });

  const { publicKeyHex, privateKeyHex } = await getHexKeyPair(keyPair);

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
  };
}

async function getHexPubKeyFromJwk(jwk) {
  const bufX = Buffer.from(jwk.x, "base64");
  const bufY = Buffer.from(jwk.y, "base64");
  var prep = "03";


  if (bufY[bufY.length - 1] % 2 == 0) // if even
    prep = "02";

  console.log("PUBLIC KEY HEX: ", prep + bufX.toString("hex"))
  return prep + bufX.toString("hex");
}

async function getHexKeyPair(kp) {
  return {
    privateKeyHex: Buffer.from(kp.privateKey, "base64").toString("hex"),
    publicKeyHex: Buffer.from(kp.publicKey, "base64").toString("hex")
  }
}

module.exports = {
  revokeCredential,
  createVCRevPayload,
  getLocalResolver,
  createVCPayload,
  createVPPayload,
  defIssuer,
  generateKeys,
  generateKeys2,
  generateDIDDocument,
  createRequest,
  resolveDID,
  createUpdateDoc,
  createUpdateRequest,
  createDeactivateRequest,
  generateChallenge,
  verifyResponse,
  getHexPubKeyFromJwk,
  createVCPayloadFallback,
  createVCPayload_Small
}
