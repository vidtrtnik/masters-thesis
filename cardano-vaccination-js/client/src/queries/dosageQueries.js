import { gql, useQuery } from '@apollo/client'

const GET_DOSAGES = gql`
    query getVaccinationStorages {
        vaccinationStorages {
            id
            name
            company
            code
            hash
            dosage
        }
    }
`;

const GET_DOSAGES_BLOCKCHAIN = gql`
    query getVaccinationStoragesFromBlockchain {
        getVaccinationStoragesFromBlockchain {
            transactionId
            action
            name
            dosage
        }
    }
`;

export { GET_DOSAGES, GET_DOSAGES_BLOCKCHAIN };

