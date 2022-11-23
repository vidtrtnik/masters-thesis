import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Header from './components/Header';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client'

import Auth from './pages/Auth';
import Login from './pages/Login';
import Patients from './pages/Patients';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import VaccinationCertificate from './pages/VaccinationCertificate';
import DidJsonPage from './pages/DidJsonPage';
import VaccinationCertificates_tmp from './pages/VaccinationCertificates_tmp';
import HolderVCs from './pages/HolderVCs';

import { apolloClient } from "./config/gql"

import 'bootstrap/dist/css/bootstrap.min.css';
import VerifiableCredential from './pages/VerifiableCredential';
import VerifiablePresentation from './pages/VerifiablePresentation';
import Verifier from './pages/Verifier';

function App() {

  return (
          <div className="App" id="light">

    <ApolloProvider client={apolloClient}>
      <Router>
      <Header />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/verifier' element={<Verifier />} />
          <Route path='/holders' element={<HolderVCs />} />
          <Route path='/auth' element={<Auth />} />
          <Route path='/login' element={<Login />} />
          <Route path='/patients' element={<Patients />} />
          <Route path='/vaccinationCertificates' element={<VaccinationCertificates_tmp />} />
          <Route path='/vaccinationCertificate/:id' element={<VaccinationCertificate />} />
          <Route path='/verifiableCredential' element={<VerifiableCredential />} />
          <Route path='/verifiablePresentation' element={<VerifiablePresentation />} />
          <Route path='/did/:id' element={<DidJsonPage />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      
      </Router>
    </ApolloProvider>

    </div>
  );
}

export default App;
