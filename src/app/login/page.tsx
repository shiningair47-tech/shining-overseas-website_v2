'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plane, ArrowRight, CircleAlert, LoaderCircle, KeyRound } from 'lucide-react';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState('team');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPw, setShowForgotPw] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');

  useEffect(() => {
    const role = searchParams.get('role');
    if (role && ['team', 'influencer', 'admin'].includes(role)) setSelectedRole(role);
    // Check if already logged in
    const user = localStorage.getItem('so_user');
    if (user) {
      try {
        const u = JSON.parse(user);
        if (u.role === 'ADMIN') router.replace('/site-admin');
        else router.replace('/portal');
      } catch {}
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError(''); setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = fd.get('email') as string;
    const password = fd.get('password') as string;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok || !data.user) { setLoginError(data.error || 'Invalid credentials.'); setLoading(false); return; }
      localStorage.setItem('so_user', JSON.stringify(data.user));
      if (data.user.role === 'ADMIN') router.replace('/site-admin');
      else router.replace('/portal');
    } catch { setLoginError('Network error. Please try again.'); setLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail || !forgotEmail.includes('@')) { setForgotError('Please enter a valid email address.'); return; }
    setForgotLoading(true); setForgotError(''); setForgotMsg('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (data.ok) {
        setForgotMsg(data.msg || 'If an account exists, a temporary password has been generated.');
      } else {
        setForgotError(data.error || 'Failed to reset password. Please try again.');
      }
    } catch { setForgotError('Network error. Please try again.'); }
    setForgotLoading(false);
  };

  const header = (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'white', borderBottom: '1px solid rgba(0,13,16,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1280, margin: '0 auto', padding: '20px 24px' }}>
        <a href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <Plane size={16} color="#bc7155" />
            <span style={{ fontWeight: 700, color: '#000d10', fontSize: 16 }}>SHINING</span>
            <span style={{ fontWeight: 300, color: '#000d10', letterSpacing: '0.2em', fontSize: 11, marginLeft: 4 }}>OVERSEAS</span>
          </div>
          <span style={{ fontSize: 9, color: '#8e8e95', letterSpacing: '0.15em', marginTop: 2, textTransform: 'uppercase', fontWeight: 500 }}>BAIRA Lic. RL-2716</span>
        </a>
        <a href="/#contact" style={{ padding: '8px 20px', background: '#000d10', color: 'white', borderRadius: 9999, fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Get Consultation</a>
      </div>
    </header>
  );

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: 'white', minHeight: '100vh' }}>
      {header}
      <section style={{ background: '#0f0f1c' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px 112px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 40 }}>
            <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
            <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'white', fontWeight: 700 }}>PORTAL ACCESS</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: 'white', lineHeight: 1.0, letterSpacing: '-0.03em' }}>
            Sign in to<br /><span style={{ color: '#bc7155' }}>your portal.</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#d5d3d4', marginTop: 32, maxWidth: 480, lineHeight: 1.6, fontWeight: 500 }}>Choose your role and enter your credentials to access your dashboard.</p>
        </div>
      </section>
      <section style={{ background: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ maxWidth: 480, margin: '0 auto', background: 'white', border: '1px solid rgba(0,13,16,0.12)', padding: 'clamp(32px,4vw,48px)' }}>
            <div style={{ marginBottom: 40, paddingBottom: 40, borderBottom: '1px solid rgba(0,13,16,0.1)' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, marginBottom: 16 }}>I AM A</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[['team', 'Staff'], ['influencer', 'Influencer'], ['admin', 'Admin']].map(([val, label]) => (
                  <button key={val} onClick={() => setSelectedRole(val)} style={{ padding: '10px 20px', background: selectedRole === val ? '#000d10' : 'transparent', color: selectedRole === val ? 'white' : '#000d10', border: `1px solid ${selectedRole === val ? '#000d10' : 'rgba(0,13,16,0.15)'}`, borderRadius: 9999, fontSize: 11, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'all 0.2s' }}>{label}</button>
                ))}
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Email Address</label>
                <input name="email" type="email" placeholder="you@example.com"
                  required style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Password</label>
                <input name="password" type="password" placeholder="••••••••" required style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
              </div>
              <div style={{ textAlign: 'right', marginBottom: 32 }}>
                <button type="button" onClick={() => { setShowForgotPw(!showForgotPw); setForgotError(''); setForgotMsg(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#bc7155', fontWeight: 700, textDecoration: 'none', padding: 0 }}>
                  Forgot Password?
                </button>
              </div>
              {loginError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', marginBottom: 20 }}>
                  <CircleAlert size={16} color="#dc2626" />
                  <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>{loginError}</span>
                </div>
              )}
              <button type="submit" disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 28px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: loading ? 0.6 : 1 }}>
                {loading ? <><LoaderCircle size={16} style={{ animation: 'spin 1s linear infinite' }} /><span>Signing in...</span></> : <><span>Sign In</span><ArrowRight size={16} /></>}
              </button>
            </form>
            {showForgotPw && (
              <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(0,13,16,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <KeyRound size={14} color="#000d10" />
                  <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>Reset Password</span>
                </div>
                <p style={{ fontSize: 13, color: '#8e8e95', fontWeight: 500, marginBottom: 20, lineHeight: 1.5 }}>Enter your email and we'll notify the admin team to set a new password for you.</p>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Email Address</label>
                  <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="you@example.com"
                    style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                </div>
                {forgotError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', marginBottom: 20 }}>
                    <CircleAlert size={16} color="#dc2626" />
                    <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>{forgotError}</span>
                  </div>
                )}
                {forgotMsg && (
                  <div style={{ padding: '16px', background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: 20, fontSize: 13, color: '#15803d', fontWeight: 500, lineHeight: 1.6 }}>{forgotMsg}</div>
                )}
                <button type="button" onClick={handleForgotPassword} disabled={forgotLoading}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 28px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: forgotLoading ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: forgotLoading ? 0.6 : 1 }}>
                  {forgotLoading ? <><LoaderCircle size={16} style={{ animation: 'spin 1s linear infinite' }} /><span>Submitting...</span></> : 'Submit Request'}
                </button>
              </div>
            )}
            <div style={{ marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(0,13,16,0.1)', textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: '#8e8e95', fontWeight: 500 }}>Need help? </span>
              <a href="/#contact" style={{ fontSize: 13, color: '#000d10', fontWeight: 700, textDecoration: 'none' }}>Contact our team</a>
            </div>
          </div>
        </div>
      </section>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}><LoginForm /></Suspense>;
}
