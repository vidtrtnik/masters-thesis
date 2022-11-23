import Spinner from "./Spinner"
import { useQuery } from "@apollo/client"
import VaccinationCertificateCard from "./VaccinationCertificateCard";
import { GET_VACCINATIONCERTIFICATES } from "../queries/vaccinationCertificateQueries"

export default function VaccinationCertificates({patientId}) {
    const { loading, error, data } = useQuery(GET_VACCINATIONCERTIFICATES);
    //console.log("PATIENT_ID: " + patientId)

    if(loading) return <Spinner />;
    if(error) { console.log(error); return <p>Error</p> };

    return (<>
        { data.vaccinationCertificates.length > 0 && (
            <a>PATIENT_ID: {patientId}</a> &&
            <div className="row mt-3">
                { data.vaccinationCertificates.map((vaccinationCertificate) => (
                    
                    patientId == vaccinationCertificate.patient.id && (
                    <VaccinationCertificateCard key={vaccinationCertificate.id} vc={vaccinationCertificate} />
                    )
                ))}
            </div>
        )
                }
    </>
);
            }