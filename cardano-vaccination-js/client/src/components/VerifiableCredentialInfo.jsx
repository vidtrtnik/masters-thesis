import { FaEnvelope, FaPhone, FaIdBadge } from "react-icons/fa"

export default function VerifiableCredentialInfo({vc}) {
  return (
  <>
    <h5 className="mt-5">VC Information</h5>
    <ul className="list-group">
        <li className="list-group-item">
            <FaIdBadge className="icon" /> {vc.issuer}
        </li>

        <li className="list-group-item">
            <FaEnvelope className="icon" /> {vc.subjectDid}
        </li>

        <li className="list-group-item">
            <FaEnvelope className="icon" /> {vc.vcJwt}
        </li>
    </ul>
    </>
  );
  
}
