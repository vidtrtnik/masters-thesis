const VaccinationCertificate = require('../models/VaccinationCertificate');
const Patient = require('../models/Patient');
const VerifiableCredential = require('../models/VerifiableCredential');
const VerifiablePresentation = require('../models/VerifiablePresentation');
const Did = require('../models/Did');
const VaccinationCenter = require('../models/VaccinationCenter');
const Verifier = require('../models/Verifier');
const VaccinationStorage = require('../models/VaccinationStorage');
const User = require('../models/User');
const Authority = require('../models/Authority');
const RevocationVC = require('../models/RevocationVC');

const utils = require('../helpers/did-vc-utils.js');
const didjwtvc = require('did-jwt-vc');
const vaccinatorutils = require('../helpers/vaccinator-utils');
const cardanoblockchain = require('../helpers/cardano-blockchain');
const jwt_decode = require('jwt-decode');

const ipfs = require('../helpers/ipfs-utils');
const jwt = require('jsonwebtoken');
const eciesjs = require('eciesjs');
const QRCode = require('qrcode');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const axios = require('axios');

require('dotenv').config();

const server = process.env.SIDETREE_CARDANO_SERVER;
//const server = "http://127.0.0.1:3333"

const cardanoGraphqlServer = process.env.CARDANO_GRAPHQL_SERVER;

const challengeText = process.env.RANDOM_STRING;

async function resolveQuery_decryptVCFallback(parent, args) {
  console.log("Private key: ", args.privkeyhex);
  const resp = await cardanoblockchain.getTransactionsWithLabel(cardanoGraphqlServer, "8222462378");
  var vcs = [];
  for (const tx of resp.data.data.transactions) {
    for (const meta of tx.metadata) {
      if (meta.key === "8222462378") {
        try {
          vcs.push(
            {
              transactionId: tx.hash,
              issuer: meta.value["0"],
              action: meta.value["1"],
              vcJwt: meta.value["2"].join(''),
              qr_cid: meta.value["3"]
            }
          );
        }
        catch (e) { console.log(e) }
      }
    }
  }
  var vcJwts = [];
  for (var i = 0; i < vcs.length; i++) {
    const vcJwtEnc = Buffer.from(vcs[i].vcJwt, 'hex');
    const privateKey = Buffer.from(args.privkeyhex, 'hex');

    try {
      const vcJwtDec = eciesjs.decrypt(privateKey, vcJwtEnc).toString();
      var decodedJwt = jwt_decode(vcJwtDec);

      const didr = await utils.resolveDID(server, decodedJwt.iss);
      const did_doc = didr.data.didDocument;
      const did_pubkey = did_doc.verificationMethod[0].publicKeyJwk;

      const localResolver = await utils.getLocalResolver(decodedJwt.iss, did_pubkey);
      console.log(localResolver);

      console.log(vcJwtDec)

      const verifiedVC = await didjwtvc.verifyCredential(vcJwtDec, localResolver, { header: { alg: 'ES256K' } });
      console.log("VERIFIED VC: ", verifiedVC);
      vcJwts.push({ transactionId: vcs[i].transactionId, issuer: decodedJwt.iss, action: vcs[i].action, vcJwtEnc: vcs[i].vcJwt, vcJwt: vcJwtDec, verifiedVC: JSON.stringify(verifiedVC), qr_cid: vcs[i].qr_cid });

    }
    catch (e) {
      console.log("ERROR: ", e);
    }
  }

  return vcJwts;
}

