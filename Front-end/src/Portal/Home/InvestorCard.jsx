import eyes from "../../assets/Portal/StartupCard/eyes.svg";
import statues from "../../assets/Portal/StartupCard/status-up.svg";
import './StartupCard.css';
import mentorship from '../../assets/Portal/StartupCard/mentorship.png';
import active from '../../assets/Portal/StartupCard/active.png';


const InvestorCard = ({ investor }) => {
  return (
    <div className="investor-card">
      <div className="card-header">
        <div className="startup-info">
          <div className="avatar">
            <img src="https://ui-avatars.com/api/?name=Innovation+Link" alt="Innovation Link" />
          </div>
          <div className="text-info">
            <p className="startup-name">{investor.name}</p>
            <p className="founder-name">{investor.title}</p>
          </div>
        </div>
        <div className="connect">
          <div className="mentor-info">
            <div className="mentors-engaged">
              <img src={mentorship} alt="" className='icon'/>
              <span><strong>{investor.mentoredCount}</strong> Startups Mentored</span>
            </div>
            <div className="mentors-this-month">
              <img src={active} alt="" className='icon'/>
              <span><strong>{investor.investmentsCount}</strong> Active Investments</span>
            </div>
          </div>
          <div className="card-actions">
            <button className="connect-button">Connect</button>
            <button className="request-button">Request a Meeting</button>
          </div>
        </div>
      </div>
      <div className="card-body">
        <p className="description">
          {investor.thesis}
        </p>
        <div className="tags">
          {investor.tags.map((tag, index) => (
            <p key={index} className="tag">{tag}</p>
          ))}
        </div>
        <a href="#" className="view-profile-link">
          <span>View Full Profile</span>
          <span className="arrow-icon">→</span>
        </a>
      </div>
    </div>
  );
};

export default InvestorCard;