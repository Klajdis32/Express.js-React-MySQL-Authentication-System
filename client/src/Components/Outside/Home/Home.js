import './home.css';
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className='HomeOut'>
        <div className='toproto'>
                <p>Full auth ReactApp + Mysql Buckend!!</p>
                <Link to='/register' className='tobuttonarx'>Create an acc here!</Link>         
        </div>
    </div>
  );
}

export default Home;