async function resolveQuery_verifyVPFallback(parent, args) {
  const resp = await cardanoblockchain.getTransactionsWithLabel(cardanoGraphqlServer, "8374347737");
  var vps = [];
  for (const tx of resp.data.data.transactions) {
    for (const meta of tx.metadata) {
      if (meta.key === "8374347737") {
        try {
          var vpJwtD = null;
          try {
            var ipfsVp = await axios.get("http://0.0.0.0:8081/ipfs/" + meta.value["3"]);
            const privateKey = Buffer.from(args.verifierKey, 'hex');
            const contents = Buffer.from(meta.value["2"].join(''), 'hex');
            const contents2 = ipfsVp.data;

            vpJwtD = eciesjs.decrypt(privateKey, contents).toString();
          }
          catch (e) { console.log(e) }
          vps.push(
            {
              transactionId: tx.hash,
              holder: meta.value["0"],
              action: meta.value["1"],
              vpJwt: vpJwtD,
              vp_cid: meta.value["3"],
              qr_cid: meta.value["4"]
            }
          );

        }
        catch (e) { console.log(e) }
      }
    }
  }

  console.log(vps);

  var vpJwts = [];
  for (var i = 0; i < vps.length; i++) {
    const vpJwtDec = vps[i].vpJwt;
    var decodedJwt = jwt_decode(vpJwtDec);
    if (decodedJwt.iss !== args.holder)
      continue;

    try {
      const didr = await utils.resolveDID(server, decodedJwt.iss);
      const did_doc = didr.data.didDocument;
      var did_pubkey = did_doc.verificationMethod[0].publicKeyJwk;

      console.log("DID PUBKEY: ", did_pubkey)

      const localResolver = await utils.getLocalResolver(decodedJwt.iss, did_pubkey);
      console.log(localResolver);

      const verifiedVP = await didjwtvc.verifyPresentation(vpJwtDec, localResolver);
      console.log("VERIFIED VP: ", verifiedVP);

      console.log(" vaccinatorutils.verifyVP(): ");
      var verVP = await vaccinatorutils.verifyVP(vpJwtDec);
      console.log(verVP)

      vpJwts.push(
        {
          transactionId: vps[i].transactionId,
          issuer: decodedJwt.iss,
          action: vps[i].action,
          verifiedVP: JSON.stringify(verifiedVP),
          qr_cid: vps[i].qr_cid,
          status: verVP.statusVCS.join(",")
        });
    }
    catch (e) {
      console.log("ERROR: ", e);
    }
  }

  return vpJwts;
}

async function resolveQuery_decryptTest(parent, args, vcs) {
  const privkeyhex = args.privkeyhex;
  decrypted_vcs = [];
  for (var i = 0; i < vcs.length; i++) {
    var vcTxMetadata = vcs[i];
    const vcEncHex = vcTxMetadata.vcJwt;
    console.log("vcEncHex: ", vcEncHex);

    const vcEnc = Buffer.from(vcEncHex, 'hex');
    const privateKey = Buffer.from(privkeyhex, 'hex');
    console.log(vcEnc);
    console.log(privateKey);
    var vc = null;
    try {
      vc = eciesjs.decrypt(privateKey, vcEnc).toString();
    }
    catch (e) {
      console.log("ERROR: ", e);
    }
    decrypted_vcs.push(vc);
  }

  console.log(decrypted_vcs)
  return decrypted_vcs;
}

async function resolveQuery_authChallenge(parent, args) {
  var response = { data: null };
  await utils.generateChallenge(server, args.did, challengeText)
    .then(function (data) { response.data = data; })
    .catch(function (error) { console.log(error); });

  console.log("challenge: ", response);
  return response;
}

async function resolveQuery_authResponse(parent, args) {
  var result = null;
  await utils.verifyResponse(server, args.did, args.response)
    .then(function (data) { result = data; })
    .catch(function (error) { console.log(error); });

  console.log("authentication result: ", result);
  let jwtToken = null;
  if (result) {

    var user = null;
    user = await Patient.findOne({}).where('did').equals(args.did);
    if (!user)
      user = await VaccinationCenter.findOne({}).where('did').equals(args.did);
    if (!user)
      user = await Verifier.findOne({}).where('did').equals(args.did);
    if (!user)
      return "error";

    jwtToken = jwt.sign(
      { user_id: user.id, user_did: user.did },
      process.env.RANDOM_STRING,
      { expiresIn: "2h" }
    );
    console.log(jwtToken);
    user.jwt_token = jwtToken;
    user.save();
  }

  return { result: result, token: jwtToken };
}

async function resolveQuery_didResolve(parent, args) {
  var response = { status: null, rmsg: null, did: null, did_doc: null };
  await utils.resolveDID(server, args.did)
    .then(function (data) { response.status = JSON.stringify(data.status); response.rmsg = "OK"; response.did = data.data.didDocument.id; response.did_doc = JSON.stringify(data.data.didDocument); })
    .catch(function (error) { response.status = JSON.stringify(error.response.status); response.rmsg = error.response.statusText; response.did = null; response.did_doc = null; })

  console.log(response);
  return response;
}

