const utils = require('./did-vc-utils.js');
const didjwtvc = require('did-jwt-vc');
const axios = require('axios');
const eciesjs = require('eciesjs');
const RevocationVC = require('../models/RevocationVC.js');
const rl = require("vc-revocation-list");
const jwt_decode = require('jwt-decode');

require('dotenv').config();
const server = process.env.SIDETREE_CARDANO_SERVER;

async function checkRevocation(url, index) {
  const resp = await axios.get(url);
  const data = resp.data.data;
  const revocationVCJWT = data.RevocationList2020Credential.vc;

  const revocationVC = await verifyVC(revocationVCJWT);
  console.log(revocationVC)
  const encoded = revocationVC.vc.payload.vc.credentialSubject.encodedList;
  console.log(encoded);

  const decoded = await rl.decodeList({ encodedList: encoded });
  const is = decoded.isRevoked(index)

  return is;
}

async function verifyVP(jwt) {
  var token = jwt;
  var decodedJwt = jwt_decode(token);
  //console.log(decodedJwt)

  var issuerDid = decodedJwt.iss;
  console.log(issuerDid)
  const issuerDidDoc = await utils.resolveDID(server, issuerDid);
  const issuerPublicKeyJwk = issuerDidDoc.data.didDocument.verificationMethod[0].publicKeyJwk;

  var vcList = decodedJwt.vp.verifiableCredential;
  var vcValid = true;
  var verifiedVCS = []
  var statusVCS = []
  for (var i = 0; i < vcList.length; i++) {
    var vc = vcList[i];
    var verificationVC = await verifyVC(vc);
    var verifiedVC = verificationVC.vc;
    var statusVC = verificationVC.status;

    verifiedVCS.push(verifiedVC)
    statusVCS.push(statusVC)

    //console.log("verified VC: \n", verifiedVC);
    //if(verifiedVC === '')
    //  vcValid = false;
    //else
    //  verifiedVCS.push(verifiedVC);
  }

  if (!vcValid) {
    console.log("VCS ARE NOT VALID!!!")
  }

  const localResolver = await utils.getLocalResolver(issuerDid, issuerPublicKeyJwk);
  //console.log(localResolver);

  var verifiedVP = '';
  try {
    verifiedVP = await didjwtvc.verifyPresentation(jwt, localResolver, { header: { alg: 'ES256K' } });
  }
  catch (e) {
    console.log(e);
  }
  //console.log(verifiedVP);

  return { verifiedVP: verifiedVP, verifiedVCS: verifiedVCS, statusVCS: statusVCS };
}

async function verifyVC(jwt) {
  var token = jwt;
  var decodedJwt = jwt_decode(token);
  //console.log(decodedJwt)

  var issuerDid = decodedJwt.iss;
  //var subjectDid = decodedJwt.sub;
  console.log(issuerDid)
  const issuerDidDoc = await utils.resolveDID(server, issuerDid);
  //const subjectDidDoc = await utils.resolveDID(server, subjectDid);
  const issuerPublicKeyJwk = issuerDidDoc.data.didDocument.verificationMethod[0].publicKeyJwk;
  //const subjectPublicKeyJwk = subjectDidDoc.data.didDocument.verificationMethod[0].publicKeyJwk;

  const localResolver = await utils.getLocalResolver(issuerDid, issuerPublicKeyJwk);
  //console.log(localResolver);

  var verifiedVC = '';
  var statusVC = "Revoked"
  try {
    verifiedVC = await didjwtvc.verifyCredential(jwt, localResolver, { header: { alg: 'ES256K' } });
    if (!verifiedVC.payload.vc.type.includes("RevocationList2020Credential")) {
      console.log("IS NORMAL VC");
      var revocationListCredentialUrl = verifiedVC.payload.vc.credentialStatus.revocationListCredential;
      var revocationListCredentialIndex = verifiedVC.payload.vc.credentialStatus.revocationListIndex;
      var status = await checkRevocation(revocationListCredentialUrl, revocationListCredentialIndex);
      console.log("Status: ", status);
      if (status) {
        statusVC = "Revoked"
      }
      else {
        statusVC = "Valid"
      }
    }
  }
  catch (e) {
    console.log(e);
  }
  //console.log(verifiedVC);

  return { vc: verifiedVC, status: statusVC };
}

