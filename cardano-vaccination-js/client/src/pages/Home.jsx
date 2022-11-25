import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { IconContext } from "react-icons";
import { TbVaccine } from "react-icons/tb";
import { ImUserCheck } from "react-icons/im"
import { FaUserInjured, FaHouseUser } from 'react-icons/fa';

import Col from 'react-bootstrap/Col';

export default function Home() {

  return (
    <>
      <div class="title">
        <h2><b>Cardano Vaccinator Welcome Page</b></h2>
        <br></br>
        <h4><b>Select role:</b></h4>
      </div>
      <Col className="d-flex">


        <Card className="flex-fill" style={{ width: '18rem' }}>
          <div className='card-icon'>
            <IconContext.Provider value={{ className: "shared-class", size: '9rem' }}>
              <><FaHouseUser /></>
            </IconContext.Provider>
          </div>
          <Card.Body>
            <Card.Title style={{ fontSize: '28px', fontStyle: 'bold' }}>Central Authority</Card.Title>
            <Card.Text style={{ fontSize: '20px', fontStyle: 'italic' }}>
              Register new patients and vaccination centres, manage DID documents...
            </Card.Text>
          </Card.Body>
          <div class='card-button'>
            <Button style={{ fontStyle: 'bold' }} variant="primary" href="/patients">Central Authority</Button>
          </div>
        </Card>

        <Card className="flex-fill" style={{ width: '18rem' }}>
          <div className='card-icon'>
            <IconContext.Provider value={{ className: "shared-class", size: '9rem' }}>
              <><TbVaccine /></>
            </IconContext.Provider>
          </div>
          <Card.Body>
            <div>
              <Card.Title style={{ fontSize: '28px', fontStyle: 'bold' }}>Issuer</Card.Title>
              <Card.Text style={{ fontSize: '20px', fontStyle: 'italic' }}>
                Issue new vaccination certificates
              </Card.Text>
            </div>
          </Card.Body>
          <div class='card-button'>
            <Button variant="primary" href="/vaccinationCertificates">Vaccination Centre</Button>
          </div>
        </Card>

        <Card className="flex-fill" style={{ width: '18rem' }}>
          <div className='card-icon'>
            <IconContext.Provider value={{ className: "shared-class", size: '9rem' }}>
              <><FaUserInjured /></>
            </IconContext.Provider>
          </div>
          <Card.Body>
            <div>
              <Card.Title style={{ fontSize: '28px', fontStyle: 'bold' }}>Holder</Card.Title>
              <Card.Text style={{ fontSize: '20px', fontStyle: 'italic' }}>
                Check for existing vaccination certificates or create
                verifiable presentations
              </Card.Text>
            </div>
          </Card.Body>
          <div class='card-button'>
            <Button variant="primary" href="/holders">Patient</Button>
          </div>
        </Card>

        <Card className="flex-fill" style={{ width: '18rem' }}>
          <div className='card-icon'>
            <IconContext.Provider value={{ className: "shared-class", size: '9rem' }}>
              <><ImUserCheck /></>
            </IconContext.Provider>
          </div>
          <Card.Body>
            <Card.Title style={{ fontSize: '28px', fontStyle: 'bold' }}>Verifier</Card.Title>
            <Card.Text style={{ fontSize: '20px', fontStyle: 'italic' }}>
              Check verifiable presentations of specific user
            </Card.Text>
          </Card.Body>
          <div class='card-button'>
            <Button variant="primary" href="/verifier">Verifier</Button>
          </div>
        </Card>


      </Col>
    </>
  )
}
