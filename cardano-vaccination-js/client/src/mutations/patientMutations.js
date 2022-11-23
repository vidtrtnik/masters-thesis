import { gql, useQuery } from '@apollo/client'

const ADD_PATIENT = gql`
    mutation addPatient($did: String!, $name: String!, $email: String!, $zzzs_num: String!, $cardano_address: String!) {
        addPatient(did: $did, name: $name, email: $email, zzzs_num: $zzzs_num, cardano_address: $cardano_address) 
        {
            id
            did
email
name
zzzs_num
cardano_address
        }
    }
`

const DELETE_PATIENT = gql`
    mutation deletePatient($id: ID!) {
        deletePatient(id: $id) {
            id
            did
email
name
zzzs_num
        }
    }
`;

const UPDATE_PATIENT = gql`
    mutation updatePatient($id: ID!, $name: String!, $zzzs_num: String!, $email: String!) {
        updatePatient(id: $id, name: $name, zzzs_num: $zzzs_num, email: $email) 
        {
            id
        }
    }
`

export { ADD_PATIENT, DELETE_PATIENT, UPDATE_PATIENT };