async function resolveQuery_getVCsFromCardanoBlockchain(parent, args) {
  console.log(args.label)
  const resp = await cardanoblockchain.getTransactionsWithLabel(cardanoGraphqlServer, args.label);
  var vcs = [];
  try {
    for (const tx of resp.data.data.transactions) {
      for (const meta of tx.metadata) {
        if (meta.key === args.label) {
          try {
            vcs.push(
              {
                transactionId: tx.hash,
                issuer: meta.value["0"],
                action: meta.value["1"],
                vcJwt: meta.value["2"].join('')
              }
            );
          }
          catch (e) { console.log(e) }
        }
      }
    }
  }
  catch (e) { console.log(e) }
  return vcs;
}

async function resolveQuery_getVPsFromCardanoBlockchain(parent, args) {
  console.log(args.label)
  const resp = await cardanoblockchain.getTransactionsWithLabel(cardanoGraphqlServer, args.label);
  var vps = [];
  try {
    for (const tx of resp.data.data.transactions) {
      for (const meta of tx.metadata) {
        if (meta.key === args.label) {
          try {
            vps.push(
              {
                transactionId: tx.hash,
                holder: meta.value["0"],
                action: meta.value["1"],
                vpJwt: meta.value["2"].join(''),
                vp_cid: meta.value["3"]
              }
            );
          }
          catch (e) { console.log(e) }
        }
      }
    }
  }
  catch (e) { console.log(e) }
  return vps;
}

async function resolveQuery_getVaccinationStoragesFromBlockchain(parent, args) {
  console.log("8222462777")
  const resp1 = await cardanoblockchain.getTransactionsWithLabel(cardanoGraphqlServer, "8222462777");
  var s = [];
  try {
    for (const tx of resp1.data.data.transactions) {
      for (const meta of tx.metadata) {
        if (meta.key === "8222462777") {
          try {
            s.push(
              {
                transactionId: tx.hash,
                action: meta.value["0"],
                name: meta.value["1"],
                dosage: meta.value["2"]
              }
            );
          }
          catch (e) { console.log(e) }
        }
      }
    }
  }
  catch (e) { console.log(e) }


  const resp2 = await cardanoblockchain.getTransactionsWithLabel(cardanoGraphqlServer, "8222462378");
  var vcs = [];
  try {
    for (const tx of resp2.data.data.transactions) {
      for (const meta of tx.metadata) {
        if (meta.key === "8222462378") {
          try {
            vcs.push(
              {
                transactionId: tx.hash,
                issuer: meta.value["0"],
                action: meta.value["1"],
                vcJwt: meta.value["2"].join('')
              }
            );
          }
          catch (e) { console.log(e) }
        }
      }
    }
  }
  catch (e) { console.log(e) }

  console.log(s)
  console.log(vcs)

  for (var i = 0; i < vcs.length; i++)
    for (var j = 0; j < s.length; j++)
      if (s[j]['name'] === vcs[i]['action']) {
        s[j]['dosage']--
      }

  return s;
}

async function resolveMutation_addPatient(parent, args) {
  var patient_did = args.did;
  var patient_did_doc = null;
  var patient_did_keys = null;

  if (patient_did == null || patient_did === undefined || patient_did == "") {
    await vaccinatorutils.postRequestGenDID(server)
      .then(function (data) {
        patient_did = data.did;

        console.log("NEW DID: ", patient_did)
        patient_did_doc = JSON.stringify(data.diddoc);
        patient_did_keys = JSON.stringify(data.didkeys);

      })
      .catch(function (error) {

        console.log(error);
      })
  }
  else {
    var response = { status: null, rmsg: null, did: null, did_doc: null };
    await utils.resolveDID(server, args.did)
      .then(function (data) { response.status = JSON.stringify(data.status); response.rmsg = "OK"; response.did = data.data.didDocument.id; response.did_doc = JSON.stringify(data.data.didDocument); })
      .catch(function (error) { response.status = JSON.stringify(error.response.status); response.rmsg = error.response.statusText; response.did = null; response.did_doc = null; })
    patient_did_doc = response.did_doc;
    patient_did_keys = response.did;
  }

  const did = new Did({
    did: patient_did,
    did_doc: patient_did_doc,
    did_keys: patient_did_keys,
  });

  const patient = new Patient({
    did: patient_did,
    email: args.email,
    name: args.name,
    zzzs_num: args.zzzs_num,
    cardano_address: args.cardano_address,
    jwt_token: null,
  });

  const user = new User({
    name: args.name,
    roleModel: "Patient",
    role: patient.id
  });
  user.save();

  const jwtToken = jwt.sign(
    { user_id: patient.id, user_did: patient_did },
    process.env.RANDOM_STRING,
    {
      expiresIn: "2h"
    }
  );

  patient.jwt_token = jwtToken;

  console.log("NEW PATIENT ENTRY: ", args, patient.did, patient.email, patient.name, patient.zzzs_num, patient.jwt_token);

  did.save();
  return patient.save();
}


