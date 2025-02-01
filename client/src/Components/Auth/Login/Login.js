import './login.css';
import { useContext, useState } from "react";
import { AuthContext } from "../../../Context/AuthContext.js";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Errors from "../../ErrorFile/errors.js";
import { Alert } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { baseUrl} from "../../../Utils/servise.js";

const Login = () => {
  const [credentials, setCredentials] = useState({
      email: "",
      password: "",
  });
  const [passwordFalse, setPasswordFalse] = useState(false);
  const [localError, setLocalError] = useState(null);
  const {
    loading, 
    error, 
    dispatch,
    ForgotPass,
    forgotPassError,
    forgotSuccess,
    isForgotPassLoading
  } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  const navigate = useNavigate();

  const handleChange = (e) => {
      setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // Ελέγχει αν το email είναι σε έγκυρη μορφή
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleClick = async (e) => {
      e.preventDefault();

      // Έλεγχος αν τα πεδία είναι κενά
      if (!credentials.email || !credentials.password) {
          setLocalError({ message: "Please fill out all required fields!" });
          return;
      }

      // Έλεγχος εγκυρότητας email
      if (!validateEmail(credentials.email)) {
          setLocalError({ message: "Please enter a valid email address!" });
          return;
      } else {
        setLocalError("");
      }

      setLocalError(null);
      dispatch({ type: "LOGIN_START" });
      try {
          const res = await axios.post(
            `${baseUrl}/auth/login`, 
            credentials,
            { withCredentials: true } 
          );
          dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details });

          setTimeout(() => {
            navigate('/home');
          }, 100);

      } catch (err) {
          dispatch({ type: "LOGIN_FAILURE", payload: err.response.data });

          if (err.response.data.message === "502") {
            setPasswordFalse(true);
          }

        // Έλεγχος αν το μήνυμα σφάλματος είναι "514"
        if (err.response.data.message === "514") {
            const logUserData = {
                message: err.response.data.message        // Το μήνυμα από την απάντηση
            };

            localStorage.setItem("LogUser", JSON.stringify(logUserData));
            localStorage.setItem("Refresh", true); // Αποθήκευση του Refresh
            localStorage.removeItem('RegistUser');
        }
      }
  };

  
  const handleForgotPass = async (e) => {
    e.preventDefault();
    const toEmail = credentials.email;
    console.log(toEmail);

    // Έλεγχος εγκυρότητας email
    if (!validateEmail(toEmail)) {
        setLocalError({ message: "Please enter a valid email address!" });
        return;
    } else {
      setLocalError("");
    }

    try {
        await ForgotPass(toEmail);
      } catch (err) {
        // setLocalError("Verification failed: " + (verifyError || err.message));
        return;
      }

  };

  const getErrorMessage = (errorCode) => {
    const error = Errors.find(err => err.code === errorCode);
    return error ? error : { message: "Something went wrong, please try again later!", severity: "high" };
  };

  return (
    <div className="login">
        <div className="lContainer">
            <Link to="/" className="backlogin">
                <p>Home</p>
            </Link>
            <div className="tologokaitolabel">
                <h2>Login</h2>
            </div>
            <label className="tolabel" htmlFor="email">Email:</label>
            <input 
                type="email"  // Αλλαγή σε type="email" για επιπλέον έλεγχο
                placeholder="Email" 
                id="email" 
                onChange={handleChange} 
                className="lInput" 
            />   
            <label htmlFor="password">Password:</label>
            <div style={{ position: 'relative', display: 'inline-block' }}>
            <input 
               type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                id="password" 
                onChange={handleChange} 
                className="lInput" 
            /> 
              <span
                className='toeyelog'
                onClick={togglePasswordVisibility}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
              >
                {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
              </span>
            </div>
            <Link to="/register" className="toregister">
                <p>Don't have an account?</p>
            </Link>
            {localError ? (
                <p className="tolocalerroredw">{localError.message}</p>
            ) : (
                (error || forgotPassError || forgotSuccess) && (
            <>
            {error && error.message === "514" ? (
                <Alert 
                variant="danger" 
                className="toerroredw" 
                id={getErrorMessage(error.message).severity}
                >
                <p>{getErrorMessage(error.message).message}</p>
                <div className='verikentro'>
                <Link to="/verify" className='toverilink'>Verify my account</Link>
                </div>
                <br/>
                </Alert>
            ) : (
                <>
                    {error && (
                        <Alert 
                        variant="danger" 
                        className="toerroredw" 
                        id={getErrorMessage(error.message).severity}
                        >
                        <p>{getErrorMessage(error.message).message}</p>
                        </Alert>
                    )}

                    {(forgotPassError || forgotSuccess) && (
                        <Alert 
                        variant="danger" 
                        className="toerroredw" 
                        id={
                            forgotPassError
                            ? getErrorMessage(forgotPassError).severity
                            : forgotSuccess
                            ? getErrorMessage(forgotSuccess).severity
                            : "high"
                          }
                        >
                            <p>
                            {
                                forgotPassError
                                ? getErrorMessage(forgotPassError).message 
                                : forgotSuccess
                                ? getErrorMessage(forgotSuccess).message 
                                : "Something went wrong, please try again later!" // Μήνυμα επιτυχίας
                            }
                            </p>
                        </Alert>
                    )}
                </>
            )}
        </>
    )
)}

            {passwordFalse && (
                <button 
                type="submit" 
                className='toforgotpass' 
                onClick={handleForgotPass} 
                disabled={isForgotPassLoading}
                >
                <span>You forgot your password?</span>
                </button>
            )}

            <button 
                disabled={loading || isForgotPassLoading} 
                onClick={handleClick} 
                className="lButton">
                {
                    loading ? "Loading..." 
                    : isForgotPassLoading ? "Email sending..." 
                    : "Login"}
            </button>
        </div>
    </div>
  );
};

export default Login;