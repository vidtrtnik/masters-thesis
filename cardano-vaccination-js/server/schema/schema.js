// localhost:5000/graphql?query=%7BRevocationList2020Credential(id%253A%22123%22)

const { GraphQLObjectType, GraphQLSchema, GraphQLList, GraphQLID, GraphQLString, GraphQLInt, GraphQLNonNull, GraphQLEnumType, responsePathAsArray } = require('graphql');

const VaccinationCertificate = require('../models/VaccinationCertificate');
const Patient = require('../models/Patient');
const VaccinationCenter = require('../models/VaccinationCenter');
const Verifier = require('../models/Verifier');
const VaccinationStorage = require('../models/VaccinationStorage');
const VerifiableCredential = require('../models/VerifiableCredential');
const Did = require('../models/Did');
const User = require('../models/User');
const RevocationVC = require('../models/RevocationVC');

const utils = require('../helpers/did-vc-utils.js');
const didjwtvc = require('did-jwt-vc');
const axios = require('axios');
const { response } = require('express');
const vaccinatorutils = require('../helpers/vaccinator-utils');
const cardanoblockchain = require('../helpers/cardano-blockchain');

const { UserType, DidResolveType, DidType, VerifiableCredentialType, VerifiablePresentationType, PatientType, VaccinationCertificateType, VaccinationCenterType, VerifierType, VaccinationStorageType, RevocationVCType } = require('./types.js');
const { resolveQuery_login, resolveMutation_addVCS, resolveMutation_addVaccinationCertificateS, resolveMutation_addVP, resolveMutation_addVC, resolveQuery_didResolve, resolveQuery_getVPsFromCardanoBlockchain, resolveQuery_getVCsFromCardanoBlockchain, resolveMutation_addPatient, resolveMutation_deletePatient, resolveMutation_addVaccinationCertificate, resolveMutation_addVerifiablePresentation, resolveMutation_addVaccinationCentre, resolveMutation_addVerifier, resolveMutation_addVaccinationStorage, resolveQuery_authChallenge, resolveQuery_authResponse, resolveQuery_decryptTest, resolveQuery_decryptVCFallback, resolveQuery_verifyVPFallback, resolveMutation_mintNFT, resolveQuery_getVaccinationStoragesFromBlockchain } = require('./resolveFunctions');
const server = "http://127.0.0.1:3333";
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {

        loginCA: {
            type: new GraphQLObjectType({
                name: 'loginCA',
                fields: () => ({
                    userid: { type: GraphQLString },
                })
            }),
            args: {
                username: { type: GraphQLString },
                password: { type: GraphQLString },
            },
            async resolve(parent, args) {
                const resolveRes = await resolveQuery_login(parent, args);
                return { userid: resolveRes };
            },
        },

        genDID: {
            type: new GraphQLObjectType({
                name: 'genDID',
                fields: () => ({
                    did: { type: GraphQLString },
                    did_keys: { type: GraphQLString },
                })
            }),
            args: {},
            async resolve(parent, args, req) {
                var did = args.did;
                var did_keys = null;

                await vaccinatorutils.postRequestGenDID(server)
                    .then(function (data) {
                        did = data.did;
                        console.log("NEW DID: ", did)
                        did_keys = JSON.stringify(data.didkeys);
                    })
                    .catch(function (error) {

                        console.log(error);
                    })
                return { did: did, did_keys: did_keys };
            }
        },

        verifyVC: {
            type: new GraphQLObjectType({
                name: 'verifyVC',
                fields: () => ({
                    credential: { type: GraphQLString },
                    status: { type: GraphQLString },
                })
            }),
            args: { jwt: { type: GraphQLString } },
            async resolve(parent, args, req) {
                var status = "Invalid"
                var vc = "";
                var verification = await vaccinatorutils.verifyVC(args.jwt);
                vc = verification.vc
                status = verification.status

                return { credential: JSON.stringify(vc), status: status };
            }
        },

        verifyVP: {
            type: new GraphQLObjectType({
                name: 'verifyVP',
                fields: () => ({
                    presentation: { type: GraphQLString },
                    credentials: { type: GraphQLString },
                    status: { type: GraphQLString },
                })
            }),
            args: { jwt: { type: GraphQLString } },
            async resolve(parent, args, req) {
                var status = "Invalid"
                var vpResult = await vaccinatorutils.verifyVP(args.jwt);
                var vp = vpResult.verifiedVP;
                if (vp !== '')
                    status = "Valid"
                //console.log(vp)
                var vcs = vpResult.verifiedVCS;
                return { presentation: JSON.stringify(vp), credentials: JSON.stringify(vcs), status: status };
            }
        },

        RevocationList2020Credential: {
            type: RevocationVCType,
            args: {
                id: { type: GraphQLString },
            },
            async resolve(parent, args, req) {

                return RevocationVC.findOne();
            }
        },

        decryptVCFallback: {
            type: new GraphQLList(new GraphQLObjectType({
                name: 'decryptVCFallback',
                fields: () => ({
                    transactionId: { type: GraphQLString },
                    action: { type: GraphQLString },
                    issuer: { type: GraphQLString },
                    vcJwtEnc: { type: GraphQLString },
                    vcJwt: { type: GraphQLString },
                    verifiedVC: { type: GraphQLString },
                    qr_cid: { type: GraphQLString },
                })
            })),
            args: {
                privkeyhex: { type: GraphQLString },
            },
            async resolve(parent, args, req) {
                const resolveRes = await resolveQuery_decryptVCFallback(parent, args);
                return resolveRes;
            }
        },

        verifyVPFallback: {
            type: new GraphQLList(new GraphQLObjectType({
                name: 'verifyVPFallback',
                fields: () => ({
                    transactionId: { type: GraphQLString },
                    action: { type: GraphQLString },
                    holder: { type: GraphQLString },
                    verifiedVP: { type: GraphQLString },
                    qr_cid: { type: GraphQLString },
                })
            })),
            args: {
                holder: { type: GraphQLString },
                verifierKey: { type: GraphQLString },
            },
            async resolve(parent, args, req) {
                const resolveRes = await resolveQuery_verifyVPFallback(parent, args);
                return resolveRes;
            }
        },

        decryptTest: {
            type: new GraphQLObjectType({
                name: 'decryptTest',
                fields: () => ({
                    jwt: { type: GraphQLString },
                })
            }),
            args: { did: { type: GraphQLString }, privkeyhex: { type: GraphQLString } },
            async resolve(parent, args, req) {
                var vcs = await resolveQuery_getVCsFromCardanoBlockchain(parent, args);
                var test = await resolveQuery_decryptTest(parent, args, vcs);
                return { jwt: null };
            }
        },

        isAuthenticated: {
            type: new GraphQLObjectType({
                name: 'isAuthenticated',
                fields: () => ({
                    user_id: { type: GraphQLString },
                    user_did: { type: GraphQLString },
                })
            }),
            args: {},
            async resolve(parent, args, req) {
                if (req.isAuth) {
                    console.log("req.isAuth === true")
                    return { user_id: req.user_id, user_did: req.user_did }
                }
                console.log("req.isAuth === false")
                return { status: "not auth" };
            }
        },

        authChallenge: {
            type: new GraphQLObjectType({
                name: 'authChallenge',
                fields: () => ({
                    data: { type: GraphQLString },

                })
            }),
            args: { did: { type: GraphQLString } },
            async resolve(parent, args) {
                const resolveRes = await resolveQuery_authChallenge(parent, args);
                return resolveRes;
            }
        },

        authResponse: {
            type: new GraphQLObjectType({
                name: 'authResponse',
                fields: () => ({
                    result: { type: GraphQLString },
                    token: { type: GraphQLString },
                })
            }),
            args: { did: { type: GraphQLString }, response: { type: GraphQLString } },
            async resolve(parent, args) {
                const resolveRes = await resolveQuery_authResponse(parent, args);
                return resolveRes;
            }
        },

        did: {
            type: DidType,
            args: { did: { type: GraphQLString } },
            resolve(parent, args) {
                return Did.findOne({}).where('did').equals(args.did);
            }
        },
        didResolve: {
            type: DidResolveType,
            args: { did: { type: GraphQLString } },
            async resolve(parent, args) {
                const resolveRes = await resolveQuery_didResolve(parent, args);
                return resolveRes;
            }
        },
        patients: {
            type: new GraphQLList(PatientType),
            resolve(parent, args, req) {
                //console.log("REQ: ", req);
                return Patient.find();
            }
        },

        patient: {
            type: PatientType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return Patient.findById(args.id);
            }
        },

        vaccinationCentres: {
            type: new GraphQLList(VaccinationCenterType),
            resolve(parent, args) {
                return VaccinationCenter.find();
            }
        },

        verifiers: {
            type: new GraphQLList(VerifierType),
            resolve(parent, args) {
                return Verifier.find();
            }
        },

        vaccinationCenter: {
            type: VaccinationCenterType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return VaccinationCenter.findById(args.id);
            }
        },

        vaccinationCertificates: {
            type: new GraphQLList(VaccinationCertificateType),
            args: { patientId: { type: GraphQLID } },
            resolve(parent, args) {
                if (args.patientId == null)
                    return VaccinationCertificate.find();
                return VaccinationCertificate.find({ patientId: args.patientId });
            }
        },

        vaccinationCertificate: {
            type: VaccinationCertificateType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return VaccinationCertificate.findById(args.id);
            }
        },

        verifiableCredentials: {
            type: new GraphQLList(VerifiableCredentialType),
            resolve(parent, args) {
                return VerifiableCredential.find();
            }
        },

        verifiableCredential: {
            type: VerifiableCredentialType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return VerifiableCredential.findById(args.id);
            }
        },

        getVCsFromBlockchain: {
            type: new GraphQLList(new GraphQLObjectType({
                name: 'getVCsFromBlockchain',
                fields: () => ({
                    transactionId: { type: GraphQLString },
                    action: { type: GraphQLString },
                    vcJwt: { type: GraphQLString },
                })
            })),
            args: { label: { type: GraphQLString, defaultValue: "8222462378" } },
            async resolve(parent, args) {
                const resolveRes = await resolveQuery_getVCsFromCardanoBlockchain(parent, args);
                return resolveRes;
            }
        },

        getVPsFromBlockchain: {
            type: new GraphQLList(new GraphQLObjectType({
                name: 'getVPsFromBlockchain',
                fields: () => ({
                    transactionId: { type: GraphQLString },
                    action: { type: GraphQLString },
                    holder: { type: GraphQLString },
                    vpJwt: { type: GraphQLString },
                })
            })),
            args: { label: { type: GraphQLString, defaultValue: "8374347737" } },
            async resolve(parent, args) {
                const resolveRes = await resolveQuery_getVPsFromCardanoBlockchain(parent, args);
                return resolveRes;
            }
        },

        getVaccinationStoragesFromBlockchain: {
            type: new GraphQLList(new GraphQLObjectType({
                name: 'getVaccinationStoragesFromBlockchain',
                fields: () => ({
                    transactionId: { type: GraphQLString },
                    action: { type: GraphQLString },
                    name: { type: GraphQLString },
                    dosage: { type: GraphQLInt },
                })
            })),
            async resolve(parent, args) {
                const resolveRes = await resolveQuery_getVaccinationStoragesFromBlockchain(parent, args);
                return resolveRes;
            }
        },

        vaccinationStorages: {
            type: new GraphQLList(VaccinationStorageType),
            resolve(parent, args) {
                return VaccinationStorage.find();
            }
        },

        vaccinationStorage: {
            type: VaccinationStorageType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                return VaccinationStorage.findById(args.id);
            }
        },

    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        logout: {
            type: new GraphQLObjectType({
                name: 'logout',
                fields: () => ({
                    result: { type: GraphQLString },
                })
            }),
            args: {},
            async resolve(parent, args, req) {
                if (req.isAuth) {
                    var user = await Patient.findOne({}).where('id').equals(req.user_id);
                    if (!user)
                        user = await VaccinationCenter.findOne({}).where('id').equals(req.user_id);
                    if (user) {
                        user.jwt_token = null;
                        user.save();
                        return { result: "OK" }
                    }
                }
                return { result: "ERROR, NOT AUTHENTICATED!!!" }
            }
        },

        addPatient: {
            type: PatientType,
            args: {
                did: { type: GraphQLNonNull(GraphQLString), },
                email: { type: GraphQLNonNull(GraphQLString), },
                name: { type: GraphQLNonNull(GraphQLString), },
                zzzs_num: { type: GraphQLNonNull(GraphQLString), },
                cardano_address: { type: GraphQLNonNull(GraphQLString), },
            },
            async resolve(parent, args) {
                const resolveRes = await resolveMutation_addPatient(parent, args);
                return resolveRes;
            }
        },

        addVaccinationCentre: {
            type: VaccinationCenterType,
            args: {
                did: { type: GraphQLNonNull(GraphQLString), },
                name: { type: GraphQLNonNull(GraphQLString), },
                address: { type: GraphQLNonNull(GraphQLString), },
            },
            async resolve(parent, args) {
                const resolveRes = await resolveMutation_addVaccinationCentre(parent, args);
                return resolveRes;
            }
        },

        addVerifier: {
            type: VerifierType,
            args: {
                did: { type: GraphQLNonNull(GraphQLString), },
                name: { type: GraphQLNonNull(GraphQLString), },
                address: { type: GraphQLNonNull(GraphQLString), },
            },
            async resolve(parent, args) {
                const resolveRes = await resolveMutation_addVerifier(parent, args);
                return resolveRes;
            }
        },

        addVaccinationStorage: {
            type: VaccinationStorageType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString), },
                company: { type: GraphQLNonNull(GraphQLString), },
                dosage: { type: GraphQLNonNull(GraphQLInt), },
            },
            async resolve(parent, args) {
                const resolveRes = await resolveMutation_addVaccinationStorage(parent, args);
                return resolveRes;
            }
        },

        addVerifiablePresentation: {
            type: VerifiablePresentationType,
            args: {
                did: { type: GraphQLNonNull(GraphQLString), },
                privkeyhex: { type: GraphQLNonNull(GraphQLString), },
                vcJwt: { type: GraphQLNonNull(GraphQLString), },
                verifierId: { type: GraphQLNonNull(GraphQLID), },
            },
            async resolve(parent, args) {
                const resolveRes = await resolveMutation_addVerifiablePresentation(parent, args);
                return resolveRes;
            }
        },

        addVP: {
            type: VerifiablePresentationType,
            args: {
                did: { type: GraphQLNonNull(GraphQLString), },
                privkeyhex: { type: GraphQLNonNull(GraphQLString), },
                vcJwt: { type: GraphQLNonNull(GraphQLString), }
            },
            async resolve(parent, args) {
                const resolveRes = await resolveMutation_addVP(parent, args);
                return resolveRes;
            }
        },

        updatePatient: {
            type: PatientType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID), },
                email: { type: GraphQLNonNull(GraphQLString), },
                name: { type: GraphQLNonNull(GraphQLString), },
                zzzs_num: { type: GraphQLNonNull(GraphQLString), },
            },
            resolve(parent, args) {
                return Patient.findByIdAndUpdate(
                    args.id,
                    {
                        $set: {
                            name: args.name,
                            email: args.email,
                            zzzs_num: args.zzzs_num,
                        },
                    },
                    { new: true }
                );
            }

        },

        revokeDid: {
            type: DidType,
            args: {
                did: { type: GraphQLNonNull(GraphQLID) },
                did_keys: { type: GraphQLNonNull(GraphQLID) },
            },
            async resolve(parent, args) {
                const resolveRes = await resolveMutation_revokeDid(parent, args);
                return resolveRes;
            }

        },

        deletePatient: {
            type: PatientType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
            },
            async resolve(parent, args) {
                const resolveRes = await resolveMutation_deletePatient(parent, args);
                return resolveRes;
            },
        },

        deleteCentre: {
            type: VaccinationCenterType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
            },
            async resolve(parent, args) {
                const resolveRes = await resolveMutation_deleteCentre(parent, args);
                return resolveRes;
            },
        },

        addVaccinationCertificate: {
            type: VaccinationCertificateType,
            args: {
                additionalInfo: { type: GraphQLNonNull(GraphQLString) },
                date: { type: GraphQLNonNull(GraphQLString) },
                vcentreId: { type: GraphQLNonNull(GraphQLID) },
                vcentreAuthKey: { type: GraphQLNonNull(GraphQLString) },
                vcentreKey2: { type: GraphQLNonNull(GraphQLString) },
                patientId: { type: GraphQLNonNull(GraphQLID) },
                vaccineId: { type: GraphQLNonNull(GraphQLID) },
                type: { type: GraphQLString },
            },
            async resolve(parent, args) {
                console.log("???????????????????????????????????????????????????????????????????????????????????")
                console.log(args)
                var resolveRes;
                if (args.type === undefined || args.type === null || args.type === 'N')
                    resolveRes = await resolveMutation_addVaccinationCertificate(parent, args);
                else
                    resolveRes = await resolveMutation_addVaccinationCertificateS(parent, args);
                return resolveRes;
            },
        },

        addVC: {
            type: VerifiableCredentialType,
            args: {
                additionalInfo: { type: GraphQLNonNull(GraphQLString) },
                date: { type: GraphQLNonNull(GraphQLString) },
                vcentreId: { type: GraphQLNonNull(GraphQLID) },
                vcentreAuthKey: { type: GraphQLNonNull(GraphQLString) },
                vcentreKey2: { type: GraphQLNonNull(GraphQLString) },
                patientId: { type: GraphQLNonNull(GraphQLID) },
                vaccineId: { type: GraphQLNonNull(GraphQLID) },
                type: { type: GraphQLString },
            },
            async resolve(parent, args) {
                var resolveRes;
                if (args.type === undefined || args.type === null || args.type === 'N')
                    resolveRes = await resolveMutation_addVC(parent, args);
                else
                    resolveRes = await resolveMutation_addVCS(parent, args);
                return resolveRes;
            },
        },

        revokeVC: {
            type: new GraphQLObjectType({
                name: 'revokeVC',
                fields: () => ({
                    status: { type: GraphQLString },
                })
            }),
            args: {
                issuerDid: { type: GraphQLString },
                issuerKey: { type: GraphQLString },
                index: { type: GraphQLInt },
            },
            async resolve(parent, args, req) {
                var status = await utils.revokeCredential(args.issuerDid, args.issuerKey, args.index);
                return { status: status };
            }
        },

        deleteVaccinationCertificate: {
            type: VaccinationCertificateType,
            args: {
                id: { type: GraphQLNonNull(GraphQLID) },
            },
            resolve(parent, args) {
                return VaccinationCertificate.findByIdAndRemove(args.id);
            },
        },

        mintNFT: {
            type: new GraphQLObjectType({
                name: 'mintNFT',
                fields: () => ({
                    txHash: { type: GraphQLString },
                })
            }),
            args: {
                description: { type: GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, args, req) {
                const resolveRes = await resolveMutation_mintNFT(parent, args);
                return resolveRes;
            }
        }

    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})