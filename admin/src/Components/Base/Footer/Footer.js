import './footer.css';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { BsArrowBarRight, BsArrowBarLeft } from "react-icons/bs";
import { IoHomeSharp, IoPeopleSharp } from "react-icons/io5";
import { RiMessage2Fill } from "react-icons/ri";

const Footer = () => {
  const [isHidden, setIsHidden] = useState(false); // Κατάσταση για την εμφάνιση/απόκρυψη του footer

  const toggleFooter = () => {
    setIsHidden(!isHidden); // Εναλλαγή μεταξύ εμφάνισης και απόκρυψης
  };

  return (
    <div className={`Footer ${isHidden ? 'hidden' : ''}`}> {/* Προσθέτει κλάση αν είναι κρυφό */}
      <div className={`toBelaki ${isHidden ? 'toggle-right' : 'toggle-left'}`} onClick={toggleFooter}>
        {isHidden ? <BsArrowBarRight /> : <BsArrowBarLeft />} {/* Εναλλαγή εικονιδίου */}
      </div>

      {!isHidden && ( /* Κρύβει τα links αν το footer είναι κρυφό */
        <div className='talinks'>
          <div className='toa'><Link to="/home" className='toylink'><IoHomeSharp /> Home</Link></div>
          <div className='toa'><Link to="/clients" className='toylink'><IoPeopleSharp /> Clients</Link></div>
          <div className='toa'><Link className='toylink'><RiMessage2Fill /> Messages</Link></div>
          <div className='toa'><Link className='toylink'>Link 2</Link></div>
        </div>
      )}
    </div>
  );
};

export default Footer;
