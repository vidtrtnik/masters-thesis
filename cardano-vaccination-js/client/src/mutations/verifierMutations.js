import { gql, useQuery } from '@apollo/client'

const ADD_VERIFIER = gql`
    mutation addVerifier($did: String!, $name: String!, $address: String!) {
        addVerifier(did: $did, name: $name, address: $address) 
        {
            id
            did
            name
            address
        }
    }
`

const GET_INVITATION = gql`
		mutation invitation($passw: String!) {
      invitation(passw: $passw) {
		  did
		  didkeysau
		  didkeysag
		  commid
		  invitation
		}
	  }
      `;

export { ADD_VERIFIER, GET_INVITATION };