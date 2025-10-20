
import InvestorHome from './InvestorHome';
import StartupHome from './StartupHome';
import './Home.css';


const Home = () => {
  // Get userType from URL: /:userType/:username/...
  const userType = window.location.pathname.split('/')[1] || 'S';

  return (
    <div
      className="home-container"
    >
      {userType === 'S' ? <InvestorHome /> : <StartupHome />}
    </div>
  );
};

export default Home;