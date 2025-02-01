import { createContext, useEffect, useReducer, useCallback, useState } from "react";
import { baseUrl, postRequest, getRequest } from "../Utils/servise.js";
import axios from 'axios';

const INITIAL_STATE = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  error: null,
};

export const AuthContext = createContext(INITIAL_STATE);

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        user: null,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        user: null,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
  const [user, setUser] = useState(null);
  const [registerError, setRegisterError] = useState(null);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [forgotPassError, setForgotPassError] = useState(null);
  const [forgotPassCheckError, setForgotPassCheckError] = useState(null);
  const [verifySuccess, setVerifySuccess] = useState(null);
  const [resentSuccess, setResentSuccess] = useState(null);
  const [forgotSuccess, setForgotSuccess] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);
  const [isVerifyLoading2, setIsVerifyLoading2] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isForgotPassLoading, setIsForgotPassLoading] = useState(false);
  const [registerInfo, setRegisterInfo] = useState({
    username: '',
    email: '',
    password: '',
    repassword: ''
  });

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
  }, [state.user]);

  const updateRegisterInfo = useCallback((info) => {
    setRegisterInfo((prevInfo) => ({
      ...prevInfo,
      ...info,
    }));
  }, []);

  const updateUser = useCallback((response) => {
    localStorage.setItem("user", JSON.stringify(response));
    setUser(response);
  }, []);


  const registerUser = useCallback(
    async (e) => {
      setIsRegisterLoading(true);
      setRegisterError(null);
  
      e.preventDefault();
  
      try {
        const response = await postRequest(
          `${baseUrl}/auth/register`,
          JSON.stringify(registerInfo),
          {
              withCredentials: true, // Το withCredentials μπαίνει εδώ, στο ίδιο config object
          }
      );
  
        setIsRegisterLoading(false);
  
        // Έλεγχος αν η εγγραφή ήταν επιτυχής
        if (response.message === "510") {
          // Αποθήκευση μηνύματος επιτυχίας στο localStorage
          localStorage.setItem("RegistUser", JSON.stringify({ message: response.message }));
        }
  
        // Διαχείριση σφαλμάτων
        if (response.error) {
          const errorMessage = response.message;
          setRegisterError(errorMessage);
        } else if (response.message) {
          const successMessage = response.message;
          setRegisterError(successMessage);
        }
      } catch (error) {
        console.error("Σφάλμα κατά την εγγραφή:", error);
        setRegisterError("Σφάλμα κατά την εγγραφή");
      }
    },
    [registerInfo]
  );
  
const verifyUser = async (code) => {
  setIsVerifyLoading(true);
  setVerifySuccess(false);
  setVerifyError(null);

  try {
    // Κάνουμε POST στο endpoint /auth/verifyUser με το code
    const response = await axios.post(
      `${baseUrl}/auth/verifyUser`,
      { code }, // Στέλνουμε το code στο σώμα του request
      {
        withCredentials: true, // Στέλνει τα cookies μαζί με το αίτημα, συμπεριλαμβανομένου του Regist_token
      }
    );

    // Αν η απόκριση είναι επιτυχής (status 200 ή 201)
    if (response.status === 200 || response.status === 201) {
      setVerifySuccess(true);
      setUser(response);

      localStorage.removeItem('RegistUser');
      localStorage.removeItem('LogUser');

      // Αποθηκεύουμε τα στοιχεία χρήστη (details) στο localStorage στο key "user"
      const userDetails = response.data.details;
      localStorage.setItem('user', JSON.stringify(userDetails));

      return response.data; // Επιστρέφουμε τα δεδομένα αν χρειάζεται για περαιτέρω χρήση
    } else {
      // Αν το API επέστρεψε κάποιο σφάλμα
      setVerifyError(response.data.message || 'Unknown error occurred');
    }

  } catch (error) {
    // Χειρισμός σφαλμάτων από το axios ή το API
    setVerifyError(error.response?.data?.message || 'Verification failed');
  } finally {
    setIsVerifyLoading(false); // Ολοκληρώνουμε το loading state
  }
};

