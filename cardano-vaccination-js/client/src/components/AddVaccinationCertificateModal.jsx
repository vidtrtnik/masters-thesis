import { useState } from "react"
import { useMutation, useQuery } from "@apollo/client"
import { ADD_VACCINATIONCERTIFICATE } from "../mutations/vaccinationCertificateMutations";
import { GET_PATIENTS } from "../queries/patientQueries";
import { GET_VACCINATIONCERTIFICATE, GET_VACCINATIONCERTIFICATES } from "../queries/vaccinationCertificateQueries";
import { IconContext } from "react-icons";
import { MdAddCircleOutline } from "react-icons/md"

export default function AddVaccinationCertificateModal() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [patientId, setPatientId] = useState('');
    const [status, setStatus] = useState('valid');

    const [addVaccinationCertificate] = useMutation(ADD_VACCINATIONCERTIFICATE, {
        variables: {name, description, patientId, status},
        update(cache, {data: {addVaccinationCertificate}}) {
            const {vaccinationCertificates} = cache.readQuery({query: GET_VACCINATIONCERTIFICATES});
            cache.writeQuery({
                query: GET_VACCINATIONCERTIFICATES,
                data: { vaccinationCertificates: vaccinationCertificates.concat([addVaccinationCertificate])},
            });
        }
    })

    const {error, loading, data} = useQuery(GET_PATIENTS);
    console.log(data);

    const onSubmit = (e) => {
        e.preventDefault();
        console.log(name, description, status, patientId, localStorage.getItem("user_id"));

        if(name === '')
            return alert();

        addVaccinationCertificate(name, description, status, patientId, localStorage.getItem("user_id"));

        setName('');
        setDescription('');
        setStatus('valid');
        setPatientId('');
    };

    if(loading) return null;
    if(error) return 'Error';

  return (
    <>
    { !loading && !error && (
        <>
            <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addVaccinationCertificateModal">
            <IconContext.Provider value={{ color: "white", size: '2rem' }}>
          <><MdAddCircleOutline /></>
        </IconContext.Provider>
        <br></br>
    Vaccination Certificate
    </button>

    <div className="modal fade" id="addVaccinationCertificateModal" tabIndex="-1" aria-labelledby="addVaccinationCertificateModalLabel" aria-hidden="true">
    <div className="modal-dialog">
        <div className="modal-content">
        <div className="modal-header">
            <h5 className="modal-title" id="addVaccinationCertificateModalLabel">New Vaccination Certificate</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div className="modal-body">
            <form onSubmit={onSubmit}>
                <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" id="name" value={name} onChange={ (e) => setName(e.target.value)}/>
                </div>

                <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" id="description" value={description} onChange={ (e) => setDescription(e.target.value)}/>
                </div>

                <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select id="status" className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="valid">Valid</option>
                        <option value="invalid">Invalid</option>
                        <option value="revoked">Revoked</option>
                    </select>
                </div>
                
                <div className="mb-3">
                    <label className="form-label">Patient</label>
                    <select id="patientId" className="form-select" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
                        <option value="">Select Patient</option>
                        { data.patients.map((patient) => (
                            <option key={patient.id} value={patient.id}>
                                {patient.name} ({patient.zzzs_num}) ({patient.did})
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
        
        </div>
    </div>
    </div>
        </>

    )}
    
    </>
  )
}
