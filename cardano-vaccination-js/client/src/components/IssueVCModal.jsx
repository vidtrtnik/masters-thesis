import { useEffect, useState } from "react"
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { IconContext } from "react-icons";
import { MdAddCircleOutline } from "react-icons/md"
import { ADD_VERIFIABLEPRESENTATION, ADD_VC } from "../mutations/vaccinationCertificateMutations";
import { useMutation, useLazyQuery } from "@apollo/client";
import { CREATE_PEER_DID, DIDCOMM_SEND } from "../mutations/didcommMutations"
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink, } from '@apollo/client'
import Form from 'react-bootstrap/Form';

// https://stackoverflow.com/a/38552302
function parseJwt(token) {
  var base64Url = token.split('.')[0];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};

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

export default function IssueVCModal({ data, VCSelection }) {
  console.log(data)
  //const location = useLocation()
  // console.log("!!!!!!!!!!!!!!!!!!!!", data.data, VCSelection)
  //const data = location.state.test;

  const [show, setShow] = useState(false);
  const [did, setDID] = useState("");
  const [vcJwt, setVcJwt] = useState("");
  const [didkeysau, setAUKeys] = useState("");
  const [didkeysag, setAGKeys] = useState("");
  const [pass, setPass] = useState("pass");

  const [invitation, setInvitation] = useState("");
  const [invitationText, setInvitationText] = useState("");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [createPeerDID] = useMutation(CREATE_PEER_DID, {
    onCompleted: (resp) => {
      console.log(resp);

      setDID(resp.createTmpDID.did);
      setAUKeys(resp.createTmpDID.didkeysau);
      setAGKeys(resp.createTmpDID.didkeysag);
    },
    client: didCommClient
  });


  const [sendVC] = useMutation(DIDCOMM_SEND, {
    onCompleted: (data) => {
      console.log(data);
    },
    client: didCommClient
  });

  const [addVC] = useMutation(ADD_VC, {
    onCompleted: (data2) => {
      console.log("ADDVC")
      console.log(data2);
      sendVC({ variables: { commid: invitation.id, sender: did, recipient: invitation.from, contents: data2.addVC.vcJwt, aukeys: didkeysau, agkeys: didkeysag, passw: pass } });
    }
  })



  /*const [addVerifiablePresentation] = useMutation(ADD_VERIFIABLEPRESENTATION, {
    variables: {did: data.user_did, privkeyhex: data.privkeyhex, vcJwt: vcJwtsString},
    refetchQueries: [
      { query: GET_VERIFIEDVP_FALLBACK, variables: {holder: data.user_did} },
    ],
});
  */
  const onSubmit = (e) => {
    e.preventDefault();

    //console.log(vcJwtsString.substring(0,5), data.user_did, data.privkeyhex)
    //addVerifiablePresentation(vcJwtsString, data.user_did, data.privkeyhex);



  };

  const onDIDComm = (e) => {
    e.preventDefault();
    console.log(invitation.id, "did:" + did, invitation.from, didkeysau, didkeysag);
    addVC({ variables: { additionalInfo: data.additionalInfo, date: data.date, vcentreId: data.vcentreId, vcentreAuthKey: data.vcentreAuthKey, vcentreKey2: data.vcentreKey2, patientId: data.patientId, vaccineId: data.vaccineId, type: "N" } });
    addVC({ variables: { additionalInfo: data.additionalInfo, date: data.date, vcentreId: data.vcentreId, vcentreAuthKey: data.vcentreAuthKey, vcentreKey2: data.vcentreKey2, patientId: data.patientId, vaccineId: data.vaccineId, type: "S" } });

    //console.log(vcJwtsString.substring(0,5), data.user_did, data.privkeyhex)
    //addVerifiablePresentation(vcJwtsString, data.user_did, data.privkeyhex);



  };

  const deleteRow = (e) => {
    VCSelection(data.data = data.data.filter(s => { return s !== e }))
  };

  useEffect(() => {
    createPeerDID();
    //addVC({variables: {vaccinationInfo: data.vaccinationInfo, additionalInfo: data.additionalInfo, date: data.date, vcentreId: data.vcentreId, vcentreAuthKey: data.vcentreAuthKey, vcentreKey2: data.vcentreKey2, patientId: data.patientId, patientAuthKey: ""}});
  }, []);

  return (
    <>
      <Button className="m-3" variant="primary" onClick={handleShow}>
        <IconContext.Provider value={{ color: "white", size: '2rem' }}>
          <><MdAddCircleOutline /></>
        </IconContext.Provider>
        <br></br>
        Issue Verifiable Credential
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Issue Verifiable Credential</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          <Form.Group className="mb-3" >
            <Form.Label>Recipient invitation</Form.Label>
            <Form.Control as="textarea" rows={3} value={invitationText} onChange={(e) => { setInvitationText(e.target.value); setInvitation(parseJwt(e.target.value)); }} />
          </Form.Group>
        </Modal.Body>
        {invitation && <p><b>Recipient Peer DID: </b>{invitation.from.substring(0, 30) + "..."}</p>}
        {invitation && <p><b>Communication ID: </b>{invitation.id}</p>}
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>

          <Button variant="primary" onClick={onDIDComm}>
            Send VC
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
