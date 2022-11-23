import { gql, useQuery } from '@apollo/client'

const ADD_DOSAGE = gql`
    mutation addVaccinationStorage($name: String!, $company: String!, $dosage: Int!) {
        addVaccinationStorage(name: $name, company: $company, dosage: $dosage) 
        {
            id
            name
            company
            code
            dosage
        }
    }
`


export { ADD_DOSAGE };