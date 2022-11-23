//const { gql, useQuery } = require('@apollo/client')

const GQL_QUERY_GETMETADATAS = `query getMetadatas (
    $label: String!
    $count: Int!
    $offset: Int!
){
    transactions (
        where: {metadata: {key: {_eq: $label}}},
        offset: $offset
        limit: $count,
      order_by: {block: {number: desc}}
      
    ){
        hash
      block {
        number
      }
      metadata  {
        key
        value
      }
    }
    
  }`

  const GQL_MUTATION_ENCRYPT = `mutation encrypt(
    $sender: String!
    $recipient: String!
    $contents: String!
    $edx: String!
    $edd: String!
    $xkx: String!
    $xkd: String!
){
  encrypt(sender: $sender, recipient: $recipient, contents: $contents, edx: $edx, edd: $edd, xkx: $xkx, xkd: $xkd){
    msg
  }
}
`

const GQL_MUTATION_DECRYPT = `mutation decrypt(
  $recipient: String!
  $edx: String!
  $edd: String!
  $xkx: String!
  $xkd: String!
  ){
    decrypt(recipient: $recipient, edx: $edx, edd: $edd, xkx: $xkx, xkd: $xkd){
      msg
    }
  }
`

  module.exports = { 
    GQL_QUERY_GETMETADATAS,
    GQL_MUTATION_ENCRYPT,
    GQL_MUTATION_DECRYPT,
  };

