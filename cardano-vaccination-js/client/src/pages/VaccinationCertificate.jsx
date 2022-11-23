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
import { IconContext } from "react-icons";

export default function VaccinationCertificate() {
    const { id } = useParams();
    const { loading, error, data } = useQuery(GET_VACCINATIONCERTIFICATE, {variables: {id}});

    if(loading) return <Spinner />
    if(error) { console.log(error); return <p>Error</p> };
  return (
    <>
    <div class="title">
    <h2>Vaccination Certificate</h2>
    <br></br>
    <h4>Details:</h4>
    </div>

        {!loading && !error && (
            <div className="mx-auto pb-5 w-75 card p-5">
                <Link to="/" className="btn btn-light btn-sm w-25 d-inline ms-auto">
                    Back
                </Link>
                <Row className="mb-5">
        <Col >
                <h3 className="mb-3"><FaDatabase />{data.vaccinationCertificate.id}</h3>
                <h4 className="mb-5"><GrTransaction />{data.vaccinationCertificate.transactionId}</h4>
                <h4><TbVaccine />Vaccination Information</h4>
                <h5>Patient: {data.vaccinationCertificate.patient.name}</h5>
                <h5>Vaccine: {data.vaccinationCertificate.vaccinationStorage.name}</h5>
                <h5>Date: {data.vaccinationCertificate.date}</h5>
                <h5>Revoke ID: {data.vaccinationCertificate.revokeId}</h5>
                </Col>
    </Row>

        
        <Row>
        <Col>
        <h4>Holder</h4>

       <ListGroup>
      <ListGroup.Item>
      <FaBarcode className="icon" /> {data.vaccinationCertificate.patient.id}
      </ListGroup.Item>

      <ListGroup.Item>
      <FaIdBadge className="icon" /> {data.vaccinationCertificate.patient.name}
      </ListGroup.Item>

      <ListGroup.Item>
      <TbFileDigit className="icon" /> {data.vaccinationCertificate.patient.zzzs_num}
      </ListGroup.Item>

      <ListGroup.Item>
      <FaIdCard className="icon" /> {data.vaccinationCertificate.patient.did}
      </ListGroup.Item>
    
    </ListGroup>
    </Col>
    <Col>
    <h4>Issuer</h4>
                <ListGroup>
      <ListGroup.Item>
      <FaBarcode className="icon" /> {data.vaccinationCertificate.vaccinationCenter.id}
      </ListGroup.Item>

      <ListGroup.Item>
      <FaIdBadge className="icon" /> {data.vaccinationCertificate.vaccinationCenter.name}
      </ListGroup.Item>

      <ListGroup.Item>
      <FaAddressBook className="icon" /> {data.vaccinationCertificate.vaccinationCenter.address}
      </ListGroup.Item>

      <ListGroup.Item>
      <FaIdCard className="icon" /> {data.vaccinationCertificate.vaccinationCenter.did}
      </ListGroup.Item>
    
    </ListGroup>
    </Col>
    </Row>

    <Row className="mt-5 mb-5">
        <Col >
                <h4><FaCertificate />Verifiable Credential Information</h4>
                <p>{data.vaccinationCertificate.verifiableCredential.vcJwt}</p>
                </Col>
    </Row>

 </div>
        )}
    </>
  )
}
