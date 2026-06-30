'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, ArrowRight, ArrowLeft, Check, LoaderCircle, Upload } from 'lucide-react';

interface User { id: string; email: string; role: string; full_name: string; phone_number: string; referral_code: string; status: string; tier: string; facebook_page: string }

const STEPS = ['Profile Info', 'Photo', 'WhatsApp', 'Review & Publish'];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 0', borderTop: 'none', borderLeft: 'none',
  borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)',
  background: 'transparent', fontSize: 15, color: '#000d10', fontWeight: 500, boxSizing: 'border-box',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, letterSpacing: '0.25em', color: '#000d10',
  fontWeight: 700, textTransform: 'uppercase', marginBottom: 12,
};

export default function BuilderPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [facebook, setFacebook] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadedPhoto, setUploadedPhoto] = useState('');
  const [wa1, setWa1] = useState('');
  const [wa2, setWa2] = useState('');
  const [wa3, setWa3] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('so_user');
    if (!stored) { router.replace('/login'); return; }
    try {
      const u = JSON.parse(stored) as User;
      setUser(u);
      setFullName(u.full_name || '');
      setPhone(u.phone_number || '');
      setFacebook(u.facebook_page || '');
      setWa1(u.phone_number || '');
      fetch(`/api/digital-id?userId=${u.id}`).then(r => r.json()).then((meta: Record<string, string>) => {
        if (meta.photo_url) setPhotoUrl(meta.photo_url);
        if (meta.uploaded_photo) setUploadedPhoto(meta.uploaded_photo);
        if (meta.whatsapp_1) setWa1(meta.whatsapp_1);
        if (meta.whatsapp_2) setWa2(meta.whatsapp_2);
        if (meta.whatsapp_3) setWa3(meta.whatsapp_3);
      }).catch(() => {});
    } catch { router.replace('/login'); }
    setLoading(false);
  }, [router]);

  const resizeImage = (dataUrl: string, maxSz: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxSz || h > maxSz) {
          const ratio = Math.min(maxSz / w, maxSz / h);
          w = Math.round(w * ratio); h = Math.round(h * ratio);
        }
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const full = ev.target?.result as string || '';
        const resized = await resizeImage(full, 240);
        setUploadedPhoto(resized);
      } catch { setMsg('Failed to process image.'); }
      setUploadLoading(false);
    };
    reader.onerror = () => { setMsg('Failed to read file.'); setUploadLoading(false); };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true); setMsg('');
    try {
      const r1 = await fetch('/api/digital-id', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_user', user_id: user.id, full_name: fullName, phone_number: phone, facebook_page: facebook }),
      });
      const r1d = await r1.json();
      if (!r1d.ok) { setMsg('Failed to update user info.'); setSaving(false); return; }
      const r2 = await fetch('/api/digital-id', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_profile', user_id: user.id, data: { photo_url: photoUrl, uploaded_photo: uploadedPhoto, whatsapp_1: wa1, whatsapp_2: wa2, whatsapp_3: wa3 } }),
      });
      const r2d = await r2.json();
      if (!r2.ok || !r2d.ok) { setMsg('Failed to save profile: ' + (r2d.error || 'Unknown error. Please try again.')); setSaving(false); return; }
      const updated = { ...user, full_name: fullName, phone_number: phone, facebook_page: facebook };
      localStorage.setItem('so_user', JSON.stringify(updated));
      setUser(updated); setSaved(true); setMsg('Your Digital ID has been published!');
    } catch { setMsg('Error saving. Please try again.'); }
    setSaving(false);
  };

  if (loading || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <LoaderCircle size={32} color="#bc7155" style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const publicLink = user.referral_code ? `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${user.referral_code}` : '';
  const previewPhoto = uploadedPhoto || photoUrl || '';
  const initials = (fullName || user.full_name).split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: 'white', minHeight: '100vh' }}>
      <header style={{ background: 'white', borderBottom: '1px solid rgba(0,13,16,0.08)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1280, margin: '0 auto', padding: '20px 24px' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <Plane size={16} color="#bc7155" />
              <span style={{ fontWeight: 700, color: '#000d10', fontSize: 16 }}>SHINING</span>
              <span style={{ fontWeight: 300, color: '#000d10', letterSpacing: '0.2em', fontSize: 11, marginLeft: 4 }}>OVERSEAS</span>
            </div>
          </a>
          <a href="/portal" style={{ fontSize: 12, color: '#8e8e95', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.1em' }}>â† Back to Portal</a>
        </div>
      </header>

      <section style={{ background: '#0f0f1c' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px 80px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 32 }}>
            <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>â—</span>
            <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'white', fontWeight: 700 }}>DIGITAL ID BUILDER</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 700, color: 'white', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            Build your<br /><span style={{ color: '#bc7155' }}>Digital ID page.</span>
          </h1>
          <p style={{ fontSize: 'clamp(14px, 1.5vw, 18px)', color: '#d5d3d4', marginTop: 24, maxWidth: 480, lineHeight: 1.6, fontWeight: 500 }}>
            Your personal page for leads to contact you directly. Share your link â€” any enquiry goes straight to you.
          </p>
        </div>
      </section>

      {/* Step Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(0,13,16,0.1)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', overflowX: 'auto' }}>
          {STEPS.map((s, i) => (
            <div key={i} onClick={() => (i < step || saved) ? setStep(i) : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px', cursor: i <= step ? 'pointer' : 'default', borderBottom: `2px solid ${step === i ? '#000d10' : 'transparent'}`, flexShrink: 0 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: i < step || saved ? '#000d10' : step === i ? '#000d10' : 'rgba(0,13,16,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {i < step || saved ? <Check size={12} color="white" /> : <span style={{ fontSize: 11, fontWeight: 700, color: step === i ? 'white' : '#8e8e95' }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: step === i ? '#000d10' : '#8e8e95', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 64 }}>
          {/* Form Panel */}
          <div>
            {/* STEP 0: Profile Info */}
            {step === 0 && (
              <div>
                <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 32 }}>Step 1 â€” Profile Info</div>
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+880 1XXX-XXXXXX" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Facebook Page URL</label>
                  <input type="text" value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="https://facebook.com/yourpage" style={inputStyle} />
                </div>
              </div>
            )}

            {/* STEP 1: Photo */}
            {step === 1 && (
              <div>
                <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 32 }}>Step 2 â€” Profile Photo</div>
                <p style={{ fontSize: 14, color: '#8e8e95', fontWeight: 500, marginBottom: 32, lineHeight: 1.6 }}>Upload a clear, professional photo. Or paste an image URL.</p>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} style={{ position: 'absolute', left: '-9999px', opacity: 0, width: 0, height: 0 }} />
                <button onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', border: '1px solid rgba(0,13,16,0.2)', background: 'white', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#000d10', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 32 }}>
                  {uploadLoading ? <LoaderCircle size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={16} />}
                  {uploadedPhoto ? 'Change Photo' : 'Choose Photo'}
                </button>
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Or Paste an Image URL</label>
                  <input type="url" value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://example.com/your-photo.jpg" style={inputStyle} />
                </div>
              </div>
            )}

            {/* STEP 2: WhatsApp */}
            {step === 2 && (
              <div>
                <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 32 }}>Step 3 â€” WhatsApp Numbers</div>
                <p style={{ fontSize: 14, color: '#8e8e95', fontWeight: 500, marginBottom: 32, lineHeight: 1.6 }}>Up to 3 WhatsApp numbers shown as click-to-chat buttons. Include country code (e.g. 8801XXXXXXXXX).</p>
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Primary WhatsApp</label>
                  <input type="tel" value={wa1} onChange={e => setWa1(e.target.value)} placeholder="8801XXXXXXXXX" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Backup WhatsApp (optional)</label>
                  <input type="tel" value={wa2} onChange={e => setWa2(e.target.value)} placeholder="8801XXXXXXXXX" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 28 }}>
                  <label style={labelStyle}>Third WhatsApp (optional)</label>
                  <input type="tel" value={wa3} onChange={e => setWa3(e.target.value)} placeholder="8801XXXXXXXXX" style={inputStyle} />
                </div>
              </div>
            )}

            {/* STEP 3: Review */}
            {step === 3 && (
              <div>
                <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 32 }}>Step 4 â€” Review & Publish</div>
                <div style={{ background: '#f8f8f9', padding: 24, marginBottom: 32 }}>
                  {([
                    ['Name', fullName || user.full_name],
                    ['Phone', phone || user.phone_number],
                    ['Facebook', facebook || user.facebook_page || 'â€”'],
                    ['Primary WhatsApp', wa1 || 'â€”'],
                    ['Photo', previewPhoto ? 'Uploaded âœ“' : 'No photo'],
                    ['Your Page URL', publicLink || 'â€”'],
                  ] as [string, string][]).map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', gap: 16, padding: '12px 0', borderTop: '1px solid rgba(0,13,16,0.07)' }}>
                      <div style={{ fontSize: 11, letterSpacing: '0.15em', color: '#8e8e95', fontWeight: 700, textTransform: 'uppercase', width: 120, flexShrink: 0 }}>{label}</div>
                      <div style={{ fontSize: 14, color: '#000d10', fontWeight: 600, wordBreak: 'break-all' }}>{val}</div>
                    </div>
                  ))}
                </div>
                {msg && (
                  <div style={{ padding: '14px 20px', background: saved ? '#f0fdf4' : '#fef2f2', border: `1px solid ${saved ? '#bbf7d0' : '#fecaca'}`, marginBottom: 24, fontSize: 14, color: saved ? '#15803d' : '#dc2626', fontWeight: 600 }}>{msg}</div>
                )}
                {saved && publicLink && (
                  <div style={{ padding: '16px 20px', background: 'white', border: '1px solid rgba(0,13,16,0.1)', marginBottom: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#8e8e95', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Your Live Page</div>
                    <a href={publicLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#bc7155', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {publicLink} <ArrowRight size={14} />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Nav Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 28px', border: '1px solid rgba(0,13,16,0.15)', background: 'transparent', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#000d10', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              {step < 3 ? (
                <button onClick={() => setStep(step + 1)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 28px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Next <ArrowRight size={14} />
                </button>
              ) : (
                <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '14px 28px', background: saved ? '#16a34a' : '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: saving ? 0.6 : 1 }}>
                  {saving ? <LoaderCircle size={14} style={{ animation: 'spin 1s linear infinite' }} /> : saved ? <Check size={14} /> : null}
                  {saving ? 'Publishing...' : saved ? 'Published!' : 'Publish Digital ID'}
                </button>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.25em', color: '#8e8e95', fontWeight: 700, textTransform: 'uppercase', marginBottom: 24 }}>Live Preview</div>
            <div style={{ border: '1px solid rgba(0,13,16,0.1)', background: '#0f0f1c', padding: 32 }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 32 }}>
                <div style={{ width: 80, height: 80, flexShrink: 0, background: '#151623', border: '2px solid rgba(188,113,85,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {previewPhoto ? <img src={previewPhoto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>{initials}</span>}
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 6 }}>{fullName || user.full_name}</div>
                  <div style={{ fontSize: 12, color: '#d5d3d4', fontWeight: 500 }}>{user.role === 'TEAM_MEMBER' ? 'Staff Representative' : 'Brand Ambassador'} Â· Shining Overseas</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {wa1 && <div style={{ padding: '8px 16px', background: '#25d366', color: 'white', borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>WHATSAPP</div>}
                {facebook && <div style={{ padding: '8px 16px', background: '#1877f2', color: 'white', borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>FACEBOOK</div>}
              </div>
              <div style={{ background: 'white', padding: 20 }}>
                <div style={{ fontSize: 11, color: '#bc7155', fontWeight: 700, letterSpacing: '0.2em', marginBottom: 8 }}>SEND ENQUIRY</div>
                <div style={{ fontSize: 14, color: '#000d10', fontWeight: 700 }}>Book a consultation.</div>
              </div>
            </div>
            {publicLink && (
              <div style={{ marginTop: 16, padding: 16, background: '#f8f8f9', border: '1px solid rgba(0,13,16,0.1)' }}>
                <div style={{ fontSize: 11, color: '#8e8e95', fontWeight: 600, marginBottom: 6 }}>YOUR LIVE LINK</div>
                <a href={publicLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#bc7155', fontWeight: 700, textDecoration: 'none', wordBreak: 'break-all' }}>{publicLink}</a>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
