import React from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { FaSearch, FaCertificate } from "react-icons/fa";
import ListGroup from 'react-bootstrap/ListGroup';
import { Link } from "react-router-dom";

function getVCTypes(vp) {
  console.log(vp)
  var types = []
  for (var i = 0; i < vp.verifiableCredential.length; i++) {
    var vc = vp.verifiableCredential[i];

    var type;
    type = vc.credentialSubject.vaccine.medicinalProductName;
    if (type === undefined || type === "")
      type = vc.credentialSubject.vaccine.atcCode;

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

export default function VPCardLocal({ vp }) {
  var json = vp;
  console.log(json)

  return (
    <Card className="mb-2" >
      <Card.Header>

      </Card.Header>

      <ListGroup horizontal variant="flush">
        <ListGroup.Item className="d-flex justify-content-between align-items-center">

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

          <Link to={"/verifiablePresentation"} state={{ test: json, tid: null }}>
            <Button style={{ alignSelf: 'stretch' }} className="btn-secondary btn-light" variant="link">
              <FaSearch size={36}></FaSearch>
            </Button>
          </Link>
        </ListGroup.Item>

      </ListGroup>
    </Card>
  )
}


// <Card.Link href={`http://0.0.0.0:8081/ipfs/${vp.qr_cid}`}><strong>QR: {vp.qr_cid}</strong></Card.Link>
