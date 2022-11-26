import Spinner from "./Spinner"
import { useQuery } from "@apollo/client"
import { GET_VERIFIEDVP_FALLBACK } from "../queries/vaccinationCertificateQueries";
import VPCard from "./VPCard";

export default function VPs({ holderDid, verifierKey }) {
    console.log(holderDid, verifierKey)

    const { error, loading, data } = useQuery(GET_VERIFIEDVP_FALLBACK, { variables: { holder: holderDid, verifierKey: verifierKey } });

    if (loading) return <Spinner />;
    if (error) { console.log(error); return <p> Error </p> }

    return (<>
        {   
            data && !loading && !error && data.verifyVPFallback.length > 0 &&
            (
                <div className="row mt-3">
                    {data.verifyVPFallback.map((verVP) => (
                        <VPCard vp={verVP} />
                    ))}
                </div>
            )
        }
    </>);
}