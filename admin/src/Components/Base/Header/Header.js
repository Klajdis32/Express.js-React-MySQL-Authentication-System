import './header.css';
import { Link } from 'react-router-dom';
import React, { useState , useContext } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../../Context/AuthContext.js";
import { BsBoxArrowRight } from "react-icons/bs";
import { baseUrl} from "../../../Utils/servise.js";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, dispatch } = useContext(AuthContext);
  const navigate = useNavigate(); 
    
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    dispatch({ type: "LOGOUT" });
    try {
        const res = await axios.post(`${baseUrl}/adminAuth/logout`, user,
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
    <div className={`header ${menuOpen ? 'open' : ''}`}>
      <div className='tomesaHead'>
        <div className='toaristera'>
            <p>Company</p>
        </div>

        <div className={`tadeksia ${menuOpen ? 'open' : ''}`}>
            <Link className='tolinkdeks' onClick={handleLogout}><BsBoxArrowRight /></Link>
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
