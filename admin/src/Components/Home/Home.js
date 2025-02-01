import './home.css';
import { useNavigate } from "react-router-dom";
import React, { useEffect, useContext } from 'react';
import { AuthContext } from "../../Context/AuthContext";

const Home = () => {
    const { user, dispatch } = useContext(AuthContext);
    const navigate = useNavigate(); 

    useEffect(() => {
        const localStorageUser = JSON.parse(localStorage.getItem('user'));
    
        if (!localStorageUser) {
            navigate("/");
        } else if (localStorageUser.Verification !== true && localStorageUser.Verification !== 1) {
            // Αν το Verification δεν είναι ούτε true ούτε 1, ανακατεύθυνση στη σελίδα login
            navigate("/");
        } else if (!user) {
            // Αν ο context δεν έχει ενημερωθεί ακόμα
            dispatch({ type: "LOGIN_SUCCESS", payload: localStorageUser });
        }
    }, [user, navigate, dispatch]);

    return (
        <div className='HomeIn'>
            <div className='topanwp'>
                  <p>Hello <strong>{user?.Username || "Guest"}</strong>! you are inside now! Gongrach</p>
            </div>
        </div>
    );
}

export default Home;
