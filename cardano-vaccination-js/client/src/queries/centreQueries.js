import { gql, useQuery } from '@apollo/client'

const GET_CENTRES = gql`
    query getVaccinationCentres {
        vaccinationCentres {
            id
            did
            name
            address
        }
    }
`;

export { GET_CENTRES };

