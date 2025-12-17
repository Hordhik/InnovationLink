/**
 * Toast notification utility
 * Provides a simple way to show toast notifications globally
 * 
 * Usage:
 * import { showToast } from '../utils/toast';
 * 
 * showToast('Success message', 'success');
 * showToast('Error message', 'error');
 * showToast('Warning message', 'warning');
 * showToast('Info message', 'info');
 */

let toastCallback = null;

// Register the toast display function from the component
export function registerToastCallback(callback) {
  toastCallback = callback;
}

// Show a toast notification
export function showToast(message, type = 'success', duration = 2200) {
  if (toastCallback) {
    toastCallback({
      message,
      type,
      duration,
    });
  } else {
    // Fallback to console if no callback registered
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

// Convenience functions
export function showSuccess(message, duration = 2200) {
  showToast(message, 'success', duration);
}

export function showError(message, duration = 3000) {
  showToast(message, 'error', duration);
}

export function showWarning(message, duration = 2200) {
  showToast(message, 'warning', duration);
}

export function showInfo(message, duration = 2200) {
  showToast(message, 'info', duration);
}
