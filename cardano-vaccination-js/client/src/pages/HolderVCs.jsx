import Patients from '../components/Patients';
import VaccinationCertificates from '../components/VaccinationCertificates';
import AddPatientModal from '../components/AddPatientModal';
import AddVaccinationCertificateModal from '../components/AddVaccinationCertificateModal';
import { GET_PATIENTS } from "../queries/patientQueries";
import { GET_VCSFROMBLOCKCHAIN } from "../queries/vaccinationCertificateQueries";
import { useMutation, useQuery } from "@apollo/client"
import {useState } from 'react'
import { IS_AUTH } from '../queries/authQueries';
import VCs from '../components/VCs';
import VPs from '../components/VPs';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import AddVPresentationModal from '../components/AddVPresentationModal';
import { FaArrowRight, FaKey } from "react-icons/fa"
import { FaUserInjured, FaHouseUser} from 'react-icons/fa';
import { TbVaccine } from "react-icons/tb";
import {ImUserCheck} from "react-icons/im"
import { IconContext } from "react-icons";
export default function HolderVCs() {
  const [VCsel, setVCsel] = useState([]);

  const authStatus = useQuery(IS_AUTH);
  const [user_id, setUserId] = useState(''); //(localStorage.getItem("user_id"));
  const [user_did, setUserDid] = useState('');
  const [privkeyhex, setPrivKeyHex] = useState('');

  if(!authStatus.loading && !authStatus.error 
    && user_id != authStatus.data.isAuthenticated.user_id
    && user_did != authStatus.data.isAuthenticated.user_did )
    {
        setUserId(authStatus.data.isAuthenticated.user_id);
        setUserDid(authStatus.data.isAuthenticated.user_did);

        console.log(localStorage.getItem("privkeyhex"))
        setPrivKeyHex(localStorage.getItem("privkeyhex"));
  }

  const VCSelection = (obj) => {
    //console.log(obj)
    setVCsel(obj)
  }
//<VPs VCSelection={VCSelection} holder={user_did} privkeyhex={privkeyhex}/>
  return ( (
    <>
    <div class="title">
    <IconContext.Provider value={{ color: '#001133', size: '6rem' }}>
          <><FaUserInjured className="mb-3"/></>
        </IconContext.Provider>
        <h2>Your vaccination certificates</h2>
    <br></br>
    <h4>Verifiable credentials on blockchain:</h4>
    </div>

    <Container className='keyhex-container'>
      <Row >
    <InputGroup className="mb-3">
    <InputGroup.Text id="basic-addon1"><FaKey></FaKey></InputGroup.Text>
        <Form.Control
          placeholder="DID private auth. key in hex format"
          aria-label="Auth Key"
          aria-describedby="basic-addon2"
          maxLength={64}
          type="password"
          value={privkeyhex}
          onChange={ (e) => setPrivKeyHex(e.target.value)}
        />
        <Button variant="primary" id="button-addon2" >
          <FaArrowRight></FaArrowRight>
        </Button>
      </InputGroup>
      </Row>
    </Container>

    <Container fluid className='viewvc-form-container'>
        <VCs VCSelection={VCSelection} holder={user_did} privkeyhex={privkeyhex}/>
    </Container>


    <div class="title">
    <h4>Submit new verifiable presentation to the blockchain</h4>
    <AddVPresentationModal vpdata={{user_did: user_did, privkeyhex: privkeyhex, data: VCsel}} VCSelection={VCSelection} />
    </div>
    </>
  ))
}
/*
<Container fluid className='viewvc-form-container'>
      <VPs holderDid={user_did} />
    </Container>

*/