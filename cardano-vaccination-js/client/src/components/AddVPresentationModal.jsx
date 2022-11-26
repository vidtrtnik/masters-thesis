import { useState } from "react"
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import { FaTrash } from "react-icons/fa"
import { IconContext } from "react-icons";
import { MdAddCircleOutline } from "react-icons/md"
import { ADD_VERIFIABLEPRESENTATION } from "../mutations/vaccinationCertificateMutations";
import { useMutation, useQuery } from "@apollo/client";
import { GET_VERIFIEDVP_FALLBACK } from "../queries/vaccinationCertificateQueries";
import { GET_PATIENTS, GET_VERIFIERS } from "../queries/patientQueries";

export default function AddVPresentationModal({ vpdata, VCSelection }) {
  //const location = useLocation()
  // console.log("!!!!!!!!!!!!!!!!!!!!", vpdata.data, VCSelection)
  //const data = location.state.test;

  var vcJwtsArr = []
  for (var i = 0; i < vpdata.data.length; i++) {
    var vcData = vpdata.data[i];
    var vcJwt = vcData[2]
    vcJwtsArr.push(vcJwt);
  }
  var vcJwtsString = vcJwtsArr.join();


  const [show, setShow] = useState(false);
  const [verifierIdd, setVerifierId] = useState(null);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const { error, loading, data } = useQuery(GET_VERIFIERS);

  const [addVerifiablePresentation] = useMutation(ADD_VERIFIABLEPRESENTATION, {
    variables: { did: vpdata.user_did, privkeyhex: vpdata.privkeyhex, vcJwt: vcJwtsString, verifierId: verifierIdd },
    refetchQueries: [
      { query: GET_VERIFIEDVP_FALLBACK, variables: { holder: vpdata.user_did } },
    ],
  });

  const onSubmit = (e) => {
    e.preventDefault();

    console.log(vcJwtsString.substring(0, 5), vpdata.user_did, vpdata.privkeyhex)
    console.log(verifierIdd)
    addVerifiablePresentation(vcJwtsString, vpdata.user_did, vpdata.privkeyhex, verifierIdd);



  };

  const deleteRow = (e) => {
    VCSelection(vpdata.data = vpdata.data.filter(s => { return s !== e }))
  };

  if (loading) return null;
  if (error) { console.log(error); return <p>Error VaccinationCertificates_tmp</p> };
  return (!error && !loading &&
    <>
      <Button className="m-3" variant="primary" onClick={handleShow}>
        <IconContext.Provider value={{ color: "white", size: '2rem' }}>
          <><MdAddCircleOutline /></>
        </IconContext.Provider>
        <br></br>
        Verifiable Presentation
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add new verifiable presentation</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          Holder: { }

          Selected credentials:
          <ListGroup>
            {vpdata.data.map((s) => (

              <ListGroup.Item
                as="li"
                className="d-flex justify-content-between align-items-start"
              >
                <div className="ms-2 me-auto">
                  <div className="fw-bold">{s[1]}</div>
                  {s[0].substring(0, s[0].length / 2)}...
                </div>

                <Button onClick={() => { deleteRow(s); }} variant="danger"><FaTrash /> </Button>{' '}
              </ListGroup.Item>

            ))}
          </ListGroup>

        </Modal.Body>

        <p>Select verifier DID:</p>
        <Form.Select aria-label="Select verifier" value={verifierIdd} onChange={(e) => setVerifierId(e.target.value)}>
          <option>Select</option>
          {data.verifiers.map((verifer) => (
            <option key={verifer.id} value={verifer.id}>
              {verifer.name} ({verifer.did})
            </option>
          ))}
        </Form.Select>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSubmit}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
