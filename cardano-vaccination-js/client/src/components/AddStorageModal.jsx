import { useState } from "react"
import { useMutation } from "@apollo/client"
import { GET_DOSAGES} from "../queries/dosageQueries";
import { ADD_DOSAGE } from "../mutations/dosageMutations";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { IconContext } from "react-icons";
import { MdAddCircleOutline } from "react-icons/md"

export default function AddStorageModal() {

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [dosage, setDosage] = useState('');
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');

    const [addDosage] = useMutation(ADD_DOSAGE, {
        variables: { name, company, dosage },
        refetchQueries: [{ query: GET_DOSAGES }],
    });
    
    const onSubmit = (e) => {
        e.preventDefault();


        if(name === '')
            return alert();

        addDosage(name, company, dosage);
    };
    
  return (
    <>
    <Button className="m-3" variant="primary" onClick={handleShow}>
    <IconContext.Provider value={{ color: "white", size: '1.7rem' }}>
          <><MdAddCircleOutline /></>
        </IconContext.Provider>
        <br></br>
        Vaccine<br />
        Storage
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add new vaccine storage</Modal.Title>
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
              <Form.Label>Company</Form.Label>
              <Form.Control
                type="text"
                placeholder="Company"
                autoFocus
                onChange={ (e) => setCompany(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Dosages</Form.Label>
              <Form.Control
                type="number"
                placeholder="Number of available dosages"
                onChange={ (e) => setDosage(parseInt(e.target.value))}
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
