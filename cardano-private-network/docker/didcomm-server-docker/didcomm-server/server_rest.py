from fastapi import APIRouter, Request, Form
from functions import resolve_createTmpDID, resolve_invitation, resolve_send
from pydantic import BaseModel
from typing import Union

class Item(BaseModel):
    name: str
    description: Union[str, None] = None
    price: float
    tax: Union[float, None] = None

router = APIRouter()


@router.get("/didcomm/invitation/", tags=["didcomm"])
async def invitation():
    tmpdid, enc_au_keys, enc_ag_keys, encoded_text, commid = await resolve_invitation()
    return {"tmpdid": tmpdid, "encaukeys": enc_au_keys, "encagkeys": enc_ag_keys, "invitation": encoded_text, "commid": commid}

@router.post("/items/")
async def create_item(test1: str = Form(), test2: str = Form()):
    return {"username": "ok"}