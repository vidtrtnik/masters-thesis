import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { GET_VACCINATIONCERTIFICATE } from '../queries/vaccinationCertificateQueries'
import { UPDATE_VACCINATIONCERTIFICATE } from '../mutations/vaccinationCertificateMutations';
export default function EditVaccinationCertificateForm({ vaccinationCertificate }) {

    const [name, setName] = useState(vaccinationCertificate.name);
    const [description, setDescription] = useState(vaccinationCertificate.description);
    const [status, setStatus] = useState('');

    const [updateVaccinationCertificate] = useMutation(UPDATE_VACCINATIONCERTIFICATE, {
        variables: { id: vaccinationCertificate.id, name, description, status },
        refetchQueries: [{ query: GET_VACCINATIONCERTIFICATE, variables: { id: vaccinationCertificate.id } }],
    })

    const onSubmit = (e) => {
        e.preventDefault();

        if (!name)
            return alert();

        updateVaccinationCertificate(name, description, status)
    }

    return (
        <>
            <div className='mt-5'>EditVaccinationCertificateForm</div>
            <h3>Update VACCERT Details</h3>
            <form onSubmit={onSubmit}>
                <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select id="status" className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="valid">Valid</option>
                        <option value="invalid">Invalid</option>
                        <option value="revoked">Revoked</option>
                    </select>
                </div>

                <button type='submit' className="btn btn-primary">Submit</button>
            </form>
        </>
    )
}
