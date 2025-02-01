import { useContext, useEffect, useState  } from "react";
import { Alert, Button, Col, Form, Row, Stack } from "react-bootstrap";
import { AuthContext } from "../../../Context/AuthContext.js";
import "./register.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Errors from "../../ErrorFile/errors.js";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Register = () => {      
  const {
    registerInfo,
    updateRegisterInfo,
    registerUser,
    registerError,
    isRegisterLoading,
  } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRePasswordVisibility = () => {
    setShowRePassword(!showRePassword);
  };

  const getErrorMessage = (errorCode) => {
    const error = Errors.find(err => err.code === errorCode);
    return error ? error : { message: "Something went wrong, please try again later!", severity: "high" };
  };
  
  const navigate = useNavigate();

  useEffect(() => {
    if (registerError === "510") {
      const timer = setTimeout(() => {
        navigate("/verify");
      }, 3000); // Καθυστέρηση 3 δευτερολέπτων (3000ms)
  
      // Καθαρισμός του timer αν το component ξεκαθαριστεί ή αν αλλάξει το `registerError`
      return () => clearTimeout(timer);
    }
  }, [registerError, navigate]);
  

  return (
    <>
      <Form onSubmit={registerUser} className="hForma">
        <Row className="lContainer1">
          <Col xs={6}>
            <Stack gap={3}>
              <div className="aristeradeksia">
                <div className="Topiswstoreg">
                  <Link to="/" className="back">
                      <p>Home</p>
                  </Link>
                </div>
                <div className="Topiswstoreg">
                  <Link to="/login" className="tolinkdeksia"> 
                    <p>Login</p>
                  </Link>
                </div>
              </div>
              <h2 className="toh2">Register</h2>
              
              <div className="labelkinput">
                <label htmlFor="username">Username:</label><br/>
                <Form.Control
                  className="toinput"
                  id="username"
                  type="text"
                  placeholder="Username"
                  onChange={(e) =>
                      updateRegisterInfo({ ...registerInfo, username: e.target.value })
                  }
                  value={registerInfo?.username || ""}
                  /><br/>
              </div>
              <div className="labelkinput">
                <label htmlFor="email">Email:</label><br/>
                <Form.Control
                  className="toinput"
                  type="email"
                  id="email"
                  placeholder="Email"
                  onChange={(e) =>
                    updateRegisterInfo({ ...registerInfo, email: e.target.value })
                  }
                  value={registerInfo?.email || ""}
                /><br/>
              </div>
              <label htmlFor="password">Password:</label><br/>
              <div className="labelkinputPass">
                <Form.Control
                    className="toinput"
                    type={showPassword ? "text" : "password"} 
                    id="passwordRE"
                    placeholder="Password"
                    onChange={(e) =>
                      updateRegisterInfo({
                        ...registerInfo,
                        password: e.target.value,
                      })
                    }
                    value={registerInfo?.password || ""}
                  />
                  <span
                    className='toeyelogRE'
                    onClick={togglePasswordVisibility}
                  
                  >
                  {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                </span>
              </div>
              <br/>
              <label htmlFor="repassword">Repeat password:</label><br/>
              <div className="labelkinputPass">
                <Form.Control
                  className="toinput"
                  type={showRePassword ? "text" : "password"} 
                  id="repassword"
                  placeholder="Repeat Password"
                  onChange={(e) =>
                    updateRegisterInfo({
                      ...registerInfo,
                      repassword: e.target.value,
                    })
                  }
                  value={registerInfo?.repassword || ""}
                /> <span
                  className='toeyelogRE'
                  onClick={toggleRePasswordVisibility}
                
                >
                {showRePassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
              </span>
              </div>
            
              {registerError && (
                <Alert 
                  variant="danger" 
                  className="toAlert" 
                  id={getErrorMessage(registerError).severity}
                >
                  <p>{getErrorMessage(registerError).message}</p>
                </Alert>
              )}

              <div className="buttdiv">
                <Button
                  variant="primary"
                  type="submit"
                  className="tobutton"
                  disabled={isRegisterLoading || registerError === "510"}
                >
                  {isRegisterLoading
                    ? "Creating your account, please wait!"
                    : "Regist"}
                </Button>
              </div>
            </Stack>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default Register;