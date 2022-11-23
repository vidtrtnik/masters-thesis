const VaccinationCertificate = require('../models/VaccinationCertificate');
const Patient = require('../models/Patient');
const VerifiableCredential = require('../models/VerifiableCredential');
const VerifiablePresentation = require('../models/VerifiablePresentation');
const Did = require('../models/Did');
const Authority = require('../models/Authority');
const VaccinationCenter = require('../models/VaccinationCenter');
const Verifier = require('../models/Verifier');
const User = require('../models/User');
const fs = require('fs');
const path = require("path");
const bcrypt = require('bcrypt');

function loadData(folder) {
    console.log(folder);

    const did1 = new Did({
        did: 'did:ada:EiD-SoS4rLlAZxDcSqm__gvJj5TX3dTcAErIN4_gCXD8zw',
        did_doc: '{"id":"did:ada:EiD-SoS4rLlAZxDcSqm__gvJj5TX3dTcAErIN4_gCXD8zw","verificationMethod":[{"id":"#key-1","controller":"","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"TzVb3LfMCvco7zzOuWFdkGhLtbLKX4WasPC3BAdYcao","y":"OFtrG46tgJymdFTZaD_PK6A0Vtb-LEq-Kwfw-9uy8cE"}},{"id":"#key-2","controller":"","type":"X25519KeyAgreementKey2019","publicKeyJwk":{"kty":"OKP","crv":"X25519","x":"e06Qm75__kTEZaIgA31gjuNYl9Me-XLwf3SJLLD3PxM"}}],"service":[{"id":"#domain-1","type":"LinkedDomains","serviceEndpoint":"https://foo.example.com"}],"authentication":["#key-1","#key-2"]}',
        did_keys: '',
    });
    did1.save();

    const patient = new Patient({
        did: 'did:ada:EiD-SoS4rLlAZxDcSqm__gvJj5TX3dTcAErIN4_gCXD8zw',
        email: 'janez@novak',
        name: 'Janez Novak',
        zzzs_num: '1234567890',
        jwt_token: '',
        cardano_address: 'addr1_testTMP',
    });
    patient.save();

    const user1 = new User({
      roleModel: "Patient",
      role: patient.id
    });
    user1.save();


    const did2 = new Did({
        did: 'did:ada:EiA3sqh3mPVCOByJwpQoYJPqKQ8lw7we-xwtXM355WXlDw',
        did_doc: '{"id":"did:ada:EiA3sqh3mPVCOByJwpQoYJPqKQ8lw7we-xwtXM355WXlDw","verificationMethod":[{"id":"#key-1","controller":"","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"Rm1_yuVj5csJoNGHC7WANEgEYXh5oUlJzyIoXxuuPyc","y":"ZygXbDxkMfju2kU43DfIZeJ4Tzqed9BE8z5Ad5fhJ4o"}},{"id":"#key-2","controller":"","type":"X25519KeyAgreementKey2019","publicKeyJwk":{"kty":"OKP","crv":"X25519","x":"D6poTtKIZ7l_Smot7l34zpdOdrcBjj8iocTPJnhXDyA"}}],"service":[{"id":"#domain-1","type":"LinkedDomains","serviceEndpoint":"https://foo.example.com"}],"authentication":["#key-1","#key-2"]}',
        did_keys: '',
    });
    did2.save();

    const center = new VaccinationCenter({
        did: 'did:ada:EiA3sqh3mPVCOByJwpQoYJPqKQ8lw7we-xwtXM355WXlDw',
        name: 'Cepilni Center 1',
        address: 'ZD LJ',
        jwt_token: '',
    });
    center.save();

    const user2 = new User({
      roleModel: "Patient",
      role: center.id
    });
    user2.save();

    const did3 = new Did({
        did: 'did:ada:EiCR7o8M26cVIXd3QAaKhsQT5UeJJ5Bsxg2RFuXbrj5nLg',
        did_doc: '{"id":"did:ada:EiCR7o8M26cVIXd3QAaKhsQT5UeJJ5Bsxg2RFuXbrj5nLg","verificationMethod":[{"id":"#key-1","controller":"","type":"EcdsaSecp256k1VerificationKey2019","publicKeyJwk":{"kty":"EC","crv":"secp256k1","x":"PHKt20_fCa-U8MlNf-kqOGp-cM-KHYWRY4a7JTXHsbE","y":"OzBrD-CFZl2PwbKK4Wds061uCOrtoiX-ONDaTeVXA-A"}},{"id":"#key-2","controller":"","type":"X25519KeyAgreementKey2019","publicKeyJwk":{"kty":"OKP","crv":"X25519","x":"ew1H2TQn-DERYHgcfHM_2J-IlwrvSQ2KoO4ZpMuKGxQ"}}],"service":[{"id":"#domain-1","type":"LinkedDomains","serviceEndpoint":"https://foo.example.com"}],"authentication":["#key-1","#key-2"]}',
        did_keys: '',
    });
    did3.save();

    const verifier = new Verifier({
        did: 'did:ada:EiCR7o8M26cVIXd3QAaKhsQT5UeJJ5Bsxg2RFuXbrj5nLg',
        name: 'Verifier 1',
        address: 'Letalisce 1',
        jwt_token: '',
    });
    verifier.save();

    const user3 = new User({
      roleModel: "Verifier",
      role: verifier.id
    });
    user3.save();


    const hash = bcrypt.hashSync("pass", 10);
    const authority = new Authority({
        username: 'user',
        password: hash,
    });
    authority.save();

    const user4 = new User({
      roleModel: "Authority",
      role: authority.id
    });
    user4.save();


    /*
    var file = null;
    file = fs.readFileSync(path.resolve(__dirname, folder + "/users.json"));

    var users = JSON.parse(file);
    for(var i=0; i < users.length; i++) {
        var user = users[i];
        user._id
    }
    User.collection.insertMany(users, (e,r) => {
        console.log(e)
        console.log(r)
    })
*/
}

module.exports = {
    loadData
}