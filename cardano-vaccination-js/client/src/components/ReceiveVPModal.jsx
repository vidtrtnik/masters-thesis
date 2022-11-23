import { useEffect, useState } from "react"
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';
import { FaTrash } from "react-icons/fa"
import { IconContext } from "react-icons";
import { MdAddCircleOutline } from "react-icons/md"
import { ADD_VERIFIABLEPRESENTATION, ADD_VC } from "../mutations/vaccinationCertificateMutations";
import { useMutation,  useLazyQuery, useQuery } from "@apollo/client";
import { GET_VERIFIEDVP_FALLBACK, VERIFY_VP } from "../queries/vaccinationCertificateQueries";
import {CREATE_PEER_DID, DIDCOMM_SEND, DIDCOMM_RECEIVE} from "../mutations/didcommMutations"
import { ApolloProvider, ApolloClient, InMemoryCache, createHttpLink, } from '@apollo/client'
import Form from 'react-bootstrap/Form';
import VPCardLocal from "./VPCardLocal";

function parseJwt (token) {
  var base64Url = token.split('.')[0];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
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

export default function ReceiveVPModal({data}) {
  console.log(data)
    //const location = useLocation()
    // console.log("!!!!!!!!!!!!!!!!!!!!", data.data, VCSelection)
    //const data = location.state.test;

    const [timer, setTimer] = useState(null);
    const [show, setShow] = useState(false);
    const [vp, setVP] = useState("");
    const [credentials, setCredentials] = useState([]);
    const [presentation, setPresentation] = useState("");
    const [pass, setPass] = useState("pass");

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [verifyVP] = useLazyQuery(VERIFY_VP, {
      onCompleted: (data) => {
        console.log("verifyVP:");
        console.log(data.verifyVP)

        var credentials = JSON.parse(data.verifyVP["credentials"]);
        console.log(credentials)

        var presentations = JSON.parse(data.verifyVP["presentation"]);
        console.log(presentations)

        setCredentials(credentials)
        setPresentation(presentations)
      }
    });


    const [receiveVC] = useMutation(DIDCOMM_RECEIVE, {
      onCompleted: (data) => {
        console.log("receiveVC: ", data);
        var received = data.receiveLatest.msg;
        if(received.split(":")[0] === "JWT")
        {
          var vp = received.split(":")[1];
          setVP(vp);
          clearInterval(timer);
          verifyVP({variables: {jwt: vp}})
        }
      },
      client: didCommClient
  });

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

    const onBegin = () => {

      var interval = setInterval(() => {
        receiveVC({variables: {commid: data.commid, aukeys: data.didkeysau, agkeys: data.didkeysag, passw: pass}})
      }, 2000);
      console.log(interval)
      setTimer(interval);
    };

    const onEnd = () => {

      console.log(timer)
      clearInterval(timer);
    };
    
  return (
    <>
    <Button className="m-3" variant="primary" onClick={ (e) => {handleShow(); onBegin();}}>
    <IconContext.Provider value={{ color: "white", size: '2rem' }}>
          <><MdAddCircleOutline /></>
        </IconContext.Provider>
        <br></br>
        Receive verifiable presentation
      </Button>

      <Modal show={show} onHide={ (e) => {onEnd(); handleClose();}}>
        <Modal.Header closeButton>
          <Modal.Title>Receive verifiable presentation</Modal.Title>
        </Modal.Header>
        <Modal.Body>

        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
        <Form.Label>Enter holder invitation:</Form.Label>
        <Form.Control as="textarea" rows={2} value={vp} onChange={ (e) => { }} />
        { vp === "" && <p>Waiting for presentations...</p> }
        { vp !== "" && <p>Presentation:</p> }
        { presentation !== "" &&  <VPCardLocal vp={presentation} /> }
        <div className="row mt-3">
        { vp !== "" && credentials.length > 0 && <p>Credentials received: {credentials.length}</p> }
                { credentials.map((vc) => (
                    
                    <p>{vc.verifiableCredential.credentialSubject.vaccine.medicinalProductName}</p>

                ))}
            </div>
      </Form.Group>

        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={ (e) => {onEnd(); handleClose();}}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSubmit}>
            Add
          </Button>
          <Button variant="primary">
            DIDComm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
