import './header.css';
import { Link } from 'react-router-dom';
import React, { useState , useEffect, useContext } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../Context/AuthContext.js";
import { baseUrl} from "../../../Utils/servise.js";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
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

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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
    <div className={`headerIn ${menuOpen ? 'open' : ''}`}>
      <div className='headerInmesa'>
        <div className='toaristera'>
          <p>Company Name Mesa</p>
        </div>

        <div className={`tadeksia ${menuOpen ? 'open' : ''}`}>
          <Link to='/home' className='tolinkdeks'>Home</Link>
          <Link className='tolinkdeks' onClick={handleLogout}>Logout</Link>
        </div>

        <div className='burger' onClick={toggleMenu}>
          <div className={`line ${menuOpen ? 'open' : ''}`}></div>
          <div className={`line ${menuOpen ? 'open' : ''}`}></div>
          <div className={`line ${menuOpen ? 'open' : ''}`}></div>
        </div>
      </div>
    </div>
  );
}

export default Header;
