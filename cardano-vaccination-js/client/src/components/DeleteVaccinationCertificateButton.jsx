import { useNavigate } from "react-router-dom"
import { FaTrash } from "react-icons/fa"
import { GET_VACCINATIONCERTIFICATES } from "../queries/vaccinationCertificateQueries"
import { DELETE_VACCINATIONCERTIFICATE } from "../mutations/vaccinationCertificateMutations"
import { useMutation } from '@apollo/client'

export default function DeleteVaccinationCertificateButton({ vaccinationCertificateId }) {

  const navigate = useNavigate();

  const [deleteVaccinationCertificate] = useMutation(DELETE_VACCINATIONCERTIFICATE, {
    variables: { id: vaccinationCertificateId },
    onCompleted: () => navigate('/'),
    refetchQueries: [{ query: GET_VACCINATIONCERTIFICATES }],
  })

  return (
    <div className="d-flex mt-5 ms-auto">
      <button className="btn btn danger m-2" onClick={deleteVaccinationCertificate}>
        <FaTrash className="icon" /> Delete Vaccination Certificate
      </button>
    </div>
  )
}