async function postRequestGenDID(server) {

  const keys = await utils.generateKeys();
  const keys2 = await utils.generateKeys2();
  console.log()
  console.log("keys2")
  console.log(keys2.aggreementKeyPair.publicKeys.jwk);
  const didDocument = await utils.generateDIDDocument(keys.authKeyPair.publicKeys.jwk, keys2.aggreementKeyPair.publicKeys.jwk);
  const createRequest = await utils.createRequest(keys.recoveryKeyPair.publicKeys.jwk, keys.updateKeyPair.publicKeys.jwk, didDocument);

  return new Promise((resolve, reject) => {
    axios
      .post(server + '/operations', createRequest)
      .then(res => {
        resolve({ res: res, didkeys: Object.assign({}, keys, keys2), diddoc: res.data.didDocument, did: res.data.didDocument.id })
      })
      .catch(error => {
        reject(error)
      });
  });
};

async function postRequestDeactivateDID(server, did, keys) {
  keys = JSON.parse(keys);
  console.log("DID SUFFIX: ", did)
  console.log(keys.recoveryKeyPair.publicKeys.jwk);
  console.log(keys.recoveryKeyPair.privateKeys.jwk);
  const deactivateRequest = await utils.createDeactivateRequest(keys.recoveryKeyPair.publicKeys.jwk, keys.recoveryKeyPair.privateKeys.jwk, did);

  return new Promise((resolve, reject) => {
    axios
      .post(server + '/operations', deactivateRequest)
      .then(res => {
        resolve({ res: res, output: res.config.data, status: res.statusText })
      })
      .catch(error => {
        reject(error)
      });
  });
};

async function createNewVC(server, issuerDid, issuerAuthKeyOv, subjDid, subjData, subjAddData, vcNbf, patient, vcentre, vaccine) {
  var rvc = await RevocationVC.findOne();
  var counter = 0
  var encodedList = ""
  if (rvc !== null) {
    counter = rvc.c;
    encodedList = rvc.encodedList;
  }
  else {
    var decodedList = await rl.createList({ length: 100000 });
    encodedList = await decodedList.encode();
  }

  console.log(server, issuerDid, issuerAuthKeyOv, subjDid, subjData, vcNbf);
  const issuerDidDoc = await utils.resolveDID(server, issuerDid);
  const issuerPublicKeyJwk = issuerDidDoc.data.didDocument.verificationMethod[0].publicKeyJwk;

  const subjectDidDoc = await utils.resolveDID(server, subjDid);
  const subjectPublicKeyJwk = subjectDidDoc.data.didDocument.verificationMethod[0].publicKeyJwk;
  const subjectPublicKeyHex = await utils.getHexPubKeyFromJwk(subjectPublicKeyJwk)

  console.log("issuerPublicKeyJwk: ", issuerPublicKeyJwk);
  console.log("subjectPublicKeyHex: ", subjectPublicKeyHex);

  const keys = await utils.generateKeys(issuerAuthKeyOv);
  const authPrivKeyHex = keys.authKeyPair.privateKeys.hex;
  const updatePrivKeyJwt = keys.updateKeyPair.privateKeys.jwk;
  const updatePubKeyJwt = keys.updateKeyPair.publicKeys.jwk;

  const authKeyBuf = Buffer.from(authPrivKeyHex, 'hex');
  console.log(authKeyBuf);

  const issuer = await utils.defIssuer(issuerDid, authKeyBuf, false);
  console.log(issuer);
  //createVCPayload(vId, vIssDate, vExpDate, issuer, vNum, vCentre, subName1, subName2, subBirth, vName, vCompany, credStatusId, credStatusListIndex, credStatusListCred) 
  const vcPayload = await utils.createVCPayload(Number(vcNbf), patient, vcentre, vaccine, "http://localhost:5000/graphql?query={" + vcNbf + "}", counter, "http://localhost:5000/graphql?query={RevocationList2020Credential{vc}}");
  //const vcPayload = await utils.createVCPayloadFallback(subjDid, subjData, Number(vcNbf), subjDid, "http://localhost:5000/graphql?query={" + vcNbf + "}", counter, "http://localhost:5000/graphql?query={RevocationList2020Credential{vc}}");
  console.log(vcPayload);
  const vcrPayload = await utils.createVCRevPayload("http://localhost:5000/graphql?query={RevocationList2020Credential{vc}}", encodedList);
  console.log(vcrPayload);

  const vcJwt = await didjwtvc.createVerifiableCredentialJwt(vcPayload, issuer, { header: { alg: 'ES256K' } });
  console.log(vcJwt);

  const vcrJwt = await didjwtvc.createVerifiableCredentialJwt(vcrPayload, issuer, { header: { alg: 'ES256K' } });
  console.log(vcrJwt);

  const vcr = new RevocationVC({ vc: vcrJwt, c: counter + 1, encodedList: encodedList });
  vcr.save();
  console.log(vcr)

  const vcJwtBuffer = Buffer.from(vcJwt);
  console.log("vcJwtBuffer: ", vcJwtBuffer);
  const vcJwtEnc = eciesjs.encrypt(subjectPublicKeyHex, vcJwtBuffer).toString('hex');
  console.log("vcJwtEnc: ", vcJwtEnc);

  const BFT = Buffer.from(vcJwtEnc, 'hex');
  console.log("BFT: ", BFT);


  //const decData = eciesjs.decrypt(authPrivKeyHex, encData).toString();

  //const localResolver = await utils.getLocalResolver(issuerDid, issuerPublicKeyJwk);
  //console.log(localResolver);

  //const verifiedVC = await didjwtvc.verifyCredential(vcJwt, localResolver, { header: { alg: 'ES256K' } });
  //console.log(verifiedVC);

  //const issuerDidSuffix = issuerDid.split(":")[2];
  //const subjectDidSuffix = subjDid.split(":")[2];
  //console.log("DID SUFFIX: " + issuerDidSuffix + ", " + subjectDidSuffix);

  // create NEW VP
  //const vpPayload = await utils.createVPPayload(vcJwt);
  //console.log(vpPayload);

  //const vpJwt = await didjwtvc.createVerifiablePresentationJwt(vpPayload, issuer);
  //console.log(vpJwt);

  //const data = Buffer.from(vpJwt);

  //const verifiedVP = await didjwtvc.verifyPresentation(decData, localResolver);
  //console.log("VERIFIED VP: ", verifiedVP);

  return { vcJwt: vcJwt, vcJwtEnc: vcJwtEnc, counter: counter };
}

