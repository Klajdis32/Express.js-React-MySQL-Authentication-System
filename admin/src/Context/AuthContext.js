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
  const [forgotPassError, setForgotPassError] = useState(null);
  const [forgotSuccess, setForgotSuccess] = useState(null);
  const [isForgotPassLoading, setIsForgotPassLoading] = useState(false);
  const [forgotPassCheckError, setForgotPassCheckError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);
  const [isResetLoading, setIsResetLoading] = useState(false);


  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
  }, [state.user]);

  const updateUser = useCallback((response) => {
    localStorage.setItem("user", JSON.stringify(response));
    setUser(response);
  }, []);
  
  const ForgotPass = async (email) => {
    setForgotPassError(null);
    setForgotSuccess(false);
    setIsForgotPassLoading(true);

    try {
      const response = await axios.post(
        `${baseUrl}/adminAuth/resetPassword`,
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
        `${baseUrl}/adminAuth/resetPassCheck`,
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Προσθέτουμε το token στο Authorization header
          },
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

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        dispatch,
        updateUser,
        ForgotPass,
        ResetPassCheck,
        forgotPassError,
        forgotSuccess,
        isForgotPassLoading,
        forgotPassCheckError,
        resetSuccess,
        isResetLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};