import React from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { FaSearch, FaCertificate } from "react-icons/fa";
import ListGroup from 'react-bootstrap/ListGroup';
import { GrTransaction } from "react-icons/gr";

import { Link } from "react-router-dom";
import { useState } from "react"
import Image from 'react-bootstrap/Image'

// https://stackoverflow.com/a/38552302
function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};

function getVCTypes(vp) {
  var types = []
  for (var i = 0; i < vp.verifiableCredential.length; i++) {
    var vc = vp.verifiableCredential[i];
    var type = parseJwt(vc.proof.jwt).vc.credentialSubject.vaccine.medicinalProductName
    types.push(type)
  }

  return types.join();

}

function getIssuers(vp) {
  var issuers = []
  for (var i = 0; i < vp.verifiableCredential.length; i++) {
    var vc = vp.verifiableCredential[i];
    var issuer = vc.issuer.id;
    issuers.push(issuer)
  }

  return [...new Set(issuers)].join();

}

function getDate(vp) {
  var dates = []
  for (var i = 0; i < vp.verifiableCredential.length; i++) {
    var vc = vp.verifiableCredential[i];
    var date = vc.issuanceDate;
    dates.push(date)
  }

  return dates.join();
}

export default function VPCard({ vp }) {
  const [selected, setSelected] = useState(false);
  //console.log(vc);
  var json = JSON.parse(vp.verifiedVP, null, 2);
  console.log(json)

  //console.log(selected)

  return (
    <div className='col-md-4' >
      <Card className="mb-4" >
        <Card.Header>
          <Card.Link href={`http://localhost:4000/en/transaction?id=${vp.transactionId}`}><strong><GrTransaction /> {vp.transactionId.substring(0, vp.transactionId.length / 2)}...</strong></Card.Link>

        </Card.Header>

        <ListGroup horizontal variant="flush">
          <ListGroup.Item className="d-flex justify-content-between align-items-center">

            <Image style={{ width: "125px" }} fluid={true} src={`http://0.0.0.0:8081/ipfs/${vp.qr_cid}`} />
          </ListGroup.Item>

          <Card.Body className="m-2">
            <div className="d-flex justify-content-between align-items-center">

              <Card.Text>
              </Card.Text>
            </div>
            <p className="small">Holder: <strong>{json.verifiablePresentation.holder.substring(0, 35)}...</strong></p>
            <p className="small">Issuer(s): <strong>{getIssuers(json.verifiablePresentation).substring(0, 35)}...</strong></p>
            <p className="small">Vaccine(s): <strong>{getVCTypes(json.verifiablePresentation).substring(0, 35)}</strong></p>
            <p className="small">Date: <strong>{getDate(json.verifiablePresentation).substring(0, 35)}</strong></p>
          </Card.Body>

          <ListGroup.Item className="d-flex justify-content-between align-items-center">

            <Link to={"/verifiablePresentation"} state={{ test: json, tid: vp.transactionId }}>
              <Button style={{ alignSelf: 'stretch' }} className="btn-secondary btn-light" variant="link">
                <FaSearch size={36}></FaSearch>
              </Button>
            </Link>
          </ListGroup.Item>

        </ListGroup>
      </Card>
    </div>
  )
}


// <Card.Link href={`http://0.0.0.0:8081/ipfs/${vp.qr_cid}`}><strong>QR: {vp.qr_cid}</strong></Card.Link>
