'use client';
import { useState, useEffect } from 'react';
import { Plane, ArrowRight, CircleAlert, CircleCheck, MessageCircle, Facebook, LoaderCircle } from 'lucide-react';

interface ProfileData {
  user: {
    id: string; full_name: string; role: string; referral_code: string;
    status: string; phone_number: string; facebook_page: string; tier: string; assigned_to: string;
  };
  meta: { photo_url: string; uploaded_photo: string; whatsapp_1: string; whatsapp_2: string; whatsapp_3: string };
}

export default function PublicProfilePage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [hasVisitDate, setHasVisitDate] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [otherCountry, setOtherCountry] = useState('');
  const [showOtherCountry, setShowOtherCountry] = useState(false);

  useEffect(() => {
    fetch(`/api/public-profile/${slug}`)
      .then(r => { if (r.status === 404) { setNotFound(true); setLoading(false); return null; } return r.json(); })
      .then(d => { if (d) setProfile(d); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(''); setFormLoading(true);
    const fd = new FormData(e.currentTarget);
    const phone = (fd.get('phone') as string || '').trim();
    const name = (fd.get('name') as string || '').trim();
    if (!phone) { setFormError('Phone number is required.'); setFormLoading(false); return; }
    try {
      const ownerUser = profile ? {
        id: profile.user.id, role: profile.user.role, full_name: profile.user.full_name,
        referral_code: profile.user.referral_code, assigned_to: profile.user.assigned_to || '',
      } : null;
      const res = await fetch('/api/leads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit', full_name: name, phone_number: phone,
          country: showOtherCountry ? otherCountry : (fd.get('country') as string || ''), source: `profile:${slug}`,
          owner_user: ownerUser, has_visit_date: hasVisitDate,
          visit_date: fd.get('visit_date') || '', message: fd.get('message') || '',
        }),
      });
      const data = await res.json();
      if (data.ok) { setFormSubmitted(true); (e.target as HTMLFormElement).reset(); setHasVisitDate(false); }
      else setFormError(data.msg || 'Could not submit.');
    } catch { setFormError('Network error. Please try again.'); }
    setFormLoading(false);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
      <LoaderCircle size={32} color="#bc7155" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound || !profile) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#bc7155', fontWeight: 700, marginBottom: 24 }}>404 — PAGE NOT FOUND</div>
      <h1 style={{ fontSize: 48, fontWeight: 700, color: '#000d10', letterSpacing: '-0.03em', marginBottom: 24 }}>Profile not found.</h1>
      <p style={{ fontSize: 16, color: '#8e8e95', fontWeight: 500, marginBottom: 40 }}>This referral link is invalid or has been deactivated.</p>
      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#000d10', color: 'white', borderRadius: 9999, fontSize: 12, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Back to Home <ArrowRight size={16} />
      </a>
    </div>
  );

  const { user, meta } = profile;
  const photoSrc = meta.uploaded_photo || meta.photo_url || '';
  const initials = user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isTeam = user.role === 'TEAM_MEMBER';
  const specialty = isTeam ? 'Staff Representative' : 'Brand Ambassador';
  const tier = (user.tier || '').toUpperCase();
  const tierColor = tier === 'GOLD' ? '#C9952A' : tier === 'SILVER' ? '#64748b' : '#bc7155';
  const whatsappNums = [meta.whatsapp_1, meta.whatsapp_2, meta.whatsapp_3].filter(Boolean);
  const primaryWa = whatsappNums[0] || user.phone_number || '';

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: 'white', minHeight: '100vh' }}>
      {/* Header */}
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

      {/* Profile Hero */}
      <section style={{ background: '#0f0f1c' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px 112px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 64, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 16px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 9999, marginBottom: 40 }}>
                <span style={{ color: tierColor, marginRight: 8, fontSize: 8 }}>●</span>
                <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'white', fontWeight: 700, textTransform: 'uppercase' }}>{isTeam ? 'SHINING OVERSEAS STAFF' : `AMBASSADOR · ${tier || 'STANDARD'}`}</span>
              </div>
              <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 700, color: 'white', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 16 }}>{user.full_name}</h1>
              <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#d5d3d4', lineHeight: 1.6, fontWeight: 500, marginBottom: 48 }}>{specialty} · Shining Overseas</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {primaryWa && (
                  <a href={`https://wa.me/${primaryWa.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#25d366', color: 'white', borderRadius: 9999, fontSize: 12, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    <MessageCircle size={16} /> WhatsApp
                  </a>
                )}
                {user.facebook_page && (
                  <a href={user.facebook_page.startsWith('http') ? user.facebook_page : `https://fb.com/${user.facebook_page}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#1877f2', color: 'white', borderRadius: 9999, fontSize: 12, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    <Facebook size={16} /> Facebook
                  </a>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: 240, height: 240 }}>
                {photoSrc ? (
                  <img src={photoSrc} alt={user.full_name} style={{ width: 240, height: 240, objectFit: 'cover', borderRadius: 0, border: '2px solid rgba(188,113,85,0.4)' }} />
                ) : (
                  <div style={{ width: 240, height: 240, background: '#151623', border: '2px solid rgba(188,113,85,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 64, fontWeight: 700, color: 'white', letterSpacing: '-0.03em' }}>{initials}</span>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: -12, right: -12, width: 48, height: 48, background: '#bc7155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plane size={20} color="white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Form */}
      <section style={{ background: 'white' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '96px 24px 128px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 64 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 40 }}>
                <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
                <span style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700 }}>ENQUIRE NOW</span>
              </div>
              <h2 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 700, color: '#000d10', lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 32 }}>
                Talk to<br /><span style={{ color: '#bc7155' }}>{user.full_name.split(' ')[0]}.</span>
              </h2>
              <p style={{ fontSize: 'clamp(15px, 1.5vw, 18px)', color: '#8e8e95', lineHeight: 1.6, fontWeight: 500, maxWidth: 400, marginBottom: 48 }}>
                Send your enquiry directly. {user.full_name.split(' ')[0]} will follow up with you personally.
              </p>
              {whatsappNums.length > 1 && (
                <div>
                  <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 16 }}>Also reachable on WhatsApp</div>
                  {whatsappNums.slice(1).map((num, i) => (
                    <a key={i} href={`https://wa.me/${num.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 0', borderTop: '1px solid rgba(0,13,16,0.1)', color: '#000d10', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
                      <MessageCircle size={16} color="#25d366" /> {num}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div style={{ background: 'white', padding: 'clamp(32px,4vw,40px)', border: '1px solid rgba(0,13,16,0.12)' }}>
                <div style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid rgba(0,13,16,0.1)' }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#bc7155', fontWeight: 700, marginBottom: 12 }}>SEND ENQUIRY</div>
                  <h3 style={{ fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 700, color: '#000d10', letterSpacing: '-0.02em' }}>Book a consultation.</h3>
                </div>
                <form onSubmit={handleSubmit}>
                  {[['Full Name', 'name', 'text', 'Your full name'], ['Phone Number', 'phone', 'tel', '+880 1XXX-XXXXXX']].map(([label, name, type, placeholder]) => (
                    <div key={name} style={{ marginBottom: 24 }}>
                      <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>{label}</label>
                      <input name={name} type={type} placeholder={placeholder} style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                    </div>
                  ))}
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Country of Interest</label>
                    <select name="country" onChange={e => setShowOtherCountry(e.target.value === "Other")} style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, appearance: 'none' }}>
                      <option value="">Select a country</option>
                      {['Saudi Arabia', 'Malaysia', 'UAE', 'Qatar', 'Kuwait', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  {showOtherCountry && (
                    <input name="other_country" type="text" placeholder="Type your country..." value={otherCountry} onChange={e => setOtherCountry(e.target.value)} style={{ width: "100%", padding: "12px 0", marginTop: 12, borderTop: "none", borderLeft: "none", borderRight: "none", borderBottom: "1px solid rgba(0,13,16,0.15)", background: "transparent", fontSize: 15, color: "#000d10", fontWeight: 500, boxSizing: "border-box" }} />
                  )}

                  </div>
                  <div style={{ marginBottom: 24, padding: '16px', background: '#f8f8f9', border: '1px solid rgba(0,13,16,0.08)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                      <input type="checkbox" checked={hasVisitDate} onChange={e => setHasVisitDate(e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                      <span style={{ fontSize: 13, color: '#000d10', fontWeight: 600 }}>I want to visit the office on a specific date</span>
                    </label>
                    {hasVisitDate && (
                      <div style={{ marginTop: 16 }}>
                        <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Preferred Visit Date</label>
                        <input name="visit_date" type="date" style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                      </div>
                    )}
                  </div>
                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Message (optional)</label>
                    <textarea name="message" placeholder="Tell us about your situation..." rows={3} style={{ width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, resize: 'none', boxSizing: 'border-box' }} />
                  </div>
                  {formError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', marginBottom: 20 }}>
                      <CircleAlert size={16} color="#dc2626" />
                      <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 500 }}>{formError}</span>
                    </div>
                  )}
                  {formSubmitted && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', marginBottom: 20 }}>
                      <CircleCheck size={16} color="#16a34a" />
                      <span style={{ fontSize: 13, color: '#15803d', fontWeight: 500 }}>Enquiry sent! You&apos;ll be contacted shortly.</span>
                    </div>
                  )}
                  <button type="submit" disabled={formLoading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 28px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: formLoading ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: formLoading ? 0.6 : 1 }}>
                    {formLoading ? <><LoaderCircle size={16} style={{ animation: 'spin 1s linear infinite' }} /><span>Sending...</span></> : <><span>Send Enquiry</span><ArrowRight size={16} /></>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
