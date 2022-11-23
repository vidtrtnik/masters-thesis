import React from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { TbVaccine } from "react-icons/tb";

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { Link } from "react-router-dom";
import { useState } from "react"

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};

function getVCTypes(vp) {
  var types = []
  for(var i=0; i < vp.verifiableCredential.length; i++) {
    var vc = vp.verifiableCredential[i];
    var type = parseJwt(vc.proof.jwt).vc.credentialSubject.degree.type;
    types.push(type)
  }

  return types.join();

}

function getIssuers(vp) {
  var issuers = []
  for(var i=0; i < vp.verifiableCredential.length; i++) {
    var vc = vp.verifiableCredential[i];
    var issuer = vc.issuer.id;
    issuers.push(issuer)
  }

  return [...new Set(issuers)].join();

}

function getDate(vp) {
  var dates = []
  for(var i=0; i < vp.verifiableCredential.length; i++) {
    var vc = vp.verifiableCredential[i];
    var date = vc.issuanceDate;
    dates.push(date)
  }

  return dates.join();
}

export default function VPCard( { vp }) {
  const [selected, setSelected] = useState(false);
  //console.log(vc);
  var json = JSON.parse(vp.verifiedVP, null, 2);
  console.log(json)

  //console.log(selected)

  return (
    <div className='col-md-3' >
        <Card className="mb-3" >
          <Row>
          <Col className="px-3 m-4">
              <TbVaccine size={105}></TbVaccine>
         </Col>

          <Col>
          <Card.Body className="m-2">
                <div className="d-flex justify-content-between align-items-center">
                <Card.Title className="small" >
                Tr.ID: <Card.Link href={`http://localhost:4000/en/transaction?id=${vp.transactionId}`}><strong>{vp.transactionId.substring(0,vp.transactionId.length/2)}...</strong></Card.Link>
                  </Card.Title>
          <Card.Text>
        
            <Button className="btn-secondary btn-light">
            <Link to={"/verifiablePresentation"} state={{test: json, tid: vp.transactionId}}>Link</Link>
            </Button>
            </Card.Text>
              </div>
              <p className="small">Holder: <strong>{json.verifiablePresentation.holder}...</strong></p>
                <p className="small">Issuer(s): <strong>{getIssuers(json.verifiablePresentation)}...</strong></p>
                <p className="small">Vaccine(s): <strong>{getVCTypes(json.verifiablePresentation)}</strong></p>
                <p className="small">Date: <strong>{getDate(json.verifiablePresentation)}</strong></p>
                <Card.Link href={`http://0.0.0.0:8081/ipfs/${vp.qr_cid}`}><strong>QR: {vp.qr_cid}</strong></Card.Link>
                <Card.Img variant="bottom" src={`http://0.0.0.0:8081/ipfs/${vp.qr_cid}`} />
            </Card.Body>
            </Col>
            
            </Row>
          </Card>
    </div>
  )
}
