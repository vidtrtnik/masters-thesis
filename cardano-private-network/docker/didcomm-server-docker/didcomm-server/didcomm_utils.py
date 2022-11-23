import json
import base64
import qrcode
import requests
from typing import Optional, List
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

import strawberry
from fastapi import FastAPI
from strawberry.asgi import GraphQL

import typing
from pymongo import MongoClient
from pydantic import BaseModel
from typing import Optional, List

from resolvers import DIDResolverPeerDID, DIDADAResolver
from peer_did import create_peer_did
import string
import random
import os

async def selectDIDResolver(sender):
    didsplit = sender.split(":")
    method = didsplit[1]

    if(method == "ada"):
        print("\nDetected method: ada\n")
        return DIDADAResolver
    if(method == "peer"):
        print("\nDetected method: peer\n")
        return DIDResolverPeerDID
    
    return None

async def removeSecrets(commid, aukeys, agkeys):
    filename = "secrets_" + commid + ".json"
    if os.path.exists(filename):
        os.remove(filename)

async def prepareSecrets(commid, aukeys, agkeys):
    aukeysdec = json.loads(str(base64.urlsafe_b64decode(aukeys), "utf-8"))
    agkeysdec = json.loads(str(base64.urlsafe_b64decode(agkeys), "utf-8"))

    keys = aukeysdec + agkeysdec
    filename = "secrets_" + commid + ".json"
    print(keys)
    print(filename)

    f = open(filename, "w")
    f.write(json.dumps(keys))
    f.close()

    secrets_resolver = SecretsResolverDemo(filename)
    return secrets_resolver
    #await secrets_resolver.add_key(aukeysdec[0])

async def prepareSecretsJson2(did, edx, edd, xkx, xkd):
    template = ""
    with open('secrets_template.json', 'r') as file_template:
      template = file_template.read()
    print(template)
    template = template.replace('Ed25519_x', edx)
    template = template.replace('Ed25519_d', edd)
    template = template.replace('X25519_x', xkx)
    template = template.replace('X25519_d', xkd)
    
    template = template.replace('Ed25519_kid', did + "#key-1")
    template = template.replace('X25519_kid', did + "#key-2")
    
    print(template)

    #with open('secrets.json', 'w') as file:
    #  file.write(template)
    f = open('secrets.json', "w")
    f.write(template)
    f.close()
    
    global secrets_resolver
    secrets_resolver = SecretsResolverDemo()

async def prepareMessage(commid, sender, recipient, contents):
    message = Message(
        body = {"msg": contents},
        id = "unique-id-263e24a422e",
        pthid = commid,
        type = "my-protocol/1.0",
        frm = sender,
        to = [recipient]
    )

    return message

def invitationMessage(commid, sender):
    oob_mesage = {
        "type": "https://didcomm.org/out-of-band/2.0/invitation",
        "id": commid,
        "from": sender,
        "body": {
            "goal_code": "connect",
            "goal": "Start relationship",
            "accept": [
            "didcomm/v2",
            "didcomm/aip2;env=rfc587"
            ],
        }
    }

    return oob_mesage
    
async def encryptMessage2(sender, recipient, message):
    
    packed_msg = await pack_encrypted(
        resolvers_config = ResolversConfig(
            secrets_resolver = secrets_resolver,
            did_resolver = DIDResolverPeerDID()
        ),
        message = message,
        frm = sender,
        to = recipient,
        sign_frm = None,
        pack_config = PackEncryptedConfig(protect_sender_id=False)
    )
    
    return packed_msg

async def encryptMessage(commid, sender, recipient, message, secrets_resolver):
    #print(commid, sender, recipient, message)
    filename = "secrets_" + commid + ".json"
    secrets_resolver = SecretsResolverDemo(filename)

    did_resolver = await selectDIDResolver(sender)

    packed_msg = await pack_encrypted(
        resolvers_config = ResolversConfig(
            secrets_resolver = secrets_resolver,
            did_resolver = did_resolver()
        ),
        message = message,
        frm = sender,
        to = recipient,
        sign_frm = None,
        pack_config = PackEncryptedConfig(protect_sender_id=False)
    )
    
    return packed_msg

async def decryptMessage(message, secrets_resolver):
    msg = json.loads(message)
    #msg = json.dumps(msg_json)
    print(msg)

    did_resolver = DIDResolverPeerDID
    
    unpacked_msg = await unpack(
        resolvers_config=ResolversConfig(
            secrets_resolver=secrets_resolver,
            did_resolver=did_resolver()
        ),
        packed_msg=msg
    )
    
    return unpacked_msg

async def create_tmp_did(commid):
    endpoint = "http://127.0.0.1:2222/comm/" + commid
    tmpdid, au_keys, ag_keys = await create_peer_did(commid=commid, service_endpoint=endpoint)
    enc_au_keys = str(base64.urlsafe_b64encode(json.dumps(au_keys[0]).encode("utf-8")), "utf-8")
    enc_ag_keys = str(base64.urlsafe_b64encode(json.dumps(ag_keys[0]).encode("utf-8")), "utf-8")
    print(enc_au_keys)
    print(enc_ag_keys)
    
    return tmpdid, enc_au_keys, enc_ag_keys


async def createInvitation():
    commid = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    tmpdid, enc_au_keys, enc_ag_keys = await create_tmp_did(commid)

    invitation = invitationMessage(commid, tmpdid)
    plaintext_ws_removed = json.dumps(invitation).replace(" ", "")
    encoded_plaintextjwm = base64.urlsafe_b64encode(plaintext_ws_removed.encode("utf-8"))
    encoded_text = str(encoded_plaintextjwm, "utf-8").replace("=","")
    print(encoded_text)

    return tmpdid, enc_au_keys, enc_ag_keys, encoded_text, commid
