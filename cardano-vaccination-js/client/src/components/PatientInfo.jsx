import { FaEnvelope, FaPhone, FaIdBadge } from "react-icons/fa"

export default function PatientInfo({ patient }) {
    return (
        <>
            <h5 className="mt-5">Information</h5>
            <ul className="list-group">
                <li className="list-group-item">
                    <FaIdBadge className="icon" /> {patient.name}
                </li>

                <li className="list-group-item">
                    <FaEnvelope className="icon" /> {patient.email}
                </li>

                <li className="list-group-item">
                    <FaEnvelope className="icon" /> {patient.zzzs_num}
                </li>

                <li className="list-group-item">
                    <FaEnvelope className="icon" /> {patient.did}
                </li>
            </ul>
        </>
    );

}
