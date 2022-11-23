import { gql, useQuery } from '@apollo/client'


const CREATE_PEER_DID = gql`
mutation {
    createTmpDID {
      did
      didkeysau
      didkeysag
    }
  }
`
const DIDCOMM_SEND = gql`
mutation send($commid: String!, $sender: String!, $recipient: String!, $contents: String!, $aukeys: String!, $agkeys: String!){
    send(commid: $commid, sender: $sender, recipient: $recipient, contents: $contents, aukeys: $aukeys, agkeys: $agkeys) {
      msg
    }
  }
`
const DIDCOMM_RECEIVE = gql`
mutation receiveLatest($commid: String!, $aukeys: String!, $agkeys: String!, $passw: String!) {
  receiveLatest(commid: $commid, aukeys: $aukeys, agkeys: $agkeys, passw: $passw) {
    msg
  }
}
`
export { CREATE_PEER_DID, DIDCOMM_SEND, DIDCOMM_RECEIVE };

