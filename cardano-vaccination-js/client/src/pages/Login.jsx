import {Buffer} from 'buffer';
import { useState } from "react"
import { apolloClient } from "../config/gql"
import { GET_CHALLENGE, GET_AUTH_RESPONSE, LOGIN } from "../queries/authQueries"
import { AuthContext } from '../context/authContext'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import {BiLogInCircle} from 'react-icons/bi'
import { FaUserInjured, FaHouseUser} from 'react-icons/fa';
import { IconContext } from "react-icons";
import Col from 'react-bootstrap/Col';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import  { Navigate, useNavigate } from 'react-router-dom'

import { JwtCredentialPayload, createVerifiableCredentialJwt } from 'did-jwt-vc'
import { Issuer } from 'did-jwt-vc'
import {ES256KSigner, hexToBytes} from 'did-jwt';
import * as ecies25519 from 'ecies-25519';
import * as encUtils from 'enc-utils';

//import { Secp256k1KeyPair } from '@transmute/secp256k1-key-pair';

const secp256k1 = require('secp256k1');

export default function Login() {
  const navigate = useNavigate();

  const redir = (url, state) => {
      navigate(url, state);
  }
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function onLogin(ev) {
      const r = await apolloClient.query({query: LOGIN, variables: {username: username, password: password}});
      const userid = r.data.loginCA["userid"];
      console.log(r.data.loginCA["userid"]);

      if(userid !== null)
      {
        redir("/patients", {state: {userid: userid}});
        //window.location.replace("/patients");
      }
    }

  return (
    <>
        <div class="title">
    <h2>Login</h2>
    <h2>Central Authority</h2>
    <br></br>
    <h4>Please enter your login credentials:</h4>
    </div>

    <Card className='auth-card'>
    <div className='card-icon'>
        <IconContext.Provider value={{ className: "shared-class", size: '9rem' }}>
          <><BiLogInCircle /></>
        </IconContext.Provider>
        </div>

        <Form className="auth-form">
      <Form.Group className="mb-3" controlId="formDID">
        <Form.Label>Username</Form.Label>
        <Form.Control type="text" placeholder="janez" value={username} onChange={ (e) => setUsername(e.target.value)} />
        <Form.Text className="text-muted">

        </Form.Text>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formKey">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" maxLength={64} placeholder="novak" value={password} onChange={ (e) => setPassword(e.target.value)} />
        <Form.Text className="text-muted">

        </Form.Text>
      </Form.Group>

      <ButtonGroup className='auth-buttons'>
      <Button className="mx-1" id="button_request" variant="primary" type="button" onClick={ev => onLogin(ev)}>
      Login
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