async function resolveMutation_addVaccinationCentre(parent, args) {
  var center_did = args.did;
  var center_did_doc = null;
  var center_did_keys = null;

  if (center_did == null || center_did === undefined || center_did == "") {
    await vaccinatorutils.postRequestGenDID(server)
      .then(function (data) {
        center_did = data.did;
        console.log("NEW center DID: ", center_did)
        center_did_doc = JSON.stringify(data.diddoc);
        center_did_keys = JSON.stringify(data.didkeys);

      })
      .catch(function (error) {

        console.log(error);
      })
  }
  else {
    return { error: "missing did" };
  }

  const did = new Did({
    did: center_did,
    did_doc: center_did_doc,
    did_keys: center_did_keys,
  });

  const center = new VaccinationCenter({
    did: center_did,
    name: args.name,
    address: args.address,
    jwt_token: null,
  });

  const jwtToken = jwt.sign(
    { user_id: center.id, center_did },
    process.env.RANDOM_STRING,
    {
      expiresIn: "2h"
    }
  );

  center.jwt_token = jwtToken;

  console.log("NEW CENTER ENTRY: ", args, center.did, center.name, center.address);

  did.save();
  return center.save();
}

async function resolveMutation_addVerifier(parent, args) {
  var verifier_did = args.did;
  var verifier_did_doc = null;
  var verifier_did_keys = null;

  if (verifier_did == null || verifier_did === undefined || verifier_did == "") {
    await vaccinatorutils.postRequestGenDID(server)
      .then(function (data) {
        verifier_did = data.did;
        console.log("NEW verifier DID: ", verifier_did)
        verifier_did_doc = JSON.stringify(data.diddoc);
        verifier_did_keys = JSON.stringify(data.didkeys);

      })
      .catch(function (error) {

        console.log(error);
      })
  }
  else {
    return { error: "missing did" };
  }

  const did = new Did({
    did: verifier_did,
    did_doc: verifier_did_doc,
    did_keys: verifier_did_keys,
  });

  const verifier = new Verifier({
    did: verifier_did,
    name: args.name,
    address: args.address,
    jwt_token: null,
  });

  const jwtToken = jwt.sign(
    { user_id: verifier.id, verifier_did },
    process.env.RANDOM_STRING,
    {
      expiresIn: "2h"
    }
  );

  verifier.jwt_token = jwtToken;

  console.log("NEW verifier ENTRY: ", args, verifier.did, verifier.name, verifier.address);

  did.save();
  return verifier.save();
}



async function resolveMutation_addVaccinationStorage(parent, args) {
  const storage = new VaccinationStorage({
    name: args.name,
    company: args.company,
    code: null,
    hash: null,
    dosage: args.dosage,
  });

  console.log("NEW VACCINATION STORAGE: ", args, storage);

  var transactionID = null;
  await cardanoblockchain.createAndSignTransaction2(storage.id, args.dosage, "8222462777", "STORAGE")
    .then(function (data) { console.log("-----------------------------------------------------------"); console.log(data); transactionID = data; })
    .catch(function (error) { console.log(error); })
  console.log("TRANSACTION ID: ", transactionID);

  if (transactionID === null || transactionID === undefined)
    return null;

  storage.code = transactionID;
  return storage.save();
}


async function resolveMutation_revokeDid(parent, args) {
  var return_value = null
  await vaccinatorutils.postRequestDeactivateDID(server, args.did.split(":")[2], args.did_keys)
    .then(function (data) { console.log("#POSTREQUESTDEACTIVATEDID#", data.output); return_value = args.did })
    .catch(function (error) { console.log("#POSTREQUESTERRRRRRRROR#", error) })

  return { did: return_value };
}

