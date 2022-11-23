import { gql, useQuery } from '@apollo/client'

const DID_RESOLVE = gql`
    query didResolve($did: String!) {
        didResolve(did: $did) {
            status
            rmsg
            did
            did_doc
        }
    }
`;

const DID_FETCHALL = gql`
    query did($did: String!) {
        did(did: $did) {
            id
            did
            did_doc
            did_keys
        }
    }
`;

export { DID_RESOLVE, DID_FETCHALL };

