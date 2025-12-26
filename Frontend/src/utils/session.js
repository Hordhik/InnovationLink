import { clearAuth } from '../auth.js';
import { showError } from './toast.js';

let lastHandledAt = 0;

export function notifySessionExpired(reason = 'expired') {
  const now = Date.now();
  // Avoid repeated redirects/toasts when multiple requests fail at once
  if (now - lastHandledAt < 1500) return;
  lastHandledAt = now;

  try {
    sessionStorage.setItem('il_session_expired', '1');
  } catch {
    // ignore
  }

  clearAuth();

  // Will show in portal (TopbarToast is mounted in TopBar).
  // On pages without TopbarToast, this falls back to console.
  showError('Session expired. Please log in again.', 2500);

  try {
    window.dispatchEvent(
      new CustomEvent('il:session-expired', {
        detail: { reason },
      })
    );
  } catch {
    // ignore
  }
}
