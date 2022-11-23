import {useState } from 'react'
import { useMutation } from '@apollo/client'
import { UPDATE_PATIENT } from '../mutations/patientMutations';
import { GET_PATIENTS } from '../queries/patientQueries';
import {FaTrash, FaEdit} from 'react-icons/fa';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

export default function EditCentreModal({centre}) {

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    
    const [name, setName] = useState(centre.name);
    //const [updateCentre] = useMutation(UPDATE_PATIENT, {
    //    variables: {id: patient.id, name: name, zzzs_num: zzzs_num, email: email},
    //    refetchQueries: [{ query: GET_PATIENTS, variables: {id: patient.id}}],
    //})

    const onSubmit = (e) => {
        e.preventDefault();

        if(!name)
            return alert();

        //updatePatient(name, zzzs_num, email)
    }

  return (
    <>
    <Button className='ms-2' variant="primary" onClick={handleShow}>
    <FaEdit />
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Centre {centre.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Name"
                autoFocus
                value={name} 
                onChange={ (e) => setName(e.target.value)}
              />
            </Form.Group>
            
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
