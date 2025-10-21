import './App.css';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { getStoredUser, getStoredRole, getToken } from './auth';
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
    return <Navigate to={`/S/home`} replace />;
  };

  const LegacyInvestorRedirect = () => {
    const { username } = useParams();
    return <Navigate to={`/I/home`} replace />;
  };

  // If a logged-in user tries to visit public site routes, redirect them into their portal.
  const PublicRedirect = ({ children }) => {
    const user = getStoredUser();
    const token = getToken();
    // If authenticated (by user object or token), redirect to portal home.
    if (!user && !token) return children;
    const role = getStoredRole() || (user?.userType === 'investor' ? 'I' : 'S') || 'S';
    const dest = `/${role}/home`;
    return <Navigate to={dest} replace />;
  };

  // Define routes where navbar should be shown (website routes)
  const showNavbarRoutes = ["/home", "/blogs", "/events", "/about"];
  const shouldShowNavbar = showNavbarRoutes.some(route => location.pathname === route) || location.pathname.startsWith('/blog/'); // Show navbar on blog detail pages

  const RequireAuth = ({ children }) => {
    const token = getToken();
    if (!token) {
      return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
    }
    return children;
  };

  return (
    <AuthProvider>
      <>
        {shouldShowNavbar && <NavBar />}
        <Routes>
          <Route path="/startup/:username/*" element={<LegacyStartupRedirect />} />
          <Route path="/investor/:username/*" element={<LegacyInvestorRedirect />} />
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

          {/* Dynamic routes for both startups and investors (no username in URL) */}
          <Route path="/S/*" element={<RequireAuth><Portal /></RequireAuth>} />
          <Route path="/I/*" element={<RequireAuth><Portal /></RequireAuth>} />

        </Routes>
      </>
    </AuthProvider>
  )
}

export default App;
