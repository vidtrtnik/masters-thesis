import {Link, useParams} from 'react-router-dom'
import Spinner from '../components/Spinner'
import PatientInfo from '../components/PatientInfo'
import VerifiableCredentialInfo from '../components/VerifiableCredentialInfo'
import EditVaccinationCertificateForm from '../components/EditVaccinationCertificateForm'
import { useQuery } from '@apollo/client'
import { GET_VACCINATIONCERTIFICATE } from '../queries/vaccinationCertificateQueries'
import DeleteVaccinationCertificateButton from '../components/DeleteVaccinationCertificateButton'
import { FaEnvelope, FaPhone, FaIdBadge, FaIdCard, FaBarcode, FaAddressBook, FaDatabase, FaCertificate } from "react-icons/fa"
import { TbFileDigit, TbVaccine } from "react-icons/tb"
import { GrTransaction } from "react-icons/gr";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import { IconContext } from "react-icons";
import React from 'react';

export default function VerifiablePresentation() {
  const location = useLocation()
  const data = location.state.test
  const tid = location.state.tid
  console.log(data.verifiablePresentation.verifiableCredential)
  console.log(tid)

  return (
    <>
    <div class="title">
    <h2>Verifiable Presentation</h2>
    <br></br>
    <h4>Details:</h4>
    </div>

        <div className="mx-auto pb-5 w-75 card p-5">
                <Link to="/" className="btn btn-light btn-sm w-25 d-inline ms-auto">
                    Back
                </Link>
                
                <Row className="mb-5">
        <Col >
                <h3 className="mb-5"><GrTransaction />{tid}</h3>

                <Row>
        <Col>
        <h4>Holder</h4>

      <ListGroup>
      <ListGroup.Item>
        <FaIdCard className="icon" /> {data.verifiablePresentation.holder}
      </ListGroup.Item>
      </ListGroup>

    </Col>
    <Col>
    <h4>Issuer</h4>
      <ListGroup>

      <ListGroup.Item>
      <FaIdCard className="icon" /> {data.payload.iss}
      </ListGroup.Item>
    
    </ListGroup>
    </Col>
    </Row>

                <p>{data.verifiablePresentation.verifiableCredential.map((vc, i) => (
                  <React.Fragment>
                    <br></br>
                    <br></br>
                    <h3><b><TbVaccine />VC {i}</b></h3>
                <h4><b>Time validation:</b></h4>
                <h5><b>Issuance Date: </b>{vc.issuanceDate}</h5>
                <h5><b>Expiration Date: </b>{vc.issuanceDate}</h5>
                <br></br>
                <h4><b>Vaccination Centre Data</b></h4>
                <h5><b>Name: </b>{vc.credentialSubject.administeringCentre}</h5>
                <h5><b>Health proffesional: </b>{vc.credentialSubject.healthProfessional}</h5>
                <h5><b>Country: </b>{vc.credentialSubject.countryOfVaccination}</h5>
                <br></br>
                <h4><b>Patient Data</b></h4>
                <h5><b>DID: </b>{vc.credentialSubject.recipient.did}</h5>
                <h5><b>Name: </b>{vc.credentialSubject.recipient.familyName + ", " + vc.credentialSubject.recipient.givenName}</h5>
                <h5><b>Gender: </b>{vc.credentialSubject.recipient.gender}</h5>
                <h5><b>Birth Date: </b>{vc.credentialSubject.recipient.birthDate}</h5>
                <br></br>
                <h4><b>Vaccine</b></h4>
                <h5><b>ATC Code: </b>{vc.credentialSubject.vaccine.atcCode}</h5>
                <h5><b>Product Name: </b>{vc.credentialSubject.vaccine.medicinalProductName}</h5>
                <h5><b>Company: </b>{vc.credentialSubject.vaccine.marketingAuthorizationHolder}</h5>
                <br></br>
                <br></br>
                  </React.Fragment>
    ))}</p>
                </Col>
    </Row>

    {data.verifiablePresentation.verifiableCredential.map((vc) => (
      <React.Fragment>
        <p>{vc.proof.jwt}</p>
    </React.Fragment>
    ))}

    <Row className="mt-5 mb-5">
        <Col >
                <h4><FaCertificate />Verifiable Presentation Payload</h4>
                <p>{JSON.stringify(data.payload, null, 2)}</p>
                </Col>
    </Row>

 </div>
        
    </>
  )
}