async function resolveMutation_deletePatient(parent, args) {
  const patient = await Patient.findById(args.id);
  console.log(patient);
  const did = await Did.findOne({}).where('did').equals(patient.did);
  console.log(did);
  const did_keys = did.did_keys;


  var return_value = null
  await vaccinatorutils.postRequestDeactivateDID(server, did.did.split(":")[2], did.did_keys)
    .then(function (data) { console.log("(deletePATIENT!!!) ___> #POSTREQUESTDEACTIVATEDID#", data.output); return_value = args.did })
    .catch(function (error) { console.log("(deletePATIENT!!!) ___> #POSTREQUESTERRRRRRRROR#", error) })

  return { id: return_value };
}

async function resolveMutation_deleteCentre(parent, args) {
  const centre = await VaccinationCenter.findById(args.id);
  console.log(centre);
  const did = await Did.findOne({}).where('did').equals(centre.did);
  console.log(did);
  const did_keys = did.did_keys;


  var return_value = null
  await vaccinatorutils.postRequestDeactivateDID(server, did.did.split(":")[2], did.did_keys)
    .then(function (data) { console.log("(deleteCENTRE!!!) ___> #POSTREQUESTDEACTIVATEDID#", data.output); return_value = args.did })
    .catch(function (error) { console.log("(deleteCENTRE!!!) ___> #POSTREQUESTERRRRRRRROR#", error) })

  return { id: return_value };
}

async function resolveMutation_addVaccinationCertificate(parent, args) {
  console.log(args);
  const vcentre = await VaccinationCenter.findById(args.vcentreId)
  const patient = await Patient.findById(args.patientId);
  const vaccine = await VaccinationStorage.findById(args.vaccineId);

  const issuerAuthKey = args.vcentreAuthKey;
  const issuerKey2 = args.vcentreKey2;

  const issuerDid = vcentre.did;

  console.log(patient);
  console.log(vcentre);
  console.log(vaccine);
  console.log("DID, KEY", issuerDid, issuerAuthKey);


  var vcJwt = null;
  var counter = null;
  await vaccinatorutils.createNewVC(server, issuerDid, issuerAuthKey, patient.did, vaccine.name, args.additionalInfo, args.date, patient, vcentre, vaccine)
    .then(function (data) { console.log("-----------------------------------------------------------"); console.log(data); vcJwt = data.vcJwtEnc; counter = data.counter; })
    .catch(function (error) { console.log(error); })

  var shasum = crypto.createHash('sha1')
  var issuerHash = shasum.update(issuerDid).digest('hex');

  var transactionID = null;
  await cardanoblockchain.createAndSignTransaction(vcJwt, issuerHash, "8222462378", vaccine.code)
    .then(function (data) { console.log("-----------------------------------------------------------"); console.log(data); transactionID = data; })
    .catch(function (error) { console.log(error); })
  console.log("(createNewVC) TRANSACTION 1 ID: ", transactionID);

  const verifiableCredential = new VerifiableCredential({
    vaccinationInfo: vaccine.name,
    additionalInfo: args.additionalInfo,
    date: args.date,
    issuerDid: issuerDid,
    subjectDid: patient.did,
    vcJwt: vcJwt
  });
  verifiableCredential.save();
  console.log("verifiableCredential.id: ", verifiableCredential.id);

  const vaccinationCertificate = new VaccinationCertificate({
    additionalInfo: args.additionalInfo,
    date: args.date,
    transactionId: transactionID,
    vcentreId: vcentre.id,
    revokeId: counter,
    patientId: patient.id,
    vaccineId: vaccine.id,
    vcId: verifiableCredential.id,
  });

  var keys = await utils.generateKeys(issuerAuthKey);
  var keys2 = await utils.generateKeys2(issuerKey2);

  /*
var ipfsRes = await ipfs.ipfsAdd(vcJwt);
console.log(ipfsRes);

const vp_qr = await QRCode.toBuffer("http://0.0.0.0:8081/ipfs/" + ipfsRes.path, {
  type: 'png',
  errorCorrectionLevel: 'H',
});

var ipfsRes_QR = await ipfs.ipfsAddBuf(vp_qr);
console.log(ipfsRes_QR);
*/

  try {
    if (patient.cardano_address !== undefined && patient.cardano_address !== "None") {
      var pid = await cardanoblockchain.mintNewNFT();
      await cardanoblockchain.sendNFT(pid, patient.cardano_address);
    }
  }
  catch (e) { console.log(e) }

  return vaccinationCertificate.save();
}

