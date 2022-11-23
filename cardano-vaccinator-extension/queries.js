var invitationQuery = `
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

var receiveLatestQuery = `
mutation receiveLatest($commid: String!, $aukeys: String!, $agkeys: String!, $passw: String!) {
  receiveLatest(commid: $commid, aukeys: $aukeys, agkeys: $agkeys, passw: $passw) {
    msg
  }
}
`;

var addVP = `
mutation addVP($did: String!, $privkeyhex: String!, $vcJwt: String!) {
  addVP(did: $did, privkeyhex: $privkeyhex, vcJwt: $vcJwt) {
    issuerDid
	vpJwt
  }
}
`;

var sendMutation = `
mutation send($commid: String!, $sender: String!, $recipient: String!, $contents: String!, $aukeys: String!, $agkeys: String!) {
  send(commid: $commid, sender: $sender, recipient: $recipient, contents: $contents, aukeys: $aukeys, agkeys: $agkeys) {
    msg
  }
}
`;

var verifyVCQuery = `
query verifyVC($jwt: String!) {
  verifyVC(jwt: $jwt) {
    credential
    status
  }
}
`;
