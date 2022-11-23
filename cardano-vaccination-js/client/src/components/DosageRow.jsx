import {FaTrash, FaEdit, FaDownload, FaKey} from 'react-icons/fa';
import {useMutation} from '@apollo/client';
import { apolloClient } from "../config/gql"
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'
import { gql, useQuery } from '@apollo/client'
import Spinner from './Spinner.jsx';
import { DID_RESOLVE } from '../queries/didQueries.js';
import { Link } from "react-router-dom";
import EditPatientModal from './EditPatientModal';
import { DELETE_CENTRE } from '../mutations/centreMutations.js';
import { GET_CENTRES } from '../queries/centreQueries';
import { DID_FETCHALL } from "../queries/didQueries"
import EditCentreModal from './EditCentreModal';
import Button from 'react-bootstrap/Button';
import { FaCheckCircle, FaTimesCircle, FaQuestionCircle } from 'react-icons/fa';

var fileDownload = require('js-file-download');

export default function DosageRow({ dosage }) {
    return (
        <tr>
            <td>{ dosage.id }</td>
            <td>{ dosage.name }</td>
            <td>{ dosage.company }</td>
            <td><a href={`http://localhost:4000/en/transaction?id=${dosage.code}`}>{ dosage.code }</a></td>
            <td>{ dosage.dosage }</td>
        </tr>
        
    )
}