async function resolveMutation_addVaccinationCertificateS(parent, args) {
  console.log(args);
  const vcentre = await VaccinationCenter.findById(args.vcentreId)
  const patient = await Patient.findById(args.patientId);
  const vaccine = await VaccinationStorage.findById(args.vaccineId);

  const issuerAuthKey = args.vcentreAuthKey;
  const issuerKey2 = args.vcentreKey2;

  const issuerDid = vcentre.did;

  var vcJwt = null;
  var counter = null;
  await vaccinatorutils.createNewVC_Small(server, issuerDid, issuerAuthKey, patient.did, vaccine.name, args.additionalInfo, args.date, patient, vcentre, vaccine)
    .then(function (data) { console.log("-----------------------------------------------------------"); console.log(data); vcJwt = data.vcJwtEnc; counter = data.counter; })
    .catch(function (error) { console.log(error); })

  var shasum = crypto.createHash('sha1')
  var issuerHash = shasum.update(issuerDid).digest('hex');

  var transactionID = null;
  await cardanoblockchain.createAndSignTransaction(vcJwt, issuerHash, "8222462378", vaccine.code)
    .then(function (data) { console.log("-----------------------------------------------------------"); console.log(data); transactionID = data; })
    .catch(function (error) { console.log(error); })
  console.log("(addVaccinationCertificateS) TRANSACTION 1 ID: ", transactionID);

  const verifiableCredential = new VerifiableCredential({
    vaccinationInfo: vaccine.name,
    additionalInfo: args.additionalInfo,
    date: args.date,
    issuerDid: issuerDid,
    subjectDid: patient.did,
    vcJwt: vcJwt
  });
  verifiableCredential.save();
  console.log("verifiableCredential.id: ", verifiableCredential.id);

  const vaccinationCertificate = new VaccinationCertificate({
    additionalInfo: args.additionalInfo,
    date: args.date,
    transactionId: transactionID,
    vcentreId: vcentre.id,
    revokeId: counter,
    patientId: patient.id,
    vaccineId: vaccine.id,
    vcId: verifiableCredential.id,
  });

  var keys = await utils.generateKeys(issuerAuthKey);
  var keys2 = await utils.generateKeys2(issuerKey2);
  console.log(issuerKey2);
  console.log(keys2);

  /*
  var ipfsRes = await ipfs.ipfsAdd(vcJwt);
  console.log(ipfsRes);

  const vp_qr = await QRCode.toBuffer("http://0.0.0.0:8081/ipfs/" + ipfsRes.path, {
    type: 'png',
    errorCorrectionLevel: 'H',
  });

  var ipfsRes_QR = await ipfs.ipfsAddBuf(vp_qr);
  console.log(ipfsRes_QR);
*/

  try {
    if (patient.cardano_address !== undefined && patient.cardano_address !== "None") {
      var pid = await cardanoblockchain.mintNewNFT();
      await cardanoblockchain.sendNFT(pid, patient.cardano_address);
    }
  }
  catch (e) { console.log(e) }

  return vaccinationCertificate.save();
}

