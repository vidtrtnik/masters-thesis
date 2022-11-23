import React from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { TbVaccine } from "react-icons/tb";

import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import { Link } from "react-router-dom";
import { useState } from "react"

export default function VCCard( { handleSelection, vc }) {
  const [selected, setSelected] = useState(false);
  //console.log(vc);
  var json = JSON.parse(vc.verifiedVC, null, 2);
  console.log(json)

  //console.log(selected)

  return (
    <div className='col-md-3' onClick={event => {
      setSelected(!selected); 
      const object = [vc.transactionId, json.verifiableCredential.credentialSubject.degree.type, vc.vcJwt]
      
      handleSelection(object, !selected);
      }}>
        <Card className="mb-3" border={selected && "info"} >
          <Row>
          <Col className="px-3 m-4">
              <TbVaccine size={105}></TbVaccine>
              {selected && <a>OK</a>}
            </Col>

          <Col>
          <Card.Body className="m-2">
                <div className="d-flex justify-content-between align-items-center">
                <Card.Title className="small" >
                Tr.ID: <Card.Link href={`http://localhost:4000/en/transaction?id=${vc.transactionId}`}><strong>{vc.transactionId.substring(0,vc.transactionId.length/2)}...</strong></Card.Link>
                  </Card.Title>
          <Card.Text>
        
            <Button className="btn-secondary btn-light">
            <Link to={"/verifiableCredential"} state={{test: json, tid: vc.transactionId}}>Link</Link>
            </Button>
            
            </Card.Text>
                </div>
                <p className="small">Issuer: <strong>{json.issuer.substring(0,json.issuer.length/2)}...</strong></p>
                <p className="small">Vaccine: <strong>{json.verifiableCredential.credentialSubject.degree.type}</strong></p>
                <p className="small">Date: <strong>{json.verifiableCredential.issuanceDate}</strong></p>

            </Card.Body>
            </Col>
            
            </Row>
          </Card>
    </div>
  )
}
