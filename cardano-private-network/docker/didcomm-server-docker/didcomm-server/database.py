from pymongo import MongoClient
from bson.objectid import ObjectId

client = None

def setupDB():
    global client
    client = MongoClient("mongodb://root:example@mongo:27017/")
    print(client.list_database_names())
    print(client)

def insertToDB(col, data):
    mydb = client["didcomm-service"]
    mycol = mydb[col]
    mycol.insert_one(data)

def getLatest(col):
    mydb = client["didcomm-service"]
    mycol = mydb[col]

    cur = mycol.find().limit(1).sort([('$natural',-1)])
    print(cur)
    for doc in cur:
        print("DOC:     ", doc)
        print("DOC ID: ", doc["_id"])
        result = mycol.delete_one({'_id': ObjectId(doc["_id"])})
        print(result)
        return doc

    return None

def register(commid, passwh):
    mydb = client["didcomm-service"]
    mycol = mydb['AUTH']
    mycol.insert_one({"commid": commid, "pass": passwh})

def findHash(commid):
    mydb = client["didcomm-service"]
    mycol = mydb['AUTH']

    cur = mycol.find().limit(1).sort([('$natural',-1)])
    for doc in cur:
        if doc['commid'] == commid:
            return doc['pass']
            
    return None
