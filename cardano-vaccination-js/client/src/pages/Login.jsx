import { useState } from "react"
import { apolloClient } from "../config/gql"
import { LOGIN } from "../queries/authQueries"
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import { BiLogInCircle } from 'react-icons/bi'
import { IconContext } from "react-icons";
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { Navigate, useNavigate } from 'react-router-dom'
import { FaUserInjured, FaHouseUser } from 'react-icons/fa';

export default function Login() {
  const navigate = useNavigate();

  const redir = (url, state) => {
    navigate(url, state);
  }
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  async function onLogin(ev) {
    const r = await apolloClient.query({ query: LOGIN, variables: { username: username, password: password } });
    const userid = r.data.loginCA["userid"];
    console.log(r.data.loginCA["userid"]);

    if (userid !== null) {
      redir("/patients", { state: { userid: userid } });
      //window.location.replace("/patients");
    }
  }

  return (
    <>
      <div class="title">
        <div className='card-icon'>
          <IconContext.Provider value={{ className: "shared-class", size: '9rem' }}>
            <><FaHouseUser /></>
          </IconContext.Provider>
        </div>
        <h2>Login</h2>
        <h2>Central Authority</h2>
        <br></br>
        <h4>Please enter your login credentials:</h4>
      </div>

      <Card className='auth-card'>
        <div className='card-icon'>
          <IconContext.Provider value={{ className: "shared-class", size: '9rem' }}>
            <><BiLogInCircle /></>
          </IconContext.Provider>
        </div>

        <Form className="auth-form">
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" placeholder="user" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Form.Text className="text-muted"></Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formKey">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" maxLength={64} placeholder="pass" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Form.Text className="text-muted"></Form.Text>
          </Form.Group>

          <ButtonGroup className='auth-buttons'>
            <Button className="mx-1" id="button_request" variant="primary" type="button" onClick={ev => onLogin(ev)}>
              Login
            </Button>
          </ButtonGroup>
        </Form>
      </Card>
    </>
  )
}
