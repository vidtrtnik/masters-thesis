import { gql, useQuery } from '@apollo/client'

const GET_VACCINATIONCERTIFICATES = gql`
    query getVaccinationCertificates {
        vaccinationCertificates {
            id
            additionalInfo
            date
            transactionId
            revokeId
            patient {
                id
                did
                email
                name
                zzzs_num
            }
  
            verifiableCredential {
                id
                name
                issuerDid
                subjectDid
                vcJwt
            }
  
            vaccinationCenter {
                id
                did
                name
                address
                
            }

            vaccinationStorage {
                id
                name
                company
                code
                dosage
            }
        }
    }
`;

const GET_VACCINATIONCERTIFICATE = gql`
    query getVaccinationCertificate($id: ID!) {
        vaccinationCertificate(id: $id) {
            id
            additionalInfo
            date
            transactionId
            revokeId
            patient {
                id
                did
                email
                name
                zzzs_num
            }
  
            verifiableCredential {
                id
                name
                issuerDid
                subjectDid
                vcJwt
            }
  
            vaccinationCenter {
                id
                did
                name
                address
                
            }

            vaccinationStorage {
                id
                name
                company
                code
                dosage
            }
    }
}
`;
const GET_VERIFIEDVP_FALLBACK = gql`
    query verifyVPFallback($holder: String!, $verifierKey: String!) {
        verifyVPFallback(holder: $holder, verifierKey: $verifierKey) {
            transactionId
            action
            holder
            verifiedVP
            qr_cid
            status
        }
    }
    `;

const VERIFY_VP = gql`
    query verifyVP($jwt: String!) {
        verifyVP(jwt: $jwt) {
            presentation
            credentials
            status
        }
    }
    `;

const VERIFY_VC = gql`
    query verifyVC($jwt: String!) {
        verifyVC(jwt: $jwt) {
            status
        }
    }
    `;

const GET_DECRYPTEDVC_FALLBACK = gql`
    query decryptVCFallback($privkeyhex: String!) {
        decryptVCFallback(privkeyhex: $privkeyhex) {
            transactionId
            issuer
            action
            vcJwt
            verifiedVC
            qr_cid
        }
    }
    `;
export { GET_VACCINATIONCERTIFICATES, GET_VACCINATIONCERTIFICATE, GET_VERIFIEDVP_FALLBACK, GET_DECRYPTEDVC_FALLBACK, VERIFY_VP, VERIFY_VC };