async function resolveMutation_addVC(parent, args) {
  console.log(args);
  const vcentre = await VaccinationCenter.findById(args.vcentreId)
  const patient = await Patient.findById(args.patientId);
  const vaccine = await VaccinationStorage.findById(args.vaccineId);

  const issuerAuthKey = args.vcentreAuthKey;
  const issuerDid = vcentre.did;

  var vcJwt = null;
  var counter = null;
  //await vaccinatorutils.createNewVC(server, issuerDid, issuerAuthKey, patient.did, args.vaccinationInfo, args.additionalInfo, args.date)
  await vaccinatorutils.createNewVC(server, issuerDid, issuerAuthKey, patient.did, vaccine.name, args.additionalInfo, args.date, patient, vcentre, vaccine)
    .then(function (data) { console.log("-----------------------------------------------------------"); console.log(data); vcJwt = data.vcJwt; counter = data.counter })
    .catch(function (error) { console.log(error); })

  const verifiableCredential = new VerifiableCredential({
    vaccinationInfo: args.vaccinationInfo,
    additionalInfo: args.additionalInfo,
    date: args.date,
    issuerDid: issuerDid,
    subjectDid: patient.did,
    vcJwt: vcJwt
  });
  //verifiableCredential.save();
  console.log("verifiableCredential.id: ", verifiableCredential.id);

  await cardanoblockchain.createAndSignTransaction("DIDComm Transmission...", "REDACTED", "8222462378", vaccine.code)
    .then(function (data) { console.log("-----------------------------------------------------------"); console.log(data) })
    .catch(function (error) { console.log(error); })

  const vaccinationCertificate = new VaccinationCertificate({
    vaccinationInfo: args.vaccinationInfo,
    additionalInfo: args.additionalInfo,
    date: args.date,
    transactionId: "DIDComm Transmission...",
    revokeId: counter,
    vcentreId: vcentre.id,
    patientId: patient.id,
    vaccineId: vaccine.id,
    vcId: verifiableCredential.id,
  });
  vaccinationCertificate.save();

  return verifiableCredential.save();
}

async function resolveMutation_addVCS(parent, args) {
  console.log(args);
  const vcentre = await VaccinationCenter.findById(args.vcentreId)
  const patient = await Patient.findById(args.patientId);
  const vaccine = await VaccinationStorage.findById(args.vaccineId);

  const issuerAuthKey = args.vcentreAuthKey;
  const issuerKey2 = args.vcentreKey2;

  const issuerDid = vcentre.did;

  var vcJwt = null;
  var counter = null;
  await vaccinatorutils.createNewVC_Small(server, issuerDid, issuerAuthKey, patient.did, vaccine.name, args.additionalInfo, args.date, patient, vcentre, vaccine)
    .then(function (data) { console.log("-----------------------------------------------------------"); console.log(data); vcJwt = data.vcJwt; counter = data.counter })
    .catch(function (error) { console.log(error); })

  const verifiableCredential = new VerifiableCredential({
    vaccinationInfo: args.vaccinationInfo,
    additionalInfo: args.additionalInfo,
    date: args.date,
    issuerDid: issuerDid,
    subjectDid: patient.did,
    vcJwt: vcJwt
  });
  console.log("verifiableCredential.id: ", verifiableCredential.id);

  await cardanoblockchain.createAndSignTransaction("DIDComm Transmission...", "REDACTED", "8222462378", vaccine.code)
    .then(function (data) { console.log("-----------------------------------------------------------"); console.log(data) })
    .catch(function (error) { console.log(error); })

  const vaccinationCertificate = new VaccinationCertificate({
    vaccinationInfo: args.vaccinationInfo,
    additionalInfo: args.additionalInfo,
    date: args.date,
    transactionId: "DIDComm Transmission...",
    revokeId: counter,
    vcentreId: vcentre.id,
    patientId: patient.id,
    vaccineId: vaccine.id,
    vcId: verifiableCredential.id,
  });
  vaccinationCertificate.save();

  return verifiableCredential.save();
}

