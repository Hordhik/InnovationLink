import './App.css';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { getStoredUser, getStoredRole } from './auth';
import NavBar from './Website/NavBar/NavBar';
import Home from './Website/Home/Home';
import Events from './Website/Events/Events';
import About from './Website/AboutUs/AboutUs';
import Blogs from './Website/Blogs/Blogs';
import Blog from './Website/Blogs/Blog';
import LogIn from './Authentication/LogIn';
import SignUp from './Authentication/SignUp';
import Portal from './Portal/Portal';


function App() {
  const location = useLocation();

  // Small components to map legacy URL shapes to the canonical portal routes
  const LegacyStartupRedirect = () => {
    const { username } = useParams();
    return <Navigate to={`/S/${username}/home`} replace />;
  };

  const LegacyInvestorRedirect = () => {
    const { username } = useParams();
    return <Navigate to={`/I/${username}/home`} replace />;
  };

  // If a logged-in user tries to visit public site routes, redirect them into their portal.
  const PublicRedirect = ({ children }) => {
    const user = getStoredUser();
    // Allow intentional override: ?public=true will let logged-in users view public pages
    const query = new URLSearchParams(location.search || '');
    if (query.get('public') === 'true') return children;
    if (!user) return children;
    const role = getStoredRole() || (user.userType === 'investor' ? 'I' : 'S');
    const username = user.username || user.name || 'handbook';
    const dest = `/${role}/${username}/home`;
    return <Navigate to={dest} replace />;
  };

  // Define routes where navbar should be shown (website routes)
  const showNavbarRoutes = ["/home", "/blogs", "/events", "/about"];
  const shouldShowNavbar = showNavbarRoutes.some(route => location.pathname === route) || location.pathname.startsWith('/blog/'); // Show navbar on blog detail pages

  return (
      <>
        {shouldShowNavbar && <NavBar />}
        <Routes>
          <Route path="/startup/:username/*" element={<LegacyStartupRedirect />} />
          <Route path="/investor/:username/*" element={<LegacyInvestorRedirect />} />
          {/* Website Routes (wrapped; redirect logged-in users to portal) */}
          {/* Website Routes (wrapped; redirect logged-in users to portal) */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<PublicRedirect><Home /></PublicRedirect>} />
          <Route path="/blogs" element={<PublicRedirect><Blogs /></PublicRedirect>} />
          <Route path="/blog/:id" element={<PublicRedirect><Blog /></PublicRedirect>} />
          <Route path="/events" element={<PublicRedirect><Events /></PublicRedirect>} />
          <Route path="/about" element={<PublicRedirect><About /></PublicRedirect>} />

          {/* Authentication Routes */}
          <Route path="/auth/login" element={<LogIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          
          {/* Legacy auth routes - redirect to new structure */}
          {/* <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} /> */}
          
          {/* Dynamic routes for both startups and investors using username as project */}
         <Route path="/S/:username/*" element={<Portal />} />
        <Route path="/I/:username/*" element={<Portal />} />


        </Routes>
      </>
  )
}

export default App;
