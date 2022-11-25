import { gql, useQuery } from '@apollo/client'
import PatientRow from './PatientRow.jsx';
import Spinner from './Spinner.jsx';
import { GET_PATIENTS } from '../queries/patientQueries'
import { GET_DOSAGES } from '../queries/dosageQueries.js';
import DosageRow from './DosageRow.jsx';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import { FaUserInjured, FaHouseUser } from 'react-icons/fa';
import { IconContext } from "react-icons";
import { TbVaccine } from "react-icons/tb";

export default function Storages() {
    const { loading, error, data } = useQuery(GET_DOSAGES)
    console.log("---")
    console.log(data)

    if (loading) return <Spinner />
    if (error) return <p> Error... </p>
    return (<>

        {!loading && !error && (
            <Card className='users-card'>
                <Card.Title className="mb-3"><TbVaccine /> Storages</Card.Title>

                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Company</th>
                            <th>Code</th>
                            <th>Dosages</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.vaccinationStorages.map((dosage) => (
                            <DosageRow key={dosage.id} dosage={dosage} />
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