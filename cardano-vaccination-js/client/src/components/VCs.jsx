import Spinner from "./Spinner"
import { useQuery } from "@apollo/client"
import { GET_DECRYPTEDVC_FALLBACK } from "../queries/vaccinationCertificateQueries";
import VCCard from "../components/VCCard";
import { useState } from "react"
var Buffer = require('buffer/').Buffer

// const ecies = require("ecies-parity");
// const ecies = require('eciesjs');
// import * as ecies from "ecies-wasm";

export default function VCs({VCSelection, holder, privkeyhex}) {

    const [selection, setSelection] = useState([]);
    const handleSelection = (newSelected, selected) => {
        console.log(newSelected, selected)
        var originalArrJson = JSON.stringify(selection);
            var newElemJson = JSON.stringify(newSelected);
            console.log(originalArrJson);
            console.log(newElemJson)

        if(selected)
        {
            //if(!selection.includes(newSelected))
            if(originalArrJson.indexOf(newElemJson) == -1)
            {
                setSelection(selection => [...selection, newSelected]);
                VCSelection(selection => [...selection, newSelected]);
            }
        }
        else
        {
            //if(selection.includes(newSelected))
            if(originalArrJson.indexOf(newElemJson) != -1)
            {
                var updated = [];
                for(var i = 0; i < selection.length; i++)
                {
                    var ithJson = JSON.stringify(selection[i]);
                    if(ithJson != newElemJson)
                        updated.push(selection[i]);
                }
                setSelection(updated);
                VCSelection(updated)
            }
        }
    }

    //async function tryDecrypt(vcJwtEnc, privkeyhex) {
    //    const r = await apolloClient.query({query: GET_DECRYPTEDVC_FALLBACK, variables: {vcJwtEnc: vcJwtEnc, privkeyhex: privkeyhex}});
    //    console.log(r.data);
    //    return r.data.decryptVCFallback.vcJwt;
    //}

    const {error, loading, data} = useQuery(GET_DECRYPTEDVC_FALLBACK, {variables: {privkeyhex: privkeyhex}});

    if(loading) return <Spinner />;
    if(error) return <p> Error </p>

    if(data && !loading && !error) {
                // vc = await tryDecrypt(vcEncHex, privkeyhex);
                // vc = ecies.decrypt(privateKey, vcEnc).toString();
            }

    //console.log(data);

    return (<>
        {   
            data.decryptVCFallback.length > 0 && (
            <div className="row mt-3">
                { data.decryptVCFallback.map((decVC) => (
                    
            <VCCard handleSelection={handleSelection} vc={decVC} />

                ))}
            </div>
            )
            
        }
        
    </>);

}

// {selection}