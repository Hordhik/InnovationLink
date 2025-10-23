import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Reusable toast that reads location.state.toast and auto-dismisses.
// Accepts either a string or { message, type, duration }.
export default function TopbarToast({ topOffset = 84, defaultDuration = 2200 }) {
    const navigate = useNavigate();
    const location = useLocation();

    const [toast, setToast] = useState('');
    const [toastType, setToastType] = useState('success');
    const [toastDuration, setToastDuration] = useState(defaultDuration);
    const [showToast, setShowToast] = useState(false);
    const [toastLeaving, setToastLeaving] = useState(false);
    const consumedKeyRef = useRef(null);

    // Consume toast from navigation state, but only once per session
    useEffect(() => {
        let clearStateTimer;
        const ts = location.state?.toast;
        if (ts && consumedKeyRef.current !== location.key) {
            const SESSION_KEY = 'il_welcome_toast_shown';
            const alreadyShown = sessionStorage.getItem(SESSION_KEY) === '1';
            // If it was already shown in this tab/session, clear state and skip showing
            if (alreadyShown) {
                clearStateTimer = setTimeout(() => {
                    navigate(location.pathname, {
                        replace: true,
                        state: location.state ? { ...location.state, toast: null } : undefined,
                    });
                }, 0);
                consumedKeyRef.current = location.key;
                return () => { if (clearStateTimer) clearTimeout(clearStateTimer); };
            }
            let duration = defaultDuration;
            if (typeof ts === 'string') {
                setToast(ts);
                setToastType('success');
            } else if (typeof ts === 'object') {
                duration = Number(ts.duration) || defaultDuration;
                setToast(ts.message || '');
                setToastType(ts.type || 'success');
            }
            setToastDuration(duration);
            setShowToast(true);
            setToastLeaving(false);
            consumedKeyRef.current = location.key;
            try { sessionStorage.setItem(SESSION_KEY, '1'); } catch { }
            // Remove toast from history state so it doesn't replay on next nav
            clearStateTimer = setTimeout(() => {
                navigate(location.pathname, {
                    replace: true,
                    state: location.state ? { ...location.state, toast: null } : undefined,
                });
            }, 0);
        }
        return () => { if (clearStateTimer) clearTimeout(clearStateTimer); };
    }, [location.state, location.key, navigate, location.pathname, defaultDuration]);

    // Auto-hide after duration
    useEffect(() => {
        if (!showToast) return;
        const hideTimer = setTimeout(() => setToastLeaving(true), toastDuration);
        return () => clearTimeout(hideTimer);
    }, [showToast, toastDuration]);

    // Click to dismiss (armed slightly after show so initial click doesn't immediately close)
    useEffect(() => {
        if (!showToast) return;
        const onClick = () => setToastLeaving(true);
        const armTimer = setTimeout(() => document.addEventListener('click', onClick), 100);
        return () => {
            clearTimeout(armTimer);
            document.removeEventListener('click', onClick);
        };
    }, [showToast]);

    if (!showToast) return null;

    return (
        <div
            className={`topbar-toast${toastLeaving ? ' leaving' : ''}`}
            role="status"
            aria-live="polite"
            style={{ '--toast-duration': `${toastDuration}ms`, '--toast-top': `${topOffset}px` }}
            onAnimationEnd={(e) => {
                if (toastLeaving && (!e.animationName || e.animationName === 'slideOutRight')) {
                    setShowToast(false);
                    setToastLeaving(false);
                }
            }}
        >
            <div className={`toast-card toast-${toastType}`}>
                {toast}
                <div className="toast-progress" />
            </div>
        </div>
    );
}
