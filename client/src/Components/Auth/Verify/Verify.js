import './verify.css';
import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../Context/AuthContext.js";
import { Alert} from "react-bootstrap";
import Errors from "../../ErrorFile/errors.js";

const Verify = () => {
    const navigate = useNavigate(); 
    const [error, setError] = useState('');
    const [CCode, setCCode] = useState('');
    const {
      verifyUser ,
      verifyError,
      isVerifyLoading,
      verifySuccess,
      ResendEmail,
      resentSuccess,
      isVerifyLoading2
    } = useContext(AuthContext);

    const handleInput = (e) => {
      const input = e.target;
      const nextInputId = input.dataset.next;
      const previousInputId = input.dataset.previous;

      if (input.value.length >= 1 && nextInputId) {
        document.getElementById(nextInputId).focus();
      } else if (input.value.length === 0 && previousInputId) {
        document.getElementById(previousInputId).focus();
      }
    };

    const handleVerify = async () => {
      // Συλλογή των τιμών από τα input πεδία
      const digit1 = document.getElementById('digit-1').value;
      const digit2 = document.getElementById('digit-2').value;
      const digit3 = document.getElementById('digit-3').value;
      const digit4 = document.getElementById('digit-4').value;
      const digit5 = document.getElementById('digit-5').value;
      const digit6 = document.getElementById('digit-6').value;
    
      const fields = [
        { id: 'digit-1', value: digit1 },
        { id: 'digit-2', value: digit2 },
        { id: 'digit-3', value: digit3 },
        { id: 'digit-4', value: digit4 },
        { id: 'digit-5', value: digit5 },
        { id: 'digit-6', value: digit6 }
      ];
    
      // Έλεγχος αν όλα τα πεδία έχουν συμπληρωθεί
      let allFieldsFilled = true;
      fields.forEach(field => {
        const inputElement = document.getElementById(field.id);
        if (!field.value) {
          // Αν το πεδίο είναι άδειο, βάζει κόκκινο border
          inputElement.style.border = '2px solid red';
          allFieldsFilled = false;
        } else {
          // Αν έχει συμπληρωθεί, επαναφέρει το κανονικό border
          inputElement.style.border = '';
        }
      });

      if (!allFieldsFilled) {
        setError("*Please fill in all the fields.");
        return; // Διακοπή αν κάποιο πεδίο είναι άδειο
      } else {
        setError("");
      }

      // Δημιουργία του κωδικού από τα ψηφία
      const code = digit1 + digit2 + digit3 + digit4 + digit5 + digit6;
      setCCode(code); // Αποθήκευση του κωδικού στο state
  
      try {
        // Κλήση της verifyUser από το AuthContext με το token και το code
        await verifyUser(code);
      } catch (err) {
        setError("Verification failed: " + (verifyError || err.message));
        return;
      }
    };

    const handleResendEmail = async () => {
      try {
        // Κλήση της ResendEmail χωρίς πρόσθετα δεδομένα
        await ResendEmail();
      } catch (err) {
        setError("Failed to resend email: " + err.message);
      }
    };
    

    // Έλεγχος στο useEffect για πλοήγηση αν δεν υπάρχει χρήστης στο localStorage
    useEffect(() => {
      const RegUser = localStorage.getItem('RegistUser');
      const LogUser = localStorage.getItem('LogUser');
      
      if (!RegUser && !LogUser) {
        navigate('/login');  // Αυτόματη πλοήγηση αν δεν υπάρχει χρήστης
      }
    }, [navigate]);

    useEffect(() => {
      if (verifySuccess) {
      
        setTimeout(() => {
          navigate('/home');
        }, 3000);
      }
    }, [verifySuccess, navigate]);

    useEffect(() => {
      const refreshValue = localStorage.getItem("Refresh"); // Παίρνουμε την τιμή του Refresh
  
      try {
          const isRefreshNeeded = JSON.parse(refreshValue); // Μετατρέπουμε τη string τιμή σε boolean
  
          if (isRefreshNeeded) {
              // Κάνε refresh
              window.location.reload();
  
              // Αφαίρεσε το Refresh από το localStorage μετά το refresh
              localStorage.removeItem("Refresh");
          } else {
              // console.log("No refresh needed.");
          }
      } catch (error) {
          console.error("Error parsing Refresh value:", error);
      }
  }, []);   
  
    const getErrorMessage = (errorCode) => {
      const error = Errors.find(err => err.code === errorCode);
      return error ? error : { message: "Something went wrong, please try again later!", severity: "high" };
    };
  
  return (
    <div className='Verify'>
        <div className="VerifyDiv">
            {verifyError === "513" && (
                <div className="TopiswstoregV">
                    <Link to="/login" className="tolinkdeksiaV"> 
                        <p>Login</p>
                    </Link>
                </div>
            )}

            <div className="toh2V">
                <h2>Verify</h2>
            </div>

            <div className='tokeimenoV'>
                <p>Your account is almost ready, you will need to enter the 6 digit code you received in your email to verify your account!</p>
            </div>

            {/* Εμφάνιση μηνύματος λάθους αν υπάρχει */}
              {error && <div className='toerr'>
                  <p>{error}</p>
              </div>
            }


            <div id="otp" className="flexotp">
                <input 
                  className="textotp" 
                  type="text" 
                  id="digit-1" 
                  name="digit-1" 
                  data-next="digit-2" 
                  maxLength="1" 
                  onInput={handleInput} 
                />
                <input 
                  className="textotp" 
                  type="text" 
                  id="digit-2" 
                  name="digit-2" 
                  data-next="digit-3" 
                  data-previous="digit-1" 
                  maxLength="1" 
                  onInput={handleInput} 
                />
                <input 
                  className="textotp" 
                  type="text" 
                  id="digit-3" 
                  name="digit-3" 
                  data-next="digit-4" 
                  data-previous="digit-2" 
                  maxLength="1" 
                  onInput={handleInput} 
                />
                <input 
                  className="textotp" 
                  type="text" 
                  id="digit-4" 
                  name="digit-4" 
                  data-next="digit-5" 
                  data-previous="digit-3" 
                  maxLength="1" 
                  onInput={handleInput} 
                />
                <input 
                  className="textotp" 
                  type="text" 
                  id="digit-5" 
                  name="digit-5" 
                  data-next="digit-6" 
                  data-previous="digit-4" 
                  maxLength="1" 
                  onInput={handleInput} 
                />
                <input 
                  className="textotp" 
                  type="text" 
                  id="digit-6" 
                  name="digit-6" 
                  data-previous="digit-5" 
                  maxLength="1" 
                  onInput={handleInput} 
                />
            </div>
           
            {!verifySuccess && (verifyError || resentSuccess) && (
              <Alert 
                variant={verifyError ? "danger" : "success"} 
                className="toAlertVer" 
                id={
                  verifyError 
                    ? getErrorMessage(verifyError).severity
                    : resentSuccess
                    ? getErrorMessage(resentSuccess).severity
                    : "high"
                }
              >
                <p>
                  {verifyError 
                    ? getErrorMessage(verifyError).message 
                    : resentSuccess
                    ? getErrorMessage(resentSuccess).message 
                    : "Something went wrong, please try again later!"
                  }
                </p>
              </Alert>
            )}

            {verifySuccess && (
              <Alert 
                variant="success" 
                className="toAlertVer" 
                id="success"
              >
                <p>The account has been successfully verified. Please wait.</p>
              </Alert>
            )}

              <button 
              type="submit" 
              className='toresent' 
              onClick={handleResendEmail} 
              disabled={isVerifyLoading || isVerifyLoading2 || verifyError === "513"}> 
                <span>You did not receive the email? Resend.</span>
              </button>  

              <button
                type="submit"
                className="conbtn"
                disabled={isVerifyLoading || isVerifyLoading2 || verifySuccess}
                onClick={handleVerify}
              >
                {verifySuccess
                  ? "Please wait"
                  : isVerifyLoading
                  ? "Verifying..."
                  : isVerifyLoading2
                  ? "Resending email..."
                  : "Verify"}
              </button>

        </div>
    </div>
  );
}

export default Verify;