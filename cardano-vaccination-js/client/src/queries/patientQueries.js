import { gql, useQuery } from '@apollo/client'

const GET_PATIENTS = gql`
    query getPatients {
        patients {
            id
            did
            email
            name
            zzzs_num
        }
    }
`;

const GET_VERIFIERS = gql`
    query getVerifiers {
        verifiers {
            id
            did
            address
        }
    }
`;

export { GET_PATIENTS, GET_VERIFIERS };

