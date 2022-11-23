import Spinner from "./Spinner"
import { useQuery } from "@apollo/client"
import { GET_VCSFROMBLOCKCHAIN } from "../queries/vaccinationCertificateQueries";
import { GET_VERIFIEDVP_FALLBACK } from "../queries/vaccinationCertificateQueries";
import VPCard from "./VPCard";

import { useState } from "react"
var Buffer = require('buffer/').Buffer

// const ecies = require("ecies-parity");
// const ecies = require('eciesjs');
// import * as ecies from "ecies-wasm";

export default function VPs({holderDid, verifierKey}) {
    console.log(holderDid, verifierKey)

    const {error, loading, data} = useQuery(GET_VERIFIEDVP_FALLBACK, {variables: {holder: holderDid, verifierKey: verifierKey}});

    if(loading) return <Spinner />;
    if(error) {console.log(error); return <p> Error </p>}

    //console.log(data);

    if(data && !loading && !error) {
                // vc = await tryDecrypt(vcEncHex, privkeyhex);
                // vc = ecies.decrypt(privateKey, vcEnc).toString();
            }

    //console.log(data);

    return (<>
        {   
            data.verifyVPFallback.length > 0 && (
            <div className="row mt-3">
                { data.verifyVPFallback.map((verVP) => (
                    
                    <VPCard vp={verVP} />


                ))}
            </div>
            )
            
        }

    </>);

}