async function resolveMutation_addVerifiablePresentation(parent, args) {
  console.log("ARGS:", args);
  const issuerAuthKey = args.privkeyhex;
  const issuerDid = args.did;
  var shasum = crypto.createHash('sha1')
  var issuerHash = shasum.update(issuerDid).digest('hex');

  const verifier = await Verifier.findById(args.verifierId)
  console.log(verifier)

  var vpJwtEnc = null;
  var vpJwt = null;
  await vaccinatorutils.createNewVP(server, issuerDid, issuerAuthKey, verifier.did, args.vcJwt)
    .then(function (data) { console.log("-----------------------------------------------------------"); console.log(data); vpJwtEnc = data.vpJwtEnc; vpJwt = data.vpJwt })
    .catch(function (error) { console.log(error); })

  const didr = await utils.resolveDID(server, issuerDid);
  const did_doc = didr.data.didDocument;
  var did_pubkey = did_doc.verificationMethod[0].publicKeyJwk;
  const localResolver = await utils.getLocalResolver(issuerDid, did_pubkey);
  console.log(localResolver);

  const verifiedVP = await didjwtvc.verifyPresentation(vpJwt, localResolver);
  console.log("VERIFIED VP: ", verifiedVP);

  var ipfsRes_vp = await ipfs.ipfsAdd(vpJwtEnc);
  console.log(ipfsRes_vp);

  const vp_qr = await QRCode.toBuffer("http://0.0.0.0:8081/ipfs/" + ipfsRes_vp.path, {
    type: 'png',
    errorCorrectionLevel: 'H',
  });

  var ipfsRes_QR = await ipfs.ipfsAddBuf(vp_qr);
  console.log(ipfsRes_QR);


  var transactionID = null;
  await cardanoblockchain.createAndSignTransaction(vpJwtEnc, issuerHash, "8374347737", "PRESENTATION", ipfsRes_vp.path, ipfsRes_QR.path)
    .then(function (data) { console.log("-----------------------------------------------------------"); console.log(data); transactionID = data; })
    .catch(function (error) { console.log(error); })
  console.log("TRANSACTION ID: ", transactionID);

  const verifiablePresentation = new VerifiablePresentation({
    issuerDid: issuerDid,
    subjectDid: verifier.did,
    transactionID: transactionID,
    vpJwt: vpJwtEnc,
    vp_cid: ipfsRes_vp.path,
    vp_qr_cid: ipfsRes_QR.path
  });

  return verifiablePresentation.save();
}

async function resolveMutation_addVP(parent, args) {
  console.log("resolveMutation_addVP ARGS:", args);
  console.log(args.vcJwt);
  const issuerAuthKey = args.privkeyhex;

  const issuerDid = args.did;

  var vpJwtR = null;
  await vaccinatorutils.createNewVP(server, issuerDid, issuerAuthKey, null, args.vcJwt)
    .then(function (data) { console.log("-----------------------------------------------------------"); console.log(data); vpJwtR = data.vpJwt; })
    .catch(function (error) { console.log(error); })


  const didr = await utils.resolveDID(server, issuerDid);
  const did_doc = didr.data.didDocument;
  var did_pubkey = did_doc.verificationMethod[0].publicKeyJwk;
  const localResolver = await utils.getLocalResolver(issuerDid, did_pubkey);
  console.log(localResolver);

  const verifiedVP = await didjwtvc.verifyPresentation(vpJwtR, localResolver);
  console.log("VERIFIED VP: ", verifiedVP);

  const verifiablePresentation = new VerifiablePresentation({
    issuerDid: issuerDid,
    transactionID: null,
    vpJwt: vpJwtR,
    vp_cid: null,
    vp_qr_cid: null
  });

  return verifiablePresentation.save();
}

async function resolveMutation_mintNFT(parent, args) {
  console.log("MINT NFT");

  var policy = await cardanoblockchain.mintNewNFT();
  cardanoblockchain.sendNFT(policy, args.address);
}

async function resolveQuery_login(parent, args) {
  console.log("resolveQuery_login");
  console.log(args);

  var authority = await Authority.findOne({}).where('username').equals(args.username);
  console.log(authority)

  console.log("Comparing: ", args.password, authority.password)
  var compare = await bcrypt.compareSync(args.password, authority.password)
  console.log(compare)
  if (compare) {
    return authority.id;
  }

  return null;
}

module.exports = {
  resolveQuery_decryptVCFallback,
  resolveQuery_verifyVPFallback,
  resolveQuery_decryptTest,
  resolveQuery_didResolve,
  resolveQuery_getVCsFromCardanoBlockchain,
  resolveQuery_getVPsFromCardanoBlockchain,
  resolveQuery_authChallenge,
  resolveQuery_authResponse,
  resolveQuery_login,

  resolveMutation_addPatient,
  resolveMutation_revokeDid,
  resolveMutation_deletePatient,
  resolveMutation_deleteCentre,
  resolveMutation_addVaccinationCertificate,
  resolveMutation_addVC,
  resolveMutation_addVaccinationCentre,
  resolveMutation_addVerifier,
  resolveMutation_addVaccinationStorage,
  resolveMutation_addVerifiablePresentation,
  resolveMutation_addVP,
  resolveMutation_mintNFT,
  resolveQuery_getVaccinationStoragesFromBlockchain,
  resolveMutation_addVaccinationCertificateS,
  resolveMutation_addVCS
}
