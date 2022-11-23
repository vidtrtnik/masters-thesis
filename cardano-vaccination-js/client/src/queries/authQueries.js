import { gql, useQuery } from '@apollo/client'

const GET_CHALLENGE = gql`
    query getAuthChallenge($did: String!) {
        authChallenge(did: $did) {
            data
        }
    }
`;

const GET_AUTH_RESPONSE = gql`
    query getAuthResponse($did: String!, $response: String!) {
        authResponse(did: $did, response: $response) {
            result
            token
        }
    }
`;

const IS_AUTH = gql`
    query isAuthenticated {
        isAuthenticated {
            user_id
            user_did
        }
    }
`

const LOGIN = gql`
    query loginCA($username: String!, $password: String!) {
        loginCA(username: $username, password: $password) {
            userid
        }
    }
`;

export { GET_CHALLENGE, GET_AUTH_RESPONSE, IS_AUTH, LOGIN };

