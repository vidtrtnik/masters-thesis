import { IS_AUTH } from '../queries/authQueries'
import { LOGOUT } from '../mutations/authMutations';
import { useState } from "react"
import { apolloClient } from "../config/gql"
import { gql, useQuery } from '@apollo/client'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Dropdown from 'react-bootstrap/Dropdown';
import NavItem from 'react-bootstrap/NavItem';
import NavLink from 'react-bootstrap/NavLink';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
export default function Header() {

  const authStatus = useQuery(IS_AUTH);
  const [user_id, setUserId] = useState('');
  const [user_did, setUserDid] = useState('');

  if(!authStatus.loading && !authStatus.error 
    && user_id != authStatus.data.isAuthenticated.user_id
    && user_did != authStatus.data.isAuthenticated.user_did )
    {
        setUserId(authStatus.data.isAuthenticated.user_id);
        setUserDid(authStatus.data.isAuthenticated.user_did);

        localStorage.setItem("user_id", authStatus.data.isAuthenticated.user_id);
        localStorage.setItem("user_did", authStatus.data.isAuthenticated.user_did);
  }

  async function handleSelect(e) {
    alert(`selected ${e}`);
    const r = await apolloClient.mutate({mutation: LOGOUT});
    console.log(r);
    localStorage.removeItem("token");
  };

  return (
    <>
      <Navbar className="navbar" bg="light" variant="light">
        <Container>
          <Navbar.Brand href="/">
            <img
              alt=""
              src="/favicon.ico"
              width="30"
              height="30"
              className="d-inline-block align-top"
            />{' '}
            Cardano Vaccinator
          </Navbar.Brand>

        <Navbar.Collapse className="justify-content-end" >
          {!user_id && 
          <Nav onSelect={handleSelect}>
            <Nav.Item>
            <Nav.Link eventKey="login" href="/auth">
              Login
            </Nav.Link>
          </Nav.Item>
          </Nav>
          }

          {user_id && 
          <Nav onSelect={(e) => handleSelect(e)}>
            <NavDropdown
              id="nav-dropdown-dark-example"
              title={"User:  " + user_id}
              menuVariant="light"
              align={{ lg: 'end' }}
            >
              <NavDropdown.Item eventKey="logout">
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          }

        </Navbar.Collapse>

        

        </Container>
      </Navbar>
      </>
//    <nav className='navbar bg-light mb-4 p-0'>
//        <div className="container">
//            <a className="navbar-brand" href="/">
//                <div className="d-flex">
//                    <div>
//                        Cardano Vaccinator, Logged in: {user_id}, {user_did}
//                    </div>
//                </div>
//            </a>
//        </div>
//    </nav>
  )
}
