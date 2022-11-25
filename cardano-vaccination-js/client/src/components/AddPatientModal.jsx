import { useState } from "react"
import { useMutation } from "@apollo/client"
import { ADD_PATIENT } from "../mutations/patientMutations";
import { GET_PATIENTS } from "../queries/patientQueries";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { IconContext } from "react-icons";
import { MdAddCircleOutline } from "react-icons/md"

// var cardano_addressTMP = "addr_test1qqe85ssrdvr98y6j2acdlexl22meam6p9pnxmcc6fg8xngh033pydfxc3e2n9pn58x0h06j8lq5mjag2kdqq8u4yxw5sk78ljm";
export default function AddPatientModal() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [did, setDid] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [zzzs_num, setZzzs_num] = useState('');
  const [cardano_address, setCardanoAddress] = useState('None'); //useState(cardano_addressTMP);

  const [addPatient] = useMutation(ADD_PATIENT, {
    variables: { did, email, name, zzzs_num, cardano_address },
    update(cache, { data: { addPatient } }) {
      const { patients } = cache.readQuery({ query: GET_PATIENTS });

      cache.writeQuery({
        query: GET_PATIENTS,
        data: { patients: patients.concat([addPatient]) },
      });
    }
  });

  const onSubmit = (e) => {
    e.preventDefault();
    console.log(did, email, name, zzzs_num);

    if (name === '')
      return alert();

    addPatient(did, email, name, zzzs_num, cardano_address);

    setDid('');
    setEmail('');
    setName('');
    setZzzs_num('');
  };

  return (
    <>
      <Button className="m-3" variant="primary" onClick={handleShow}>
        <IconContext.Provider value={{ color: "white", size: '1.7rem' }}>
          <><MdAddCircleOutline /></>
        </IconContext.Provider>
        <br></br>
        Patient
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add new patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" >
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Name"
                autoFocus
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" >
              <Form.Label>ZZZS Number</Form.Label>
              <Form.Control
                type="number"
                placeholder="ZZZS Num"
                onChange={(e) => setZzzs_num(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" >
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" >
              <Form.Label>DID (optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="DID"
                onChange={(e) => setDid(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" >
              <Form.Label>Cardano Test Address (optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="addr_test1..."
                onChange={(e) => setCardanoAddress(e.target.value)}
              />
            </Form.Group>

          </Form>
        </Modal.Body>
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
