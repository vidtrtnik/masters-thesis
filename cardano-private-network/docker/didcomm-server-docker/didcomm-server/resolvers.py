import json
import requests
from didcomm.common.types import DID, VerificationMethodType, VerificationMaterial, VerificationMaterialFormat
from didcomm.did_doc.did_doc import DIDDoc, VerificationMethod, DIDCommService
from didcomm.did_doc.did_resolver import DIDResolver
from didcomm.message import Message, FromPrior
from didcomm.secrets.secrets_resolver_demo import SecretsResolverDemo
from didcomm.unpack import unpack, UnpackResult
from didcomm.common.resolvers import ResolversConfig
from didcomm.pack_encrypted import pack_encrypted, PackEncryptedConfig, PackEncryptedResult
from peerdid.core.did_doc_types import DIDCommServicePeerDID
from didcomm.secrets.secrets_util import generate_x25519_keys_as_jwk_dict, generate_ed25519_keys_as_jwk_dict, jwk_to_secret
from peerdid import peer_did
from peerdid.did_doc import DIDDocPeerDID
from peerdid.types import VerificationMaterialAuthentication, VerificationMethodTypeAuthentication, VerificationMaterialAgreement, VerificationMethodTypeAgreement, VerificationMaterialFormatPeerDID

DIDADA_RESOLVER_URL = "http://cardano-sidetree:3000/identifiers/"

class DIDResolverPeerDID(DIDResolver):
    async def resolve(self, did: DID) -> DIDDoc:
        did_doc_json = peer_did.resolve_peer_did(did, format = VerificationMaterialFormatPeerDID.JWK)
        did_doc = DIDDocPeerDID.from_json(did_doc_json)

        return DIDDoc(
            did=did_doc.did,
            key_agreement_kids = did_doc.agreement_kids,
            authentication_kids = did_doc.auth_kids,
            verification_methods = [
                VerificationMethod(
                    id = m.id,
                    type = VerificationMethodType.JSON_WEB_KEY_2020,
                    controller = m.controller,
                    verification_material = VerificationMaterial(
                        format = VerificationMaterialFormat.JWK,
                        value = json.dumps(m.ver_material.value)
                    )
                )
                for m in did_doc.authentication + did_doc.key_agreement
            ],
            didcomm_services = [
                DIDCommService(
                    id = s.id,
                    service_endpoint = s.service_endpoint,
                    routing_keys = s.routing_keys,
                    accept = s.accept
                )
                for s in did_doc.service
                if isinstance(s, DIDCommServicePeerDID)
            ] if did_doc.service else []
        )    

class DIDADAResolver(DIDResolver):
    async def resolve(self, did: DID) -> DIDDoc:
        RESOLVE_URL = DIDADA_RESOLVER_URL + did
        req = requests.get(RESOLVE_URL)
        data = req.json()
        #print(data['didDocument']['id'])
        #print(data['didDocument']['verificationMethod'])

        return DIDDoc(
            did=data['didDocument']['id'],
            key_agreement_kids = [data['didDocument']['id'] + data['didDocument']['verificationMethod'][1]['id']],
            authentication_kids = [data['didDocument']['id'] + data['didDocument']['verificationMethod'][0]['id']],
            verification_methods = [
                VerificationMethod(
                    id = data['didDocument']['id'] + data['didDocument']['verificationMethod'][0]['id'],
                    type = VerificationMethodType.JSON_WEB_KEY_2020,
                    controller = data['didDocument']['id'],
                    verification_material = VerificationMaterial(
                        format = VerificationMaterialFormat.JWK,
                        value = '{"kty": "OKP", "crv": "Ed25519", "x": "' + data['didDocument']['verificationMethod'][0]['publicKeyJwk']['x'] + '"}'
                    )
                ),
                
                VerificationMethod(
                    id = data['didDocument']['id'] + data['didDocument']['verificationMethod'][1]['id'],
                    type = VerificationMethodType.JSON_WEB_KEY_2020,
                    controller = data['didDocument']['id'],
                    verification_material = VerificationMaterial(
                        format = VerificationMaterialFormat.JWK,
                        value = '{"kty": "OKP", "crv": "X25519", "x": "' + data['didDocument']['verificationMethod'][1]['publicKeyJwk']['x'] + '"}'
                    )
                ),
            ],
            didcomm_services = []
        )