async function createNewVC_Small(server, issuerDid, issuerAuthKeyOv, subjDid, subjData, subjAddData, vcNbf, patient, vcentre, vaccine) {
  var rvc = await RevocationVC.findOne();
  var counter = 0
  var encodedList = ""
  if (rvc !== null) {
    counter = rvc.c;
    encodedList = rvc.encodedList;
  }
  else {
    var decodedList = await rl.createList({ length: 100000 });
    encodedList = await decodedList.encode();
  }

  console.log(server, issuerDid, issuerAuthKeyOv, subjDid, subjData, vcNbf);
  const issuerDidDoc = await utils.resolveDID(server, issuerDid);
  const issuerPublicKeyJwk = issuerDidDoc.data.didDocument.verificationMethod[0].publicKeyJwk;

  const subjectDidDoc = await utils.resolveDID(server, subjDid);
  const subjectPublicKeyJwk = subjectDidDoc.data.didDocument.verificationMethod[0].publicKeyJwk;
  const subjectPublicKeyHex = await utils.getHexPubKeyFromJwk(subjectPublicKeyJwk)

  console.log("issuerPublicKeyJwk: ", issuerPublicKeyJwk);
  console.log("subjectPublicKeyHex: ", subjectPublicKeyHex);

  const keys = await utils.generateKeys(issuerAuthKeyOv);
  const authPrivKeyHex = keys.authKeyPair.privateKeys.hex;
  const updatePrivKeyJwt = keys.updateKeyPair.privateKeys.jwk;
  const updatePubKeyJwt = keys.updateKeyPair.publicKeys.jwk;

  const authKeyBuf = Buffer.from(authPrivKeyHex, 'hex');
  console.log(authKeyBuf);

  const issuer = await utils.defIssuer(issuerDid, authKeyBuf, false);
  console.log(issuer);
  //createVCPayload(vId, vIssDate, vExpDate, issuer, vNum, vCentre, subName1, subName2, subBirth, vName, vCompany, credStatusId, credStatusListIndex, credStatusListCred) 
  const vcPayload = await utils.createVCPayload_Small(Number(vcNbf), patient, vcentre, vaccine, "http://localhost:5000/graphql?query={" + vcNbf + "}", counter, "http://localhost:5000/graphql?query={RevocationList2020Credential{vc}}");
  //const vcPayload = await utils.createVCPayloadFallback(subjDid, subjData, Number(vcNbf), subjDid, "http://localhost:5000/graphql?query={" + vcNbf + "}", counter, "http://localhost:5000/graphql?query={RevocationList2020Credential{vc}}");
  console.log(vcPayload);
  const vcrPayload = await utils.createVCRevPayload("http://localhost:5000/graphql?query={RevocationList2020Credential{vc}}", encodedList);
  console.log(vcrPayload);

  const vcJwt = await didjwtvc.createVerifiableCredentialJwt(vcPayload, issuer, { header: { alg: 'ES256K' } });
  console.log(vcJwt);

  const vcrJwt = await didjwtvc.createVerifiableCredentialJwt(vcrPayload, issuer, { header: { alg: 'ES256K' } });
  console.log(vcrJwt);

  const vcr = new RevocationVC({ vc: vcrJwt, c: counter + 1, encodedList: encodedList });
  vcr.save();
  console.log(vcr)

  const vcJwtBuffer = Buffer.from(vcJwt);
  console.log("vcJwtBuffer: ", vcJwtBuffer);
  const vcJwtEnc = eciesjs.encrypt(subjectPublicKeyHex, vcJwtBuffer).toString('hex');
  console.log("vcJwtEnc: ", vcJwtEnc);

  return { vcJwt: vcJwt, vcJwtEnc: vcJwtEnc, counter: counter };
}

