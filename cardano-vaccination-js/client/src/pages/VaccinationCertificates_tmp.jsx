import Patients from '../components/Patients';
import VaccinationCertificates from '../components/VaccinationCertificates';
import AddPatientModal from '../components/AddPatientModal';
import AddVaccinationCertificateModal from '../components/AddVaccinationCertificateModal';
import { GET_PATIENTS } from "../queries/patientQueries";
import { GET_DOSAGES_BLOCKCHAIN, GET_DOSAGES } from "../queries/dosageQueries";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client"
import { useState } from 'react'
import { ADD_VACCINATIONCERTIFICATE } from "../mutations/vaccinationCertificateMutations";
import { GET_VACCINATIONCERTIFICATE, GET_VACCINATIONCERTIFICATES } from "../queries/vaccinationCertificateQueries";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import { IconContext } from "react-icons";
import { TbVaccine } from "react-icons/tb";
import { ImUserCheck } from "react-icons/im"
import { FaUserInjured, FaHouseUser, FaInfo } from 'react-icons/fa';
import IssueVCModal from "../components/IssueVCModal"
import { MdAddCircleOutline } from "react-icons/md"

export default function VaccinationCertificates_tmp() {
  const today = new Date();

  const [additionalInfo, setAdditionalInfo] = useState('');
  const [vaccineId, setVaccinationInfo] = useState('');
  const [dateControl, setDateControl] = useState(today.toISOString().split('T')[0]);
  const [date, setDate] = useState(parseInt(today.getTime() / 1000).toString());
  const [patientId, setPatientId] = useState('');
  const [vcentreId, setVCentreId] = useState(localStorage.getItem("user_id"));
  const [vcentreDid, setVCentreDid] = useState(localStorage.getItem("user_did"));
  const vcentreAuthKey = localStorage.getItem("privkeyhex");
  const vcentreKey2 = localStorage.getItem("privkeyhex");

  const onSubmit = (e) => {
    console.log(dateControl)
    e.preventDefault();

    console.log(additionalInfo, date, vcentreId, vcentreAuthKey, vcentreKey2, patientId, vaccineId);

    addVaccinationCertificate({ variables: { additionalInfo: additionalInfo, date: date, vcentreId: vcentreId, vcentreAuthKey: vcentreAuthKey, vcentreKey2: vcentreKey2, patientId: patientId, vaccineId: vaccineId, type: 'N' } });
    addVaccinationCertificate({ variables: { additionalInfo: additionalInfo, date: date, vcentreId: vcentreId, vcentreAuthKey: vcentreAuthKey, vcentreKey2: vcentreKey2, patientId: patientId, vaccineId: vaccineId, type: 'S' } });

    //setInfo('');
    //setDate('');
    //setPatientId('');
  };

  const [addVaccinationCertificate] = useMutation(ADD_VACCINATIONCERTIFICATE, {
    update(cache, { data: { addVaccinationCertificate } }) {
      const { vaccinationCertificates } = cache.readQuery({ query: GET_VACCINATIONCERTIFICATES });
      cache.writeQuery({
        query: GET_VACCINATIONCERTIFICATES,
        data: { vaccinationCertificates: vaccinationCertificates.concat([addVaccinationCertificate]) },
      });
    }
  })

  const { error, loading, data } = useQuery(GET_PATIENTS);

  //const availableVaccines = useQuery(GET_DOSAGES_BLOCKCHAIN);
  const availableVaccines = useQuery(GET_DOSAGES);

  const [selectedPatientId, setSelectedPatientId] = useState(null);

  if (loading || availableVaccines.loading) return null;
  if (error || availableVaccines.error) { console.log(error); return <p>Error VaccinationCertificates_tmp</p> };

  return (!loading && !error && (
    <>
      <div class="title">
        <IconContext.Provider value={{ color: '#001133', size: '6rem' }}>
          <><TbVaccine className="mb-3" /></>
        </IconContext.Provider>
        <h2>Vaccination Centre</h2>
        <br></br>
        <h4>Issue new vaccination certificate:</h4>
      </div>

      <Container className='issue-form-container'>
        <Row >

          <Form onSubmit={onSubmit}>

            <Row >
              <Form.Label>Vaccination Centre (Issuer)</Form.Label>
              <Col>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon1">ID</InputGroup.Text>
                  <Form.Control type="text" placeholder="Name" value={vcentreId} onChange={(e) => setVCentreId(e.target.value)} disabled />
                  <Form.Text className="text-muted">
                  </Form.Text>
                </InputGroup>
              </Col>
              <Col>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon1">DID</InputGroup.Text>
                  <Form.Control type="text" placeholder="Name" value={vcentreDid} onChange={(e) => setVCentreDid(e.target.value)} disabled />
                  <Form.Text className="text-muted">
                  </Form.Text>
                </InputGroup>
              </Col>
            </Row>

            <Row>
              <Form.Label>Patient (Subject)</Form.Label>
              <Col>
                <Form.Group className="mb-3" controlId="formPatient">
                  <Form.Select aria-label="Select patient" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                    <option>Select</option>
                    {data.patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} ({patient.zzzs_num}) ({patient.did})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Label>Vaccination</Form.Label>
            <Col>
              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">ID / Description / Notes</InputGroup.Text>
                <Form.Control type="text" placeholder="..." value={additionalInfo} onChange={(e) => { setAdditionalInfo(e.target.value); }} />
                <Form.Text className="text-muted">
                </Form.Text>
              </InputGroup>

              <Form.Group className="mb-3" controlId="formPatient">
                <Form.Select aria-label="Select VACCINE" value={vaccineId} onChange={(e) => { setVaccinationInfo(e.target.value); }}>
                  <option>Select</option>
                  {availableVaccines.data.vaccinationStorages.map((vac) => (
                    <option key={vac.id} value={vac.id}>
                      {vac.name} {vac.id}, Available: {vac.dosage}; ({vac.code})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">Date</InputGroup.Text>
                <Form.Control type="date" placeholder="Description" value={dateControl} onChange={(e) => {
                  var utms = new Date(e.target.value).getTime() / 1000;
                  setDate(utms.toString());
                  setDateControl(e.target.value);
                }} />
                <Form.Text className="text-muted">
                </Form.Text>
              </InputGroup>
            </Col>

            <Button variant="primary" type="submit">
              <IconContext.Provider value={{ color: "white", size: '2rem' }}>
                <><MdAddCircleOutline /></>
              </IconContext.Provider>
              <br></br>
              Submit to blockchain
            </Button>

            <IssueVCModal data={{ additionalInfo: additionalInfo, date: date, vcentreId: vcentreId, vcentreAuthKey: vcentreAuthKey, vcentreKey2: vcentreKey2, patientId: patientId, vaccineId: vaccineId }} VCSelection={[]}>

            </IssueVCModal>

          </Form>
        </Row>
      </Container>

      <div class="title">
        <h4>View issued vaccination certificates:</h4>
      </div>
      <Container fluid className='viewvc-form-container'>
        <Row >
          <Form.Select aria-label="Select patient" onChange={(e) => setSelectedPatientId(e.target.value)}>
            <option>All</option>
            {data.patients.map((patient) => (
              <option key={patient.id} value={patient.id} >
                {patient.name} ({patient.zzzs_num}) ({patient.did})
              </option>
            ))}
          </Form.Select>

          <VaccinationCertificates patientId={selectedPatientId} />
        </Row>
      </Container>
    </>

  ))
}
