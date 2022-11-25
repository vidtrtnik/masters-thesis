import { FaTrash, FaEdit, FaDownload, FaKey } from 'react-icons/fa';
import { useMutation } from '@apollo/client';
import { apolloClient } from "../config/gql"
import { gql, useQuery } from '@apollo/client'
import Spinner from './Spinner.jsx';
import { DID_RESOLVE } from '../queries/didQueries.js';
import { DELETE_CENTRE } from '../mutations/centreMutations.js';
import { GET_CENTRES } from '../queries/centreQueries';
import { DID_FETCHALL } from "../queries/didQueries"
import EditVerifierModal from './EditVerifierModal';
import Button from 'react-bootstrap/Button';
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle } from 'react-icons/fa';

var fileDownload = require('js-file-download');

export default function VerifierRow({ verifier }) {
    const { loading, error, data } = useQuery(DID_RESOLVE, {
        variables: { did: verifier.did }
    });

    const [deleteCentre] = useMutation(DELETE_CENTRE, {
        variables: { id: verifier.id },
        refetchQueries: [{ query: GET_CENTRES }],
    });

    async function downloadKeys(ev, did) {
        const r = await apolloClient.query({ query: DID_FETCHALL, variables: { did: did } });
        console.log(r.data.did.did_keys);

        const did_keys_obj = '{ "DID": ' + "\"" + did + "\"" + ', "KEYS":' + r.data.did.did_keys + '}';
        const did_keys = JSON.stringify(JSON.parse(did_keys_obj), null, 2);

        fileDownload(did_keys, did + "_KEYS.json");
    }


    if (loading) return <Spinner />
    if (error) return <p> Error... </p>
    console.log(data)

    return (
        <tr>
            <td>{verifier.id}</td>
            <td>{verifier.name}</td>
            <td>{verifier.address}</td>


            <td>
                {data.didResolve.status == "200"
                    ? <a target='_blank' href={`http://localhost:8080/1.0/identifiers/${verifier.did}`}>{verifier.did}</a>
                    : verifier.did
                }
            </td>
            <td>
                {data.didResolve.status == "200" && <FaCheckCircle style={{ color: "green" }} className='status-icon' /> ||
                    data.didResolve.status == "410" && <FaTimesCircle style={{ color: "red" }} className='status-icon' /> ||
                    data.didResolve.status == "404" && <FaQuestionCircle style={{ color: "yellow" }} className='status-icon' />}
                <p style={{ display: "inline", fontSize: "0.75rem" }} className='rmsg'>({data.didResolve.rmsg})</p>
            </td>


            <td>
                <Button className='ms-2' onClick={deleteCentre}>
                    <FaTrash />
                </Button>

                <Button className='ms-2' onClick={ev => { downloadKeys(ev, verifier.did) }}>
                    <FaKey />
                </Button>

                <EditVerifierModal verifier={verifier} />
            </td>
        </tr>

    )
}