const ResendEmail = async () => {
  setResentSuccess(false);
  setVerifyError(null);
  setIsVerifyLoading2(true);

  try {
    // Κάνουμε POST στο endpoint /auth/resendEmail χωρίς headers, επιτρέποντας cookies
    const response = await axios.post(
      `${baseUrl}/auth/resendEmail`,
      {}, // Εδώ μπορείς να προσθέσεις σώμα αν χρειάζεται, προς το παρόν είναι κενό
      {
        withCredentials: true, // Ενεργοποιούμε την αποστολή και παραλαβή cookies
      }
    );

    // Αν η απόκριση είναι επιτυχής (status 200 ή 201)
    if (response.status === 200 || response.status === 201) {
      setResentSuccess(response.data.message);
      return response.data.message; // Επιστρέφουμε τα δεδομένα αν χρειάζεται για περαιτέρω χρήση
    } else {
      // Αν το API επέστρεψε κάποιο σφάλμα
      setVerifyError(response.data.message || 'Unknown error occurred');
    }

    return response.data;
  } catch (error) {
    // Χειρισμός σφαλμάτων από το axios ή το API
    setVerifyError(error.response?.data?.message || 'Resend failed');
  } finally {
    setIsVerifyLoading2(false); // Ολοκληρώνουμε το loading state
  }
};

  const ForgotPass = async (email) => {
    setForgotPassError(null);
    setForgotSuccess(false);
    setIsForgotPassLoading(true);

    try {
      const response = await axios.post(
        `${baseUrl}/auth/resetPassword`,
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setForgotSuccess(response.data.message);
        setForgotPassError(false);
        return response.data.message;
      } else {
        setForgotSuccess(false);
        setForgotPassError(response.data.message || 'Unknown error occurred');
      }

      return response.data;
    } catch (error) {
      setForgotPassError(error.response?.data?.message || 'Resend failed');
    } finally {
      setIsForgotPassLoading(false);
    }
    
  };

  const ResetPassCheck = async (token, password) => {
    setForgotPassCheckError(null);
    setIsResetLoading(true);
    setResetSuccess(false);

    try {
      const response = await axios.post(
        `${baseUrl}/auth/resetPassCheck`,
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Προσθέτουμε το token στο Authorization header
          },
          withCredentials: true, 
        }
      );  

      if (response.status === 200 || response.status === 201) {
        setForgotSuccess(response.data.message);
        setForgotPassCheckError(false);
        setIsResetLoading(false);
        const userDetails = response.data.details;
        localStorage.setItem('user', JSON.stringify(userDetails));
  
        setResetSuccess(true);
        return response.data; 
      } else {        
        setIsResetLoading(false);
        setForgotSuccess(false);
        setForgotPassCheckError(response.data.message || 'Unknown error occurred');
      }

      return response.data;
    } catch (error) {
      setIsResetLoading(false);
      setForgotPassCheckError(error.response?.data?.message || 'Resend failed');
    }
  };

  const EntryControl = async () => {
    
    try {
      const response = await axios.post(
        `${baseUrl}/auth/entryControl`,
        {},
        {
          withCredentials: true, 
        }
      );  

    } catch (error) {
   
    }

  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        registerInfo,
        registerUser,
        updateRegisterInfo,
        registerError,
        isRegisterLoading,
        dispatch,
        updateUser,
        verifyError,
        verifyUser,
        verifySuccess,
        ForgotPass,
        ResendEmail,
        resentSuccess,
        forgotSuccess,
        forgotPassError,
        forgotPassCheckError,
        isVerifyLoading,
        isResetLoading,
        ResetPassCheck,
        resetSuccess,
        isVerifyLoading2,
        isForgotPassLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};