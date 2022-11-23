import {Buffer} from 'buffer';
import { useState } from "react"
import { apolloClient } from "../config/gql"
import { GET_CHALLENGE, GET_AUTH_RESPONSE } from "../queries/authQueries"
import { AuthContext } from '../context/authContext'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import {BiLogInCircle} from 'react-icons/bi'
import { FaUserInjured, FaHouseUser} from 'react-icons/fa';
import { IconContext } from "react-icons";
import Col from 'react-bootstrap/Col';
import ButtonGroup from 'react-bootstrap/ButtonGroup';

import { JwtCredentialPayload, createVerifiableCredentialJwt } from 'did-jwt-vc'
import { Issuer } from 'did-jwt-vc'
import {ES256KSigner, hexToBytes} from 'did-jwt';
import * as ecies25519 from 'ecies-25519';
import * as encUtils from 'enc-utils';

//import { Secp256k1KeyPair } from '@transmute/secp256k1-key-pair';

const secp256k1 = require('secp256k1');

export default function Auth() {

    var contextType = AuthContext;

    const [did, setDid] = useState('');
    const [keyhex, setKeyHex] = useState('');
    const [challenge, setChallenge] = useState('');
    const [response, setResponse] = useState('');

    async function onRequestChallenge(ev, did) {
        console.log("onRequestChallenge: ", ev, did);
        console.log(ev);
        console.log(did);
        const r = await apolloClient.query({query: GET_CHALLENGE, variables: {did: did}});
        console.log(r.data);
    
        setChallenge(r.data.authChallenge.data);
    }

    async function onTest(ev) {
/*
    const signer = ES256KSigner(hexToBytes(keyhex, false))

      const issuer = {
        did: did,
        signer: signer,
        alg: 'ES256K'
      };

const vcPayload = {
  sub: did,
  nbf: 1562950282,
  vc: {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential'],
    credentialSubject: {
      degree: {
        type: 'BachelorDegree',
        name: 'Baccalauréat en musiques numériques'
      }
    }
  }
}

const vcJwt = await createVerifiableCredentialJwt(vcPayload, issuer)
console.log(vcJwt);
*/

const keyPairB = ecies25519.generateKeyPair();
console.log(keyPairB)

const str = 'test message to encrypt';
const msg = Uint8Array.from(Buffer.from(str, 'utf-8'));

const encrypted = await ecies25519.encrypt(msg, keyPairB.publicKey);

const decrypted = await ecies25519.decrypt(encrypted, keyPairB.privateKey);

console.log(encrypted)
console.log(msg)
console.log(decrypted)
var equals = true;
for(var i=0; i < msg.length; i++) {
  if(msg[i] !== decrypted[i]) {
    equals = false;
    break;
  }
}
console.log(equals);

  }

    async function onConstructResponse(ev, challenge) {
        console.log("onConstructResponse: ", ev, challenge);

        const challengeArr = Uint8Array.from(Buffer.from(challenge, 'hex'));
        const privKey = new Uint8Array(Buffer.from(keyhex, 'hex'));
        const sigObj = secp256k1.ecdsaSign(challengeArr, privKey);

        // var sig_der = secp256k1.signatureExport(sigObj.signature);
        
        console.log(privKey);
        console.log(sigObj);
        //console.log(sig_der);

        const signatureHex = Buffer.from(sigObj.signature).toString('hex');
    
        setResponse(signatureHex);
    }

    async function onSendResponse(ev, challenge) {
        console.log("onConstructResponse: ", ev, challenge);

        const challengeArr = Uint8Array.from(Buffer.from(challenge, 'hex'));
        const privKey = new Uint8Array(Buffer.from(keyhex, 'hex'));
        const sigObj = secp256k1.ecdsaSign(challengeArr, privKey);
        // var sig_der = secp256k1.signatureExport(sigObj.signature);
        
        console.log(privKey);
        console.log(sigObj);
        //console.log(sig_der);

        const signatureHex = Buffer.from(sigObj.signature).toString('hex');
        //setResponse(signatureHex);

        console.log("onSendResponse: ", ev, signatureHex);
        console.log(ev);
        console.log(signatureHex);
        const r = await apolloClient.query({query: GET_AUTH_RESPONSE, variables: {did: did, response: signatureHex}});
        console.log(r.data);

        localStorage.setItem("token", r.data.authResponse.token);
        localStorage.setItem("privkeyhex", keyhex);
    }

//    <div className="form-control">
//                <label htmlFor="response" className="">Response</label>
//                <input type="text" id="response" value={response} onChange={ (e) => setResponse(e.target.value)}/>
//            </div>
// <button id="button_construct" type="button" onClick={ev => onConstructResponse(ev, challenge)}>Construct Response</button>

  return (
    <>
        <div class="title">
    <h2>Login</h2>
    <br></br>
    <h4>Please enter your credentials:</h4>
    </div>

    <Card className='auth-card'>
    <div className='card-icon'>
        <IconContext.Provider value={{ className: "shared-class", size: '9rem' }}>
          <><BiLogInCircle /></>
        </IconContext.Provider>
        </div>

        <Form className="auth-form">
      <Form.Group className="mb-3" controlId="formDID">
        <Form.Label>DID</Form.Label>
        <Form.Control type="text" placeholder="Enter DID" value={did} onChange={ (e) => setDid(e.target.value)} />
        <Form.Text className="text-muted">

        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formKey">
        <Form.Label>Private Auth.Key in hex format</Form.Label>
        <Form.Control type="password" maxLength={64} placeholder="Auth Key" value={keyhex} onChange={ (e) => setKeyHex(e.target.value)} />
        <Form.Text className="text-muted">

        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formChallenge">
        <Form.Label>Challenge</Form.Label>
        <Form.Control type="text" placeholder="Challenge" value={challenge} onChange={ (e) => setChallenge(e.target.value)} disabled />
        <Form.Text className="text-muted">

        </Form.Text>
      </Form.Group>

      <ButtonGroup className='auth-buttons'>
      <Button className="mx-1" id="button_request" variant="primary" type="button" onClick={ev => onRequestChallenge(ev, did)}>
      1. Request Challenge
      </Button>
      <Button className="mx-1" id="button_send" variant="primary" type="button" onClick={ev => onSendResponse(ev, challenge)}>
      2. Send response (Login)
      </Button>
      <Button className="mx-1" id="button_send" variant="primary" type="button" onClick={ev => onTest(ev)}>
      3. Test
      </Button>
      </ButtonGroup>
    </Form>
    </Card>
    </>
  )
}

/*
<form className='auth-form'>
<div className="form-control">
    <label htmlFor="did" className="">DID</label>
    <input type="text" id="did" value={did} onChange={ (e) => setDid(e.target.value)} />
</div>

<div className="form-control">
    <label htmlFor="keyhex" className="">Private Auth Key Hex</label>
    <input type="text" id="keyhex" value={keyhex} onChange={ (e) => setKeyHex(e.target.value)} />
</div>

<div className="form-control">
    <label htmlFor="input_challenge" className="">Challenge</label>
    <input type="text" id="input_challenge" value={challenge} onChange={ (e) => setChallenge(e.target.value)}/>
</div>

<div className="form-actions">
    <button id="button_request" type="button" onClick={ev => onRequestChallenge(ev, did)}>Request Challenge</button>
    
    <button id="button_send" type="button" onClick={ev => onSendResponse(ev, challenge)}>Send response (login)</button>
</div>

</form>
*/
