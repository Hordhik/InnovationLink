import './App.css';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { getStoredUser, getStoredRole, getToken } from './auth';
import NavBar from './Website/NavBar/NavBar';
import Footer from './Website/Footer/Footer';
import Home from './Website/Home/Home';
import Events from './Website/Events/Events';
import About from './Website/AboutUs/AboutUs';
import Blogs from './Website/Blogs/Blogs';
import Blog from './Website/Blogs/Blog';
import LogIn from './Authentication/LogIn';
import SignUp from './Authentication/SignUp';
import Portal from './Portal/Portal';
import AddBlog from './Website/Blogs/AddBlog';


function App() {
  const location = useLocation();
  // Global toast removed to prevent duplicates and route refresh side-effects.

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
  // Show navbar on website routes including blogs list, but hide on blog detail pages
  const showNavbarRoutes = ["/home", "/events", "/about", "/blogs"];
  const shouldShowNavbar = showNavbarRoutes.some(route => location.pathname === route);
  // Footer only on Home and About pages
  const shouldShowFooter = location.pathname === '/home' || location.pathname === '/about';

  // Removed global overscroll background override to avoid header visual issues

  const RequireAuth = ({ children }) => {
    const token = getToken();
    if (!token) {
      return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
    }
    return children;
  };

  // Global toast intentionally removed; TopBar owns toast display in portal.

  return (
    <AuthProvider>
      <>
        {/* Global toast removed to avoid duplicates. */}
        {shouldShowNavbar && <NavBar />}
  <Routes>
          <Route path="/startup/:username/*" element={<LegacyStartupRedirect />} />
          <Route path="/investor/:username/*" element={<LegacyInvestorRedirect />} />
          {/* Website Routes (wrapped; redirect logged-in users to portal) */}

          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<PublicRedirect><Home /></PublicRedirect>} />

          <Route path="/blogs" element={<PublicRedirect><Blogs /></PublicRedirect>} />
          <Route path="/blog/:id" element={<PublicRedirect><Blog /></PublicRedirect>} />
          <Route path="/:portal/blogs/new" element={<AddBlog />} />

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
  {shouldShowFooter && <Footer />}
      </>
    </AuthProvider>
  )
}

export default App;
