import './footer.css';
import { Link } from 'react-router-dom';
import React, { useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../Context/AuthContext.js";
import { baseUrl} from "../../../Utils/servise.js";

const Footer = () => {
    const { user, dispatch } = useContext(AuthContext);
    const navigate = useNavigate(); 

    useEffect(() => {
      const localStorageUser = JSON.parse(localStorage.getItem('user'));
  
      if (!localStorageUser) {
          navigate("/login");
      } else if (localStorageUser.Verification !== true && localStorageUser.Verification !== 1) {
          // Αν το Verification δεν είναι ούτε true ούτε 1, ανακατεύθυνση στη σελίδα login
          navigate("/login");
      } else if (!user) {
          // Αν ο context δεν έχει ενημερωθεί ακόμα
          dispatch({ type: "LOGIN_SUCCESS", payload: localStorageUser });
      }
  }, [user, navigate, dispatch]);

    const handleLogout = async (e) => {
      e.preventDefault();
      dispatch({ type: "LOGOUT" });
      try {
          const res = await axios.post(
            `${baseUrl}/auth/logout`, 
            {} , 
            { withCredentials: true }
          );
          dispatch({ type: "LOGOUT_SUCCESS", payload: res.data.details });
          localStorage.removeItem("user");
  
          navigate("/");
      } catch (err) {
          dispatch({ type: "LOGOUT_FAILURE", payload: err.response.data });
      }
    };

  return (
    <div className='Footer'>
      <div className='FooterMesa'>
        
        <div className='to1'>
            <Link to='/home' className='toylink'>Company Name</Link>
        </div>

        <div className='to2'>
          <Link to='/home' className='toylink'>Home</Link> <br/>
          <Link className='toylink' onClick={handleLogout}>Logout</Link>
        </div>

        </div>
    </div>
  );
}

export default Footer;
