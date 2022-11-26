import React from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { FaSearch, FaCertificate } from "react-icons/fa";
import ListGroup from 'react-bootstrap/ListGroup';
import { GrTransaction } from "react-icons/gr";

import { Link } from "react-router-dom";
import Image from 'react-bootstrap/Image'
import jwt_decode from "jwt-decode";

function getVCTypes(vp) {
  var types = []
  for (var i = 0; i < vp.verifiableCredential.length; i++) {
    var vc = vp.verifiableCredential[i];
    var type = jwt_decode(vc.proof.jwt).vc.credentialSubject.vaccine.medicinalProductName
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

function getStatus(statStr) {
  console.log(statStr)
  var statusArray = statStr.split(",");
  var status = true;
  for(var i = 0; i < statusArray.length; i++)
    if(statusArray[i] !== "Valid")
      status = false;

  return status;
}

export default function VPCard({ vp }) {
  var json = JSON.parse(vp.verifiedVP, null, 2);
  var status = getStatus(vp.status)

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
            <p className="small">Status: <strong>{status ? 'Valid': 'Revoked'}</strong></p>
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
