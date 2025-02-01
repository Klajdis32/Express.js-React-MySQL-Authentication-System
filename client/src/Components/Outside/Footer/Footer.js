import './footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div className='Footer'>
      <div className='FooterMesa'>
        <div className='to1'>
            <Link to='/' className='toylink'>Company Name</Link>
        </div>

        <div className='to2'>
          <Link to='/' className='toylink'>Home</Link> <br/>
          <Link to='/login' className='toylink'>Login</Link>
        </div>

        <div className='to3'>
          <Link  className='toylink'>Link 1</Link><br/>
          <Link  className='toylink'>Link 2</Link><br/>
          <Link  className='toylink'>Link 3</Link><br/>
          <Link  className='toylink'>Link 4</Link><br/>
        </div>

        <div className='to4'>
            <p>© 2024 Company Name</p>
        </div>
        </div>
    </div>
  );
}

export default Footer;