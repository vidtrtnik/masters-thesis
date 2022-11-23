import { useState } from "react"
import { useMutation } from "@apollo/client"
import { GET_CENTRES } from "../queries/centreQueries";
import { ADD_CENTRE } from "../mutations/centreMutations";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { IconContext } from "react-icons";
import { MdAddCircleOutline } from "react-icons/md"

export default function AddPatientModal() {

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [did, setDid] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');

    const [addCentre] = useMutation(ADD_CENTRE, {
        variables: { did, name, address },
        refetchQueries: [{ query: GET_CENTRES }],
    });
    
    const onSubmit = (e) => {
        e.preventDefault();
        console.log(did, name);

        if(name === '')
            return alert();

        addCentre(did, name, address);

        setDid('');
        setName('');
    };
    
  return (
    <>
    <Button className="m-3" variant="primary" onClick={handleShow}>
    <IconContext.Provider value={{ color: "white", size: '1.7rem' }}>
          <><MdAddCircleOutline /></>
        </IconContext.Provider>
        <br></br>
        Vaccination<br />
        Centre
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add new vaccination centre</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Name"
                autoFocus
                onChange={ (e) => setName(e.target.value)}
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Address"
                autoFocus
                onChange={ (e) => setAddress(e.target.value)}
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
