import strawberry
from fastapi import FastAPI
from strawberry.asgi import GraphQL

import typing
import strawberry
import json

from peerdid import peer_did
from functions import resolve_createTmpDID, resolve_invitation, resolve_send, resolve_receive_latest

from bson import json_util


@strawberry.type
class Msg:
    msg: str

@strawberry.type
class TmpDID:
    did: str
    didkeysau: str
    didkeysag: str

@strawberry.type
class TmpInvitation:
    did: str
    didkeysau: str
    didkeysag: str
    invitation: str
    commid: str

@strawberry.type
class Query:
    @strawberry.field
    def resolver() -> str:
        return RESOLVER_URL

    @strawberry.field
    def resolvePeerDID(self, did: str) -> str:
        r = peer_did.resolve_peer_did(did)
        return str(r)

@strawberry.type
class Mutation:
    @strawberry.mutation
    async def encrypt2(self, sender: str, recipient: str, contents: str, edx: str, edd: str, xkx: str, xkd: str) -> Msg:
        p = await prepareSecretsJson(sender, edx, edd, xkx, xkd)
        message = await prepareMessage(commid, sender, recipient, contents)
        encrypted = await encryptMessage(sender, recipient, message)
        
        return Msg(msg=encrypted.packed_msg)
        
    @strawberry.mutation
    async def decrypt2(self, recipient: str, message: str, edx: str, edd: str, xkx: str, xkd: str) -> Msg:
        p = await prepareSecretsJson(recipient, edx, edd, xkx, xkd)
        print()
        print(message)
        print()
        decrypted = await decryptMessage(message)
        print(decrypted)
        
        contents = decrypted.message.body["msg"]
    
        return Msg(msg=contents)

    @strawberry.mutation
    async def send(self, commid: str, sender: str, recipient: str, contents: str, aukeys: str, agkeys: str) -> Msg:
        print(commid, sender, recipient, contents, aukeys, agkeys)
        result = await resolve_send(commid, sender, recipient, contents, aukeys, agkeys)
        return Msg(msg=result)

    @strawberry.mutation
    async def receiveLatest(self, commid: str, aukeys: str, agkeys: str, passw: str) -> Msg:
        result = await resolve_receive_latest(commid, aukeys, agkeys, passw)
        
        return Msg(msg=result)

    @strawberry.mutation
    async def createTmpDID(self) -> TmpDID:
        tmpdid, enc_au_keys, enc_ag_keys = await resolve_createTmpDID()
        return TmpDID(did=tmpdid, didkeysau=enc_au_keys, didkeysag=enc_ag_keys)

    @strawberry.mutation
    async def invitation(self, passw: str) -> TmpInvitation:
        print("\n\nPASSWORD: ", passw)
        tmpdid, enc_au_keys, enc_ag_keys, encoded_text, commid = await resolve_invitation(passw)
        return TmpInvitation(did=tmpdid, didkeysau=enc_au_keys, didkeysag=enc_ag_keys, invitation=encoded_text, commid=commid)
