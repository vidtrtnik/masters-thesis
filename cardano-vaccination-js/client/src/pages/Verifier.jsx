import Patients from '../components/Patients';
import VaccinationCertificates from '../components/VaccinationCertificates';
import AddPatientModal from '../components/AddPatientModal';
import AddVaccinationCertificateModal from '../components/AddVaccinationCertificateModal';
import { GET_PATIENTS } from "../queries/patientQueries";
import { GET_VCSFROMBLOCKCHAIN } from "../queries/vaccinationCertificateQueries";
import { useMutation, useQuery } from "@apollo/client"
import { useState, useEffect } from 'react'
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
import { IconContext } from "react-icons";
import { TbVaccine } from "react-icons/tb";
import {ImUserCheck} from "react-icons/im"
import { FaUserInjured, FaHouseUser} from 'react-icons/fa';
import { GET_INVITATION } from '../mutations/verifierMutations';
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink, } from '@apollo/client'
import QRCode from "react-qr-code";
import ReceiveVPModal from '../components/ReceiveVPModal';

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        patients: {
          merge(existing, incoming) {
            return incoming;
          }
        },
        vaccinationCertificates: {
          merge(existing, incoming) {
            return incoming;
          }
        },
      }
    }
  }
});

const didCommClient = new ApolloClient({
  uri: "http://127.0.0.1:2222/graphql/",
  cache: cache,
  fetchOptions: {
    mode: 'no-cors',
  },
});


export default function Verifier() {

  const [holderDid, setHolderDid] = useState('');
  const [did, setDID] = useState('');
  const [commid, setCommID] = useState('');
  const [keysau, setKeysAU] = useState('');
  const [keysag, setKeysAG] = useState('');
  const [invitation, setInvitation] = useState('');
  const [pass, setPass] = useState('pass');

  const [verifierKey, setVerifierKey] = useState(localStorage.getItem("privkeyhex"));

  const [getInvitation] = useMutation(GET_INVITATION, {
    onCompleted: (resp) => {
      console.log(resp);

      setDID(resp.invitation.did);
      setKeysAU(resp.invitation.didkeysau);
      setKeysAG(resp.invitation.didkeysag); 
      setCommID(resp.invitation.commid); 
      setInvitation(resp.invitation.invitation); 
    },
    client: didCommClient
  });

  useEffect(() => {
    getInvitation({variables: {passw: pass}});
    //addVC({variables: {vaccinationInfo: data.vaccinationInfo, additionalInfo: data.additionalInfo, date: data.date, vcentreId: data.vcentreId, vcentreAuthKey: data.vcentreAuthKey, vcentreKey2: data.vcentreKey2, patientId: data.patientId, patientAuthKey: ""}});
  }, []);

  return ((
    <>
    <div class="title">
    <h2>Check issued vaccination certificates</h2>
    <br></br>
    
    <IconContext.Provider value={{ color: '#001133', size: '6rem' }}>
          <><ImUserCheck className="mb-3"/></>
        </IconContext.Provider>
    </div>
        <QRCode
    size={256}
    style={{ height: "256px", maxWidth: "100%", width: "100%" }}
    value={invitation}
    title={invitation}
    viewBox={`0 0 256 256`}
    level={`H`}
    />
    <InputGroup className="mx-5">
    <InputGroup.Text id="invitationForm">DID-to-DID Invitation</InputGroup.Text>
        <Form.Control
          type="text"
          value={invitation}
        />

      </InputGroup>

      <div class="title">
    <h4>Verifiable presentations on blockchain:</h4>
    </div>

    <Container className='keyhex-container'>
      <Row >
    <InputGroup className="mb-3">
    <InputGroup.Text id="basic-addon1">Holder Did:</InputGroup.Text>
        <Form.Control
          placeholder="did:ada:*"
          aria-label="Holder DID"
          aria-describedby="basic-addon2"
          type="text"
          onChange={ (e) => setHolderDid(e.target.value)}
        />
        <Button variant="primary" id="button-addon2">
          Submit
        </Button>
      </InputGroup>
      </Row>
    </Container>

    <Container fluid className='viewvc-form-container'>
      <VPs holderDid={holderDid} verifierKey={verifierKey} />
    </Container>

    <div class="title">
    <br></br>
    <h4>Receive verifiable presentation:</h4>
    <ReceiveVPModal data={{did: did, didkeysau: keysau, didkeysag: keysag, commid: commid, passw: pass}} />
    </div>
    </>
  ))
}

/*
<div class="title">
    <h4>Manually check verifiable presentation:</h4>
    </div>
    <Container className='manual-check-container'>
      <Row >
    <InputGroup className="mb-3">
    <InputGroup.Text id="manual-check-text-inpu">Verifiable Presentation JWT:</InputGroup.Text>
        <Form.Control
          placeholder="did:ada:*"
          aria-label="Holder DID"
          aria-describedby="basic-addon2"
          type="text"
          onChange={ (e) => setHolderDid(e.target.value)}
        />
        <Button variant="primary" id="button-addon2" >
          Submit
        </Button>
      </InputGroup>
      </Row>
    </Container>

*/