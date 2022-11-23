from didcomm_utils import removeSecrets, prepareSecrets, prepareMessage, encryptMessage, decryptMessage, createInvitation, create_tmp_did
from database import setupDB, insertToDB, getLatest, register, findHash
import random 
import string
import json
from bson.json_util import dumps, loads
import jwt
import bcrypt

async def resolve_send(commid, sender, recipient, contents, aukeys, agkeys):
    secrets_resolver = await prepareSecrets(commid, aukeys, agkeys)
    message = await prepareMessage(commid, sender, recipient, contents)
    encrypted = await encryptMessage(commid, sender, recipient, message, secrets_resolver)
    p = await removeSecrets(commid, aukeys, agkeys)

    print(commid, encrypted)
    insertToDB(commid, {"msg": encrypted.packed_msg})

    return encrypted.packed_msg

async def resolve_invitation(passw):
    tmpdid, enc_au_keys, enc_ag_keys, encoded_text, commid = await createInvitation()

    passwb = passw.encode('utf-8')
    passwh = bcrypt.hashpw(passwb, bcrypt.gensalt())

    register(commid, passwh)
    return tmpdid, enc_au_keys, enc_ag_keys, encoded_text, commid

async def resolve_createTmpDID():
    commid = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    tmpdid, enc_au_keys, enc_ag_keys = await create_tmp_did(commid)
    return tmpdid, enc_au_keys, enc_ag_keys

async def resolve_receive_latest(commid, aukeys, agkeys, passw):
    try:
        passwh = findHash(commid)
        passwb = passw.encode('utf-8')
        result = bcrypt.checkpw(passwb, passwh)
        print(result)
    except:
        print("err")


    dbLatestEntry = getLatest(commid)
    if not dbLatestEntry:
        return ""
    latest = dumps(dbLatestEntry)
    encrypted = loads(latest)
    encrypted = encrypted["msg"]
    encrypted = dumps(encrypted)
    secrets_resolver = await prepareSecrets(commid, aukeys, agkeys)
    message = await decryptMessage(encrypted, secrets_resolver)
    p = await removeSecrets(commid, aukeys, agkeys)
    #print(message)
    
    msg = message.message.body["msg"]
    print("MSG: ", msg)
    isJwt = False
    try:
        header = jwt.get_unverified_header(msg) 
        print("HEADER: ", header)
        isJwt = True
    except:
        print("NOT JWT")
    
    if isJwt:
        #decoded = jwt.decode(msg, options={"verify_signature": False})
        #return "JWT:" + json.dumps(decoded)
        return "JWT:" + msg
        
    return "JWT:" + msg 
