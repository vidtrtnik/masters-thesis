import { gql, useQuery } from '@apollo/client'
import PatientRow from './PatientRow.jsx';
import Spinner from './Spinner.jsx';
import {GET_PATIENTS} from '../queries/patientQueries'
import { GET_VERIFIERS } from '../queries/verifierQueries.js';
import VerifierRow from './VerifierRow.jsx';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import { FaUserInjured, FaHouseUser} from 'react-icons/fa';
import { IconContext } from "react-icons";
import { TbVaccine } from "react-icons/tb";

export default function Verifiers() {
    const {loading, error, data } = useQuery(GET_VERIFIERS)
    console.log("---")
    console.log(data)

    if(loading) return <Spinner />
    if(error) return <p> Something went wrong... </p>
    return (<>
        
            { !loading && !error && (
            <Card className='users-card'>
                <Card.Title className="mb-3"><TbVaccine /> Verifiers </Card.Title>

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Address</th>
                            
                            <th>DID</th>
                            <th>DID Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.verifiers.map((verifier) => (
                            <VerifierRow key={verifier.id} verifier={verifier} />
                        ))}
                    </tbody>
                </Table>
            </Card>
            )}
    </>
    );
}

/*
 data.patients.map(function(patient) {
                            return <PatientRow key={patient.id} patient={patient} />
                        })
*/