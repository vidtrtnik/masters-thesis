import { gql, useQuery } from '@apollo/client'

const ADD_CENTRE = gql`
    mutation addVaccinationCentre($did: String!, $name: String!, $address: String!) {
        addVaccinationCentre(did: $did, name: $name, address: $address) 
        {
            id
            did
            name
            address
        }
    }
`

const DELETE_CENTRE = gql`
    mutation deleteCentre($id: ID!) {
        deleteCentre(id: $id) 
        {
            id
            did
            name
        }
    }
`

export { ADD_CENTRE, DELETE_CENTRE };