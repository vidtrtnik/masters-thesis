import React from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { TbVaccine } from "react-icons/tb";
import ListGroup from 'react-bootstrap/ListGroup';
import { GrTransaction } from "react-icons/gr";
import { FaSearch, FaCertificate } from "react-icons/fa";
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useMutation, useQuery, useLazyQuery } from "@apollo/client"
import {useState } from 'react'
import { REVOKE_VC } from "../mutations/vaccinationCertificateMutations";

import { Link } from "react-router-dom";

export default function VaccinationCertificateCard( { vc }) {
  console.log(vc);

  const [revokeId, setRevokeId] = useState(parseInt(vc.revokeId));

  const vcentreDid = localStorage.getItem("user_did");
  const vcentreAuthKey = localStorage.getItem("privkeyhex");
  const vcentreKey2 = localStorage.getItem("privkeyhex");

  const [revokeCredential] = useMutation(REVOKE_VC, {
    variables: { issuerDid: vcentreDid, issuerKey: vcentreAuthKey, index: revokeId, },
});

  return (
    <div className='col-md-3' >
        <Card className="mb-3" >
        <Card.Header>
        {vc.transactionId && <Card.Link href={`http://localhost:4000/en/transaction?id=${vc.transactionId}`}><strong><GrTransaction /> {vc.transactionId.substring(0,vc.transactionId.length/2)}...</strong></Card.Link> || <Card.Link href={`Hidden`}><strong><GrTransaction /> {`Hidden`}...</strong></Card.Link>}

         </Card.Header>

          <ListGroup horizontal variant="flush">
          <ListGroup.Item className="d-flex justify-content-between align-items-center">
          <TbVaccine size={105}></TbVaccine>
         </ListGroup.Item>

            <Card.Body className="m-2">
                <div className="d-flex justify-content-between align-items-center">

          <Card.Text>
            </Card.Text>
              </div>
                <p className="small">Patient: <strong>{vc.patient.name}...</strong></p>
                <p className="small">Vaccine: <strong>{vc.vaccinationStorage && vc.vaccinationStorage.name + "(" + vc.vaccinationStorage.company + ")"}</strong></p>
                <p className="small">Date: <strong>{vc.date}</strong></p>
                <p className="small">Revoke ID: <strong>{vc.revokeId}</strong></p>
            </Card.Body>
            
            <ListGroup.Item className="d-flex justify-content-between align-items-center">
            <Button variant="primary" onClick={revokeCredential}>
              Revoke: {vc.revokeId}
            </Button>

            <Link to={`/vaccinationCertificate/${vc.id}`} >
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
