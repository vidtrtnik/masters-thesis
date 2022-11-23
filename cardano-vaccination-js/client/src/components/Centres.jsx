import { gql, useQuery } from '@apollo/client'
import PatientRow from './PatientRow.jsx';
import Spinner from './Spinner.jsx';
import {GET_PATIENTS} from '../queries/patientQueries'
import { GET_CENTRES } from '../queries/centreQueries.js';
import CentreRow from './CentreRow.jsx';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import { FaUserInjured, FaHouseUser} from 'react-icons/fa';
import { IconContext } from "react-icons";
import { TbVaccine } from "react-icons/tb";

export default function Centres() {
    const {loading, error, data } = useQuery(GET_CENTRES)
    console.log("---")
    console.log(data)

    if(loading) return <Spinner />
    if(error) return <p> Something went wrong... </p>
    return (<>
        
            { !loading && !error && (
            <Card className='users-card'>
                <Card.Title className="mb-3"><TbVaccine /> Vaccination Centres</Card.Title>

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
                        {data.vaccinationCentres.map((centre) => (
                            <CentreRow key={centre.id} centre={centre} />
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