async function createNewVP(server, issuerDid, issuerAuthKey, verifierDid, vcJwts) {
  console.log(server, issuerDid, issuerAuthKey, vcJwts)
  console.log("createNewVP vcJwts", vcJwts);
  const issuerDidDoc = await utils.resolveDID(server, issuerDid);
  const issuerPublicKeyJwk = issuerDidDoc.data.didDocument.verificationMethod[0].publicKeyJwk;

  const authKeyBuf = Buffer.from(issuerAuthKey, 'hex');
  console.log(authKeyBuf);

  const issuer = await utils.defIssuer(issuerDid, authKeyBuf, false);
  //console.log(issuer);

  const localResolver = await utils.getLocalResolver(issuerDid, issuerPublicKeyJwk);
  //console.log(localResolver);

  // create NEW VP
  var vcJwtArray = vcJwts.split(",");
  console.log(vcJwtArray)
  var vpPayload = await utils.createVPPayload(vcJwtArray);
  //console.log("PAYLOAD1: ", vpPayload);

  const vpJwt = await didjwtvc.createVerifiablePresentationJwt(vpPayload, issuer);
  console.log("VPJWT:", vpJwt);

  const verifiedVP = await didjwtvc.verifyPresentation(vpJwt, localResolver);
  //console.log("VERIFIED VP: ", verifiedVP);

  var verifier_didr = null;
  var verifier_did_doc = null;
  var verifier_did_pubkey = null;
  var verifier_did_pubkey_hex = null;

  if (verifierDid !== null) {
    verifier_didr = await utils.resolveDID(server, verifierDid);
    verifier_did_doc = verifier_didr.data.didDocument;
    verifier_did_pubkey = verifier_did_doc.verificationMethod[0].publicKeyJwk;
    verifier_did_pubkey_hex = await utils.getHexPubKeyFromJwk(verifier_did_pubkey)
  }

  const vpJwtBuffer = Buffer.from(vpJwt);
  console.log("vcJwtBuffer: ", vpJwtBuffer);
  var vpJwtEnc = null;
  if (verifierDid !== null)
    vpJwtEnc = eciesjs.encrypt(verifier_did_pubkey_hex, vpJwtBuffer).toString('hex');
  console.log("vpJwtEnc: ", vpJwtEnc);

  return { vpJwt: vpJwt, vpJwtEnc: vpJwtEnc };
}

module.exports = {
  postRequestGenDID, postRequestDeactivateDID, createNewVC, createNewVP, verifyVC, verifyVP, createNewVC_Small
}
