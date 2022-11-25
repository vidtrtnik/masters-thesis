import Patients from '../components/Patients';
import AddPatientModal from '../components/AddPatientModal';
import AddCentreModal from '../components/AddCentreModal';
import AddVerifierModal from '../components/AddVerifierModal';
import AddStorageModal from '../components/AddStorageModal';
import Centres from '../components/Centres';
import Verifiers from '../components/Verifiers';
import Storages from '../components/Storages';
import { IconContext } from "react-icons";
import { FaUserInjured, FaHouseUser } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

export default function Home(test) {
  const location = useLocation();
  console.log(location)
  console.log(test)
  return (
    <>
      <div class="title">
        <IconContext.Provider value={{ color: '#001133', size: '6rem' }}>
          <><FaHouseUser className="mb-3" /></>
        </IconContext.Provider>
        <h2>Users and storages</h2>
        <h4>id: {location.state ? location.state.userid : "guest"}</h4>
        <br></br>
        <div className="users add-buttons">
          <AddCentreModal />
          <AddPatientModal />
          <AddVerifierModal />
          <AddStorageModal />
        </div>
      </div>

      <Centres />
      <br></br>
      <br></br>
      <Patients />
      <br></br>
      <br></br>
      <Verifiers />
      <br></br>
      <br></br>
      <Storages />
    </>
  )
}
