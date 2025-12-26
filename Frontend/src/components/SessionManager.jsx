import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getToken, getTokenExpiryMs, isTokenExpired } from '../auth.js';
import { notifySessionExpired } from '../utils/session.js';

// Watches JWT expiry and forces a redirect to login.
export default function SessionManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);
  const lastTokenRef = useRef(getToken());

  // Redirect on explicit session-expired events (e.g., API 401).
  useEffect(() => {
    const onSessionExpired = () => {
      if (location.pathname.startsWith('/auth/login')) return;
      navigate('/auth/login', {
        replace: true,
        state: { sessionExpired: true, from: location.pathname },
      });
    };

    window.addEventListener('il:session-expired', onSessionExpired);
    return () => window.removeEventListener('il:session-expired', onSessionExpired);
  }, [navigate, location.pathname]);

  // Schedule a timer based on JWT exp.
  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const reschedule = () => {
      clearTimer();

      const token = getToken();
      if (!token) return;

      // If it's already expired, handle immediately.
      if (isTokenExpired(token, 0)) {
        notifySessionExpired('jwt-expired');
        return;
      }

      const expMs = getTokenExpiryMs(token);
      if (!expMs) return;

      const delayMs = Math.max(0, expMs - Date.now());
      timerRef.current = setTimeout(() => {
        notifySessionExpired('jwt-expired');
      }, delayMs);
    };

    // Initial schedule
    reschedule();

    // React to auth changes (same tab) + storage changes (other tabs)
    window.addEventListener('il:auth-changed', reschedule);
    window.addEventListener('storage', reschedule);

    return () => {
      clearTimer();
      window.removeEventListener('il:auth-changed', reschedule);
      window.removeEventListener('storage', reschedule);
    };
  }, []);

  // Detect token removal in the same tab (e.g., user deletes in DevTools).
  useEffect(() => {
    const TICK_MS = 800;
    const intervalId = setInterval(() => {
      const prev = lastTokenRef.current;
      const current = getToken();

      // Track changes
      if (current !== prev) {
        lastTokenRef.current = current;
      }

      // If we had a token and now it is gone, treat it like session expiry
      // unless the user explicitly logged out.
      if (prev && !current) {
        let isUserLogout = false;
        try {
          isUserLogout = sessionStorage.getItem('il_user_logout') === '1';
          if (isUserLogout) sessionStorage.removeItem('il_user_logout');
        } catch {
          // ignore
        }

        if (!isUserLogout) {
          notifySessionExpired('token-removed');
        }
      }
    }, TICK_MS);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
