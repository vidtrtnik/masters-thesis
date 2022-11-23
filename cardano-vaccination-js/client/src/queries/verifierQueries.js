import { gql, useQuery } from '@apollo/client'

const GET_VERIFIERS = gql`
    query getVerifiers {
        verifiers {
            id
            did
            name
            address
        }
    }
`;

export { GET_VERIFIERS };

