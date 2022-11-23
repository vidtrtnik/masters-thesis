import {FaTrash, FaEdit, FaDownload, FaKey} from 'react-icons/fa';
import {useMutation} from '@apollo/client';
import { DELETE_PATIENT } from '../mutations/patientMutations';
import { GET_PATIENTS } from '../queries/patientQueries';
import { GET_VACCINATIONCERTIFICATES } from '../queries/vaccinationCertificateQueries';
import { gql, useQuery } from '@apollo/client'
import Spinner from './Spinner.jsx';
import { DID_RESOLVE } from '../queries/didQueries.js';
import { Link } from "react-router-dom";
import EditPatientModal from './EditPatientModal';
import { apolloClient } from "../config/gql"
import { DID_FETCHALL } from "../queries/didQueries"
import Button from 'react-bootstrap/Button';
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle } from 'react-icons/fa';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

var fileDownload = require('js-file-download');

export default function PatientRow({ patient }) {
    const {loading, error, data } = useQuery(DID_RESOLVE, {
        variables: { did: patient.did }
    });

    const [deletePatient] = useMutation(DELETE_PATIENT, {
        variables: { id: patient.id },
        refetchQueries: [{query: GET_PATIENTS}, {query: GET_VACCINATIONCERTIFICATES}],
        
        /*update(cache, { data: {deleteClient}}) { 
            const { clients } = cache.readQuery({ query: GET_CLIENTS })
            cache.writeQuery({
                query: GET_CLIENTS,
                data: { clients: clients.filter(client => client.id !== deleteClient.id) },
            });
        }
        */
    });

    async function downloadKeys(ev, did) {
        const r = await apolloClient.query({query: DID_FETCHALL, variables: {did: did}});
        console.log(r.data.did.did_keys);

        const did_keys_obj = '{ "DID": ' + "\"" + did + "\"" + ', "KEYS":' + r.data.did.did_keys + '}';
        const did_keys = JSON.stringify(JSON.parse(did_keys_obj), null, 2);

        fileDownload(did_keys, did + "_KEYS.json");


    }

    if(loading) return <Spinner />
    if(error) return <p> Something went wrong... </p>
    console.log(data)

    return (
        <tr>
            <td>{ patient.id }</td>
            <td>{ patient.name }</td>
            <td>{ patient.zzzs_num }</td>
            <td>{ patient.email }</td>
            
            <td>
            { data.didResolve.status == "200"
                ? <a target='_blank' href={`http://localhost:8080/1.0/identifiers/${patient.did}`}>{patient.did}</a>
                : patient.did
            }
            </td>
            <td>
                { data.didResolve.status == "200" && <FaCheckCircle style={{color: "green"}} className='status-icon' /> || 
                  data.didResolve.status == "410" && <FaTimesCircle style={{color: "red"}} className='status-icon' /> || 
                  data.didResolve.status == "404" && <FaQuestionCircle style={{color: "yellow"}} className='status-icon' /> }
                <p style={{display:"inline", fontSize:"0.75rem"}} className='rmsg'>({ data.didResolve.rmsg })</p>
            </td>

            <td>
            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Deactivate DID</Tooltip>}>
                <Button className='ms-2' onClick={deletePatient}>
                    <FaTrash />
                </Button>
                </OverlayTrigger>

                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">Download Keys</Tooltip>}>
                <Button className='ms-2' onClick={ev => {downloadKeys(ev, patient.did)}}>
                    <FaKey />
                </Button>
                </OverlayTrigger>

                <EditPatientModal patient={patient}/>
            </td>
        </tr>
    )
}