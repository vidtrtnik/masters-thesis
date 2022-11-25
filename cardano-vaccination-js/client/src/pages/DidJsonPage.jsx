import { Link, useParams } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { useQuery } from '@apollo/client'
import { DID_FETCHALL, DID_RESOLVE } from '../queries/didQueries'

export default function DidJsonPage() {
  const { id } = useParams();
  const { loading, error, data } = useQuery(DID_FETCHALL, { variables: { did: id } });
  const resolve = useQuery(DID_RESOLVE, { variables: { did: id } });

  if (loading && resolve.loading) return <Spinner />
  if (error && resolve.error) return <p>Error</p>;
  console.log(resolve.data)
  return (
    <>
      <Link to="/" className="btn btn-primary ms-auto">
        Back
      </Link>
      {!loading && !error && !resolve.error && !resolve.loading && (
        <div className="mx-auto w-85 card p-5">

          {
            data.did !== null
              ? <a>{data.did.did_doc}</a>
              : <p>Error, cannot fetch did document {id}</p>
          }
        </div>
      )}
      {!resolve.error && !resolve.loading && (
        <p>STATUS:{JSON.stringify(resolve.data.didResolve.status)}</p>
      )}
    </>
  )
}
