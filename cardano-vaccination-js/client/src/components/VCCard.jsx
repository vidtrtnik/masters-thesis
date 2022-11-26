import React from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { TbVaccine } from "react-icons/tb";
import { FaSearch, FaCertificate } from "react-icons/fa";
import { gql, useQuery } from '@apollo/client'
import { VERIFY_VC } from '../queries/vaccinationCertificateQueries';
import { Link } from "react-router-dom";
import { useState } from "react"
import ListGroup from 'react-bootstrap/ListGroup';
import { GrTransaction } from "react-icons/gr";

export default function VCCard({ handleSelection, vc }) {
  const [selected, setSelected] = useState(false);
  var json = JSON.parse(vc.verifiedVC, null, 2);
  console.log(json)

  const { loading, error, data } = useQuery(VERIFY_VC, {
    variables: { jwt: vc.vcJwt }
  });

  return (
    <div className='col-md-3' onClick={event => {
      setSelected(!selected);
      const object = [vc.transactionId, json.verifiableCredential.credentialSubject.vaccine.medicinalProductName, vc.vcJwt]

      handleSelection(object, !selected);
    }}>
      <Card className="mb-3">
        <Card.Header style={selected ? { backgroundColor: "#00ffff" } : {}}>
          <Card.Link href={`http://localhost:4000/en/transaction?id=${vc.transactionId}`}><strong><GrTransaction /> {vc.transactionId.substring(0, vc.transactionId.length / 2)}...</strong></Card.Link>

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
            <p className="small">Issuer: <strong>{json.issuer.substring(0, json.issuer.length / 2)}...</strong></p>
            <p className="small">Vaccine: <strong>{json.verifiableCredential.credentialSubject.vaccine.medicinalProductName || json.verifiableCredential.credentialSubject.vaccine.atcCode.substring(0, 15)}</strong></p>
            <p className="small">Expiration date: <strong>{json.verifiableCredential.issuanceDate}</strong></p>
            {!loading && !error && data && <p className="small">Status: <strong>{data.verifyVC.status}</strong></p>}
          </Card.Body>

          <ListGroup.Item className="d-flex justify-content-between align-items-center">
            <Button style={{ alignSelf: 'stretch' }} className="btn-secondary btn-light" variant="link">
              <Link to={"/verifiableCredential"} state={{ test: json, tid: vc.transactionId }}><FaSearch size={28} /></Link>
            </Button>
          </ListGroup.Item>

        </ListGroup>
      </Card>
    </div>

  )
}
