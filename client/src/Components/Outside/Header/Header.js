import './header.css';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className={`headerOut ${menuOpen ? 'open' : ''}`}>
      <div className='headerOutmesa'>
        <div className='toaristera'>
          <p>Company Name</p>
        </div>

        <div className={`tadeksia ${menuOpen ? 'open' : ''}`}>
          <Link to='/' className='tolinkdeks'>Home</Link>
          <Link to='/login' className='tolinkdeks'>Login</Link>
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
