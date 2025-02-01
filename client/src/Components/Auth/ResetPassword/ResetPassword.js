import './resetPassword.css';
import { Link } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from "../../../Context/AuthContext.js";
import Errors from "../../ErrorFile/errors.js";
import { Alert } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const ResetPassword = () => {
    const [credentials, setCredentials] = useState({
        password1: "",
        password2: "",
    });
    const [localREError, setLocalREError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const {
        ResetPassCheck,
        forgotPassCheckError,
        isResetLoading,
        resetSuccess
      } = useContext(AuthContext);
      const [showPassword1, setShowPassword1] = useState(false);
      const [showPassword2, setShowPassword2] = useState(false);
    
      const togglePasswordVisibility1 = () => {
        setShowPassword1(!showPassword1);
      };
    
      const togglePasswordVisibility2 = () => {
        setShowPassword2(!showPassword2);
      };

    useEffect(() => {
        // Έλεγχος αν το query string περιέχει το token
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        // Αν δεν υπάρχει token ή είναι κενό, κάνε redirect στο "/"
        if (!token) {
        navigate('/');
        }
    }, [location, navigate]);

    const handleChange = (e) => {
        setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };
    
    const handleREClick = async (e) => {
        e.preventDefault();
    
        // Έλεγχος αν τα πεδία είναι κενά
        if (!credentials.password1 || !credentials.password2) {
            setLocalREError({ message: "Please fill out all required fields!" });
            return;
        }
    
        // Έλεγχος αν οι κωδικοί είναι ίδιοι
        if (credentials.password1 !== credentials.password2) {
            setLocalREError({ message: "Passwords do not match!" });
            return;
        } else {
            setLocalREError("");
        }

        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        const password = credentials.password1;

        try {
            // Κλήση της verifyUser από το AuthContext με το token και το code
            await ResetPassCheck(token, password);

        } catch (err) {
            setLocalREError("Reset failed!");
            return;
        }

        setLocalREError(null);
    };

    useEffect(() => {
      if (forgotPassCheckError === "521") {
        const timer = setTimeout(() => {
          navigate("/login");
        }, 3000); 
    
        return () => clearTimeout(timer);
      }
    }, [forgotPassCheckError, navigate]);

    useEffect(() => {
      if (resetSuccess) {
        navigate('/home');
      }
    }, [resetSuccess, navigate]); 

    const getErrorMessage = (errorCode) => {
        const error = Errors.find(err => err.code === errorCode);
        return error ? error : { message: "Something went wrong, please try again later!", severity: "high" };
    };
      
    return (
        <div className='resetMain'>
          <div className="lContainerRE">
            <div className="tologokaitolabelRE">
              <h2>Reset your password</h2>
            </div>
            
            <label className="tolabel" htmlFor="password1">New password:</label>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <input
                type={showPassword1 ? 'text' : 'password'}
                placeholder="New password here"
                id="password1"
                onChange={handleChange}
                className="lInputRE"
              />
              <span
                className='toeye'
                onClick={togglePasswordVisibility1}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
              >
                {showPassword1 ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
              </span>
            </div>

            <label htmlFor="password2">Repeat password:</label>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <input
                type={showPassword2 ? 'text' : 'password'}
                placeholder="Repeat password here"
                id="password2"
                onChange={handleChange}
                className="lInputRE"
              />
              <span
                className='toeye'
                onClick={togglePasswordVisibility2}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
              >
                {showPassword2 ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
              </span>
            </div>
      
            {localREError ? (
              <div className='toerror'>
                  <p className="error">{localREError.message}</p>
              </div>
              ) : (
              forgotPassCheckError && (
                  <>
                  <Alert 
                      variant="danger" 
                      className="toerroredwRE" 
                      id={getErrorMessage(forgotPassCheckError).severity}
                  >
                      <p>{getErrorMessage(forgotPassCheckError).message}</p>
                  </Alert>
                  </>
              )
            )}
            
            <button 
              disabled={isResetLoading} 
              onClick={handleREClick} 
              className="lButtonRE">
                {isResetLoading ? "Prosesing... " : "Reset"}
            </button>
          </div>
        </div>
      );
    }      

export default ResetPassword;
