const { GraphQLObjectType, GraphQLSchema, GraphQLList, GraphQLID, GraphQLString, GraphQLInt, GraphQLNonNull, GraphQLEnumType, responsePathAsArray } = require('graphql');

const VaccinationCertificate = require('../models/VaccinationCertificate');
const Patient = require('../models/Patient');
const VerifiableCredential = require('../models/VerifiableCredential');
const VerifiablePresentation = require('../models/VerifiablePresentation');
const Did = require('../models/Did');
const VaccinationCenter = require('../models/VaccinationCenter');
const User = require('../models/User');
const RevocationVC = require('../models/RevocationVC');
const VaccinationStorage = require('../models/VaccinationStorage');

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        test: { type: GraphQLString },
        role: { type: GraphQLID },
        roleModel: { type: GraphQLString },
    })
});

const VaccinationCenterType = new GraphQLObjectType({
    name: 'VaccinationCenter',
    fields: () => ({
        id: { type: GraphQLID },
        did: { type: GraphQLString },
        name: { type: GraphQLString },
        address: { type: GraphQLString },
    })
});

const VerifierType = new GraphQLObjectType({
    name: 'Verifier',
    fields: () => ({
        id: { type: GraphQLID },
        did: { type: GraphQLString },
        name: { type: GraphQLString },
        address: { type: GraphQLString },
    })
});

const VaccinationStorageType = new GraphQLObjectType({
    name: 'VaccinationStorage',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        company: { type: GraphQLString },
        code: { type: GraphQLString },
        hash: { type: GraphQLString },
        dosage: { type: GraphQLInt },
    })
});

const RevocationVCType = new GraphQLObjectType({
    name: 'RevocationVC',
    fields: () => ({
        id: { type: GraphQLID },
        vc: { type: GraphQLString },
    })
});

const DidResolveType = new GraphQLObjectType({
    name: 'DidResolve',
    fields: () => ({
        rmsg: { type: GraphQLString },
        status: { type: GraphQLString },
        did: { type: GraphQLString },
        did_doc: { type: GraphQLString },
    })
});

const DidType = new GraphQLObjectType({
    name: 'Did',
    fields: () => ({
        id: { type: GraphQLID },
        did: { type: GraphQLString },
        did_doc: { type: GraphQLString },
        did_keys: { type: GraphQLString },
    })
});

const VerifiableCredentialType = new GraphQLObjectType({
    name: 'VerifiableCredential',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        issuerDid: { type: GraphQLString },
        subjectDid: { type: GraphQLString },
        vcJwt: { type: GraphQLString },
    })
});

const VerifiablePresentationType = new GraphQLObjectType({
    name: 'VerifiablePresentation',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        issuerDid: { type: GraphQLString },
        vpJwt: { type: GraphQLString },
        vp_cid: { type: GraphQLString },
        vp_qr_cid: { type: GraphQLString },
    })
});

const PatientType = new GraphQLObjectType({
    name: 'Patient',
    fields: () => ({
        id: { type: GraphQLID },
        did: { type: GraphQLString },
        email: { type: GraphQLString },
        name: { type: GraphQLString },
        zzzs_num: { type: GraphQLString },
        cardano_address: { type: GraphQLString },
    })
});

const AuthorityType = new GraphQLObjectType({
    name: 'Authority',
    fields: () => ({
        username: { type: GraphQLString },
        password: { type: GraphQLString },
    })
});

const VaccinationCertificateType = new GraphQLObjectType({
    name: 'VaccinationCertificate',
    fields: () => ({
        id: { type: GraphQLID },
        vaccinationInfo: { type: GraphQLString },
        additionalInfo: { type: GraphQLString },
        date: { type: GraphQLString },
        transactionId: { type: GraphQLString },
        revokeId: { type: GraphQLString },
        patient: {
            type: PatientType,
            resolve(parent, args) {
                return Patient.findById(parent.patientId);
            }
        },
        vaccinationCenter: {
            type: VaccinationCenterType,
            resolve(parent, args) {
                return VaccinationCenter.findById(parent.vcentreId);
            }
        },
        vaccinationStorage: {
            type: VaccinationStorageType,
            resolve(parent, args) {
                return VaccinationStorage.findById(parent.vaccineId);
            }
        },
        verifiableCredential: {
            type: VerifiableCredentialType,
            resolve(parent, args) {
                return VerifiableCredential.findById(parent.vcId);
            }
        }
    })
});


module.exports = {
    UserType, DidResolveType, DidType, VerifiableCredentialType, VerifiablePresentationType, PatientType, VaccinationCertificateType, VaccinationCenterType, VaccinationStorageType, RevocationVCType, VerifierType, AuthorityType
  }
  