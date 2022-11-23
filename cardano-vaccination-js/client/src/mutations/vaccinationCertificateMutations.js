import { gql, useQuery } from '@apollo/client'

const ADD_VERIFIABLEPRESENTATION = gql`
    mutation addVerifiablePresentation($did: String!, $privkeyhex: String!, $vcJwt: String!, $verifierId: ID!) {
        addVerifiablePresentation(did: $did, privkeyhex: $privkeyhex, vcJwt: $vcJwt, verifierId: $verifierId)
        {
            id
            issuerDid
            vpJwt
            vp_cid
            vp_qr_cid
        }
    }
`

const ADD_VACCINATIONCERTIFICATE = gql`
    mutation addVaccinationCertificate($additionalInfo: String!, $date: String!, $vcentreId: ID!, $vcentreAuthKey: String!, $vcentreKey2: String!, $patientId: ID!, $vaccineId: ID!, $type: String) {
        addVaccinationCertificate(additionalInfo: $additionalInfo, date: $date, vcentreId: $vcentreId, vcentreAuthKey: $vcentreAuthKey, vcentreKey2: $vcentreKey2, patientId: $patientId, vaccineId: $vaccineId, type: $type) 
        {
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
              cardano_address
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
`

const ADD_VC = gql`
    mutation addVC($additionalInfo: String!, $date: String!, $vcentreId: ID!, $vcentreAuthKey: String!, $vcentreKey2: String!, $patientId: ID!, $vaccineId: ID!, $type: String) {
        addVC(additionalInfo: $additionalInfo, date: $date, vcentreId: $vcentreId, vcentreAuthKey: $vcentreAuthKey, vcentreKey2: $vcentreKey2, patientId: $patientId, vaccineId: $vaccineId, type: $type) 
        {
            id
            name
            issuerDid
            subjectDid
            vcJwt
        }
    }
`

const REVOKE_VC = gql`
    mutation revokeVC($issuerDid: String!, $issuerKey: String!, $index: Int!) {
        revokeVC(issuerDid: $issuerDid, issuerKey: $issuerKey, index: $index)
        {
           status
        }
    }
`

const DELETE_VACCINATIONCERTIFICATE = gql`
    mutation deleteVaccinationCertificate($id: ID!) {
        deleteVaccinationCertificate(id: $id) {
            id
        }
    }
`

const UPDATE_VACCINATIONCERTIFICATE = gql`
    mutation updateVaccinationCertificate($id: ID!, $name: String!, $description: String!, $status: VaccinationCertificateStatusUpdate!) {
        updateVaccinationCertificate(id: $id, name: $name, description: $description, status: $status) 
        {
            id
            name
            description
            status
            patient {
                id
                name
                email
                did
            }
        }
    }
`

export {ADD_VACCINATIONCERTIFICATE, ADD_VC, ADD_VERIFIABLEPRESENTATION, DELETE_VACCINATIONCERTIFICATE, UPDATE_VACCINATIONCERTIFICATE, REVOKE_VC};