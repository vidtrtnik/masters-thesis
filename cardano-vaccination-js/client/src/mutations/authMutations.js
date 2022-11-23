import { gql, useQuery } from '@apollo/client'


const LOGOUT = gql`
    mutation logout {
        logout {
            result
        }
    }
`

export { LOGOUT };

