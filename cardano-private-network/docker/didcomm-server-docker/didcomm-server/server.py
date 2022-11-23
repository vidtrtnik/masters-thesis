import json
import base64
import qrcode
import requests
import strawberry
from fastapi import FastAPI
from strawberry.asgi import GraphQL

import typing
from pydantic import BaseModel
from typing import Optional, List

from resolvers import DIDResolverPeerDID, DIDADAResolver
from peer_did import create_peer_did
import string
import random

from server_graphql import Query, Mutation
from server_rest import router

from database import setupDB, insertToDB
from fastapi.middleware.cors import CORSMiddleware

setupDB()

schema = strawberry.Schema(query=Query, mutation=Mutation)
graphql_app = GraphQL(schema)

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_route("/graphql", graphql_app)
app.add_websocket_route("/graphql", graphql_app)

app.include_router(router)

#@app.get("/didcomm")
#async def root():
#    return {"message": "test"}

#@app.get("/send_invite/{recipient_id}")
#async def send_invite_msg(recipient_id):
#    return {"recipient_id": recipient_id}
