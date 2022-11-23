import json
from didcomm.common.types import DID, VerificationMethodType, VerificationMaterial, VerificationMaterialFormat
from didcomm.did_doc.did_doc import DIDDoc, VerificationMethod, DIDCommService
from didcomm.did_doc.did_resolver import DIDResolver
from didcomm.message import Message
from didcomm.secrets.secrets_resolver_demo import SecretsResolverDemo
from didcomm.unpack import unpack, UnpackResult
from didcomm.common.resolvers import ResolversConfig
from didcomm.pack_encrypted import pack_encrypted, PackEncryptedConfig, PackEncryptedResult
from didcomm.secrets.secrets_util import generate_x25519_keys_as_jwk_dict, generate_ed25519_keys_as_jwk_dict, jwk_to_secret
from peerdid import peer_did
from peerdid.did_doc import DIDDocPeerDID
from peerdid.types import VerificationMaterialAuthentication, VerificationMethodTypeAuthentication, VerificationMaterialAgreement, VerificationMethodTypeAgreement, VerificationMaterialFormatPeerDID
from peerdid.core.did_doc_types import DIDCommServicePeerDID

secrets_resolver = SecretsResolverDemo()
#secrets_resolver = None

async def create_peer_did(commid: str, service_endpoint: str):

        agreem_keys = [generate_x25519_keys_as_jwk_dict()]
        auth_keys = [generate_ed25519_keys_as_jwk_dict()]
        print(agreem_keys)

        agreem_keys_peer_did = [
            VerificationMaterialAgreement(
                type=VerificationMethodTypeAgreement.JSON_WEB_KEY_2020,
                format=VerificationMaterialFormatPeerDID.JWK,
                value=agreem_keys[0][1],
            )
        ]

        auth_keys_peer_did = [
            VerificationMaterialAuthentication(
                type=VerificationMethodTypeAuthentication.JSON_WEB_KEY_2020,
                format=VerificationMaterialFormatPeerDID.JWK,
                value=auth_keys[0][1],
            )
        ]

        service = json.dumps(
                DIDCommServicePeerDID(
                    id=commid,
                    service_endpoint=service_endpoint, 
                    routing_keys=None,
                    accept=["didcomm/v2"]
                ).to_dict()
            )

        did = peer_did.create_peer_did_numalgo_2(
                encryption_keys=agreem_keys_peer_did,
                signing_keys=auth_keys_peer_did,
                service=service,
            )

        did_doc = DIDDocPeerDID.from_json(peer_did.resolve_peer_did(did))
        for auth_key, kid in zip(auth_keys, did_doc.auth_kids):
            private_key = auth_key[0]
            private_key["kid"] = kid
            await secrets_resolver.add_key(jwk_to_secret(private_key))

        for agreem_key, kid in zip(agreem_keys, did_doc.agreement_kids):
            private_key = agreem_key[0]
            private_key["kid"] = kid
            await secrets_resolver.add_key(jwk_to_secret(private_key))

        return did, auth_keys, agreem_keys
