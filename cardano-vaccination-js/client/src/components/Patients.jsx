import { gql, useQuery } from '@apollo/client'
import PatientRow from './PatientRow.jsx';
import Spinner from './Spinner.jsx';
import {GET_PATIENTS} from '../queries/patientQueries'
import CentreRow from './CentreRow.jsx';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import { FaUserInjured, FaHouseUser} from 'react-icons/fa';

export default function Patients() {
    const {loading, error, data } = useQuery(GET_PATIENTS)
    console.log("---")
    console.log(data)

    if(loading) return <Spinner />
    if(error) return <p> Something went wrong... </p>
    return (<>
        
            { !loading && !error && (
            <Card className='users-card'>
            <Card.Title className="mb-3"><FaUserInjured /> Patients</Card.Title>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>ZZZS Num</th>
                        <th>Email</th>
                        
                        <th>DID</th>
                        <th>DID Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.patients.map((patient) => (
                        <PatientRow key={patient.id} patient={patient} />
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