'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Plus, X, Check, LoaderCircle, Pencil, Trash2, ToggleLeft, ToggleRight, ArrowRight, LogOut, Copy, CheckCheck, RefreshCw } from 'lucide-react';

interface User { id: string; email: string; role: string; full_name: string; phone_number: string; referral_code: string; status: string; tier: string; facebook_page: string }

const TABS = [
  ['circulars', 'Circulars'],
  ['flights', 'Flights'],
  ['awards', 'Awards'],
  ['testimonials', 'Testimonials'],
  ['accounts', 'Accounts'],
  ['digital_id', 'Digital ID'],
  ['site_settings', 'Site Settings'],
];

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={onClose}>
      <div style={{ background: 'white', width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', padding: 40 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(0,13,16,0.1)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#000d10' }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8e8e95' }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = 'text', placeholder = '' }: { label: string; name: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>{label}</label>
      {type === 'textarea' ? (
        <textarea name={name} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          style={{ width: '100%', padding: '10px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 14, color: '#000d10', fontWeight: 500, resize: 'vertical', boxSizing: 'border-box' }} />
      ) : (
        <input type={type} name={name} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: '100%', padding: '10px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 14, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
      )}
    </div>
  );
}

export default function SiteAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('circulars');
  const [circulars, setCirculars] = useState<Record<string, unknown>[]>([]);
  const [flights, setFlights] = useState<Record<string, unknown>[]>([]);
  const [awards, setAwards] = useState<Record<string, unknown>[]>([]);
  const [testimonials, setTestimonials] = useState<Record<string, unknown>[]>([]);
  const [accounts, setAccounts] = useState<Record<string, unknown>[]>([]);
  const [digitalIds, setDigitalIds] = useState<Record<string, unknown>[]>([]);
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [leads, setLeads] = useState<Record<string, unknown>[]>([]);
  const [teamOptions, setTeamOptions] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ type: string; data?: Record<string, unknown> } | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [formMsg, setFormMsg] = useState('');
  const [copied, setCopied] = useState('');
  const [settingsSaveMsg, setSettingsSaveMsg] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('so_user');
    if (!stored) { router.replace('/login'); return; }
    try {
      const u = JSON.parse(stored);
      if (u.role !== 'ADMIN') { router.replace('/portal'); return; }
      setUser(u);
    } catch { router.replace('/login'); }
  }, [router]);

  const loadTab = useCallback(async (tab: string) => {
    setLoading(true);
    try {
      if (tab === 'circulars') { const d = await fetch('/api/circulars').then(r => r.json()); setCirculars(Array.isArray(d) ? d : []); }
      if (tab === 'flights') { const d = await fetch('/api/flights').then(r => r.json()); setFlights(Array.isArray(d) ? d : []); }
      if (tab === 'awards') { const d = await fetch('/api/awards').then(r => r.json()); setAwards(Array.isArray(d) ? d : []); }
      if (tab === 'testimonials') { const d = await fetch('/api/testimonials').then(r => r.json()); setTestimonials(Array.isArray(d) ? d : []); }
      if (tab === 'accounts') {
        const [accs, teams, leds] = await Promise.all([
          fetch('/api/accounts').then(r => r.json()),
          fetch('/api/accounts?teamOptions=true').then(r => r.json()),
          fetch('/api/leads').then(r => r.json()),
        ]);
        setAccounts(Array.isArray(accs) ? accs : []);
        setTeamOptions(Array.isArray(teams) ? teams : []);
        setLeads(Array.isArray(leds) ? leds : []);
      }
      if (tab === 'digital_id') { const d = await fetch('/api/digital-id').then(r => r.json()); setDigitalIds(Array.isArray(d) ? d : []); }
      if (tab === 'site_settings') { const d = await fetch('/api/site-settings').then(r => r.json()); setSiteSettings(d || {}); }
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { if (user) loadTab(activeTab); }, [user, activeTab, loadTab]);

  const handleLogout = () => { localStorage.removeItem('so_user'); router.replace('/'); };
  const handleCopy = (text: string, key: string) => { navigator.clipboard.writeText(text).then(() => { setCopied(key); setTimeout(() => setCopied(''), 2000); }); };

  const openModal = (type: string, data?: Record<string, unknown>) => {
    setForm(data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v ?? '')])) : {});
    setFormMsg(''); setModal({ type, data });
  };

  const closeModal = () => { setModal(null); setFormMsg(''); };

  const handleFormSubmit = async () => {
    if (!modal) return;
    setFormMsg('Saving...');
    let url = '', body: Record<string, unknown> = {};
    const { type } = modal;
    const id = (modal.data as Record<string, unknown>)?.id as string || '';

    if (type === 'circular') {
      url = '/api/circulars'; body = { id, country: form.country, flag: form.flag, title: form.title, salary: form.salary, requirements: form.requirements, is_active: form.is_active === 'true' || form.is_active === 'on' };
    } else if (type === 'flight') {
      url = '/api/flights'; body = { id, group_name: form.group_name, role: form.role, origin: form.origin, destination: form.destination, route: form.route, flight_date: form.flight_date };
    } else if (type === 'award') {
      url = '/api/awards'; body = { id, title: form.title, issuer: form.issuer, year: form.year, description: form.description, image_url: form.image_url || '', sort_order: form.sort_order || '0' };
    } else if (type === 'testimonial') {
      url = '/api/testimonials'; body = { id, quote: form.quote, name: form.name, role: form.role, country: form.country, image_url: form.image_url || '', is_featured: form.is_featured === 'true' };
    } else if (type === 'account') {
      url = '/api/accounts'; body = { email: form.email, full_name: form.full_name, role: form.role, temp_password: form.temp_password, assigned_to: form.assigned_to || '' };
    } else if (type === 'transfer_lead') {
      url = '/api/leads'; body = { action: 'transfer', lead_id: form.lead_id, new_owner_id: form.new_owner_id, new_owner_name: teamOptions.find((t: Record<string, unknown>) => t.id === form.new_owner_id)?.full_name || '' };
    }

    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.ok || data.temp_password) {
        let msg = 'Saved!';
        if (data.temp_password) msg = `Account created! Temp password: ${data.temp_password}`;
        setFormMsg(msg);
        await loadTab(activeTab);
        setTimeout(() => closeModal(), data.temp_password ? 5000 : 1500);
      } else setFormMsg(data.msg || 'Error saving.');
    } catch { setFormMsg('Network error.'); }
  };

  const handleDelete = async (tab: string, id: string, extra?: Record<string, unknown>) => {
    if (!confirm('Are you sure?')) return;
    try {
      if (tab === 'circulars') await fetch('/api/circulars', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      else if (tab === 'flights') await fetch('/api/flights', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      else if (tab === 'awards') await fetch('/api/awards', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      else if (tab === 'testimonials') await fetch('/api/testimonials', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      else if (tab === 'accounts') await fetch('/api/accounts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      await loadTab(activeTab);
    } catch {}
  };

  const handleToggle = async (tab: string, id: string, field: string, current: unknown) => {
    try {
      if (tab === 'circulars') await fetch('/api/circulars', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, toggleActive: true, value: !current }) });
      else if (tab === 'testimonials') await fetch('/api/testimonials', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, toggleFeatured: true, value: !current }) });
      else if (tab === 'digital_id') await fetch('/api/digital-id', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggle_active', id, value: !current }) });
      await loadTab(activeTab);
    } catch {}
  };

  const handleResetPassword = async (id: string) => {
    try {
      const res = await fetch('/api/accounts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, resetPassword: true }) });
      const data = await res.json();
      if (data.ok) alert(`Password reset! Temp password: ${data.temp_password}`);
    } catch {}
  };

  const handleSaveSettings = async () => {
    setSettingsSaveMsg('Saving...');
    try {
      const res = await fetch('/api/site-settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteSettings) });
      const data = await res.json();
      setSettingsSaveMsg(data.ok ? 'Saved!' : 'Error saving.'); setTimeout(() => setSettingsSaveMsg(''), 2000);
    } catch { setSettingsSaveMsg('Error.'); }
  };

  const handleConvertLead = async (leadId: string) => {
    try { await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'convert', lead_id: leadId }) }); await loadTab(activeTab); } catch {}
  };

  const ActionBtn = ({ onClick, icon: Icon, label, variant = 'default' }: { onClick: () => void; icon: React.ElementType; label: string; variant?: string }) => (
    <button onClick={onClick} title={label} style={{ padding: '6px 10px', background: variant === 'danger' ? '#fef2f2' : 'transparent', border: `1px solid ${variant === 'danger' ? '#fecaca' : 'rgba(0,13,16,0.1)'}`, borderRadius: 6, cursor: 'pointer', color: variant === 'danger' ? '#dc2626' : '#000d10', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}>
      <Icon size={12} />{label}
    </button>
  );

  const tableHeader = (cols: string[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 12, padding: '12px 24px', background: '#f8f8f9', borderBottom: '1px solid rgba(0,13,16,0.08)' }}>
      {cols.map(c => <div key={c} style={{ fontSize: 10, letterSpacing: '0.2em', fontWeight: 700, color: '#8e8e95', textTransform: 'uppercase' }}>{c}</div>)}
    </div>
  );

  if (!user) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoaderCircle size={32} color="#bc7155" style={{ animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <main style={{ fontFamily: "'Inter', sans-serif", background: '#f8f8f9', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid rgba(0,13,16,0.08)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1280, margin: '0 auto', padding: '16px 24px' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <Plane size={16} color="#bc7155" />
            <span style={{ fontWeight: 700, color: '#000d10', fontSize: 16 }}>SHINING</span>
            <span style={{ fontWeight: 300, color: '#000d10', letterSpacing: '0.2em', fontSize: 11, marginLeft: 4 }}>OVERSEAS</span>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#000d10' }}>{user.full_name}</div>
              <div style={{ fontSize: 11, color: '#8e8e95', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Site Admin</div>
            </div>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid rgba(0,13,16,0.15)', background: 'transparent', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#000d10', letterSpacing: '0.08em' }}>
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Banner */}
      <section style={{ background: '#0f0f1c' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 64px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 24 }}>
            <span style={{ color: '#bc7155', marginRight: 8, fontSize: 8 }}>●</span>
            <span style={{ fontSize: 11, letterSpacing: '0.25em', color: 'white', fontWeight: 700 }}>ADMIN PANEL</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,56px)', fontWeight: 700, color: 'white', lineHeight: 1.05, letterSpacing: '-0.03em' }}>Site Control Centre</h1>
          <p style={{ fontSize: 16, color: '#d5d3d4', marginTop: 16, fontWeight: 500 }}>Manage all content, accounts, and settings from here.</p>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(0,13,16,0.1)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', overflowX: 'auto' }}>
          {TABS.map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={{ padding: '20px 20px', background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === key ? '#000d10' : 'transparent'}`, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: activeTab === key ? '#000d10' : '#8e8e95', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '40px 24px 96px' }}>

        {/* ── CIRCULARS ── */}
        {activeTab === 'circulars' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>Circulars ({circulars.length})</div>
              <button onClick={() => openModal('circular')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}><Plus size={14} /> Add Circular</button>
            </div>
            <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)' }}>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><LoaderCircle size={24} color="#bc7155" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div> :
                circulars.map((c, i) => (
                  <div key={c.id as string} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 200 }}>
                      <span style={{ fontSize: 24 }}>{c.flag as string}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10' }}>{c.title as string}</div>
                        <div style={{ fontSize: 12, color: '#8e8e95', marginTop: 2, fontWeight: 500 }}>{c.country as string} · {c.salary as string}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => handleToggle('circulars', c.id as string, 'is_active', c.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.is_active ? '#16a34a' : '#8e8e95', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                        {c.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />} {c.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                      <ActionBtn onClick={() => openModal('circular', c)} icon={Pencil} label="Edit" />
                      <ActionBtn onClick={() => handleDelete('circulars', c.id as string)} icon={Trash2} label="Delete" variant="danger" />
                    </div>
                  </div>
                ))
              }
              {!loading && circulars.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#8e8e95', fontSize: 14 }}>No circulars yet.</div>}
            </div>
          </div>
        )}

        {/* ── FLIGHTS ── */}
        {activeTab === 'flights' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>Recent Flights ({flights.length})</div>
              <button onClick={() => openModal('flight')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}><Plus size={14} /> Add Flight</button>
            </div>
            <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)' }}>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><LoaderCircle size={24} color="#bc7155" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div> :
                flights.map((f, i) => (
                  <div key={f.id as string} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10' }}>{f.origin as string} → {f.destination as string} · {f.flight_date as string}</div>
                      <div style={{ fontSize: 12, color: '#8e8e95', marginTop: 2, fontWeight: 500 }}>{f.group_name as string} · {f.role as string}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <ActionBtn onClick={() => openModal('flight', f)} icon={Pencil} label="Edit" />
                      <ActionBtn onClick={() => handleDelete('flights', f.id as string)} icon={Trash2} label="Delete" variant="danger" />
                    </div>
                  </div>
                ))
              }
              {!loading && flights.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#8e8e95', fontSize: 14 }}>No flights yet.</div>}
            </div>
          </div>
        )}

        {/* ── AWARDS ── */}
        {activeTab === 'awards' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>Awards ({awards.length})</div>
              <button onClick={() => openModal('award')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}><Plus size={14} /> Add Award</button>
            </div>
            <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)' }}>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><LoaderCircle size={24} color="#bc7155" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div> :
                awards.map((a, i) => (
                  <div key={a.id as string} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10' }}>{a.title as string} <span style={{ color: '#bc7155', fontWeight: 500 }}>· {a.year as string}</span></div>
                      <div style={{ fontSize: 12, color: '#8e8e95', marginTop: 2, fontWeight: 500 }}>{a.issuer as string}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <ActionBtn onClick={() => openModal('award', a)} icon={Pencil} label="Edit" />
                      <ActionBtn onClick={() => handleDelete('awards', a.id as string)} icon={Trash2} label="Delete" variant="danger" />
                    </div>
                  </div>
                ))
              }
              {!loading && awards.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#8e8e95', fontSize: 14 }}>No awards yet.</div>}
            </div>
          </div>
        )}

        {/* ── TESTIMONIALS ── */}
        {activeTab === 'testimonials' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>Testimonials ({testimonials.length})</div>
              <button onClick={() => openModal('testimonial')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}><Plus size={14} /> Add Testimonial</button>
            </div>
            <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)' }}>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><LoaderCircle size={24} color="#bc7155" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div> :
                testimonials.map((t, i) => (
                  <div key={t.id as string} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10' }}>{t.name as string} <span style={{ color: '#8e8e95', fontWeight: 500 }}>· {t.country as string}</span></div>
                      <div style={{ fontSize: 12, color: '#8e8e95', marginTop: 2, fontWeight: 500, maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>&ldquo;{t.quote as string}&rdquo;</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => handleToggle('testimonials', t.id as string, 'is_featured', t.is_featured)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.is_featured ? '#16a34a' : '#8e8e95', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                        {t.is_featured ? <ToggleRight size={18} /> : <ToggleLeft size={18} />} {t.is_featured ? 'FEATURED' : 'HIDDEN'}
                      </button>
                      <ActionBtn onClick={() => openModal('testimonial', t)} icon={Pencil} label="Edit" />
                      <ActionBtn onClick={() => handleDelete('testimonials', t.id as string)} icon={Trash2} label="Delete" variant="danger" />
                    </div>
                  </div>
                ))
              }
              {!loading && testimonials.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#8e8e95', fontSize: 14 }}>No testimonials yet.</div>}
            </div>
          </div>
        )}

        {/* ── ACCOUNTS ── */}
        {activeTab === 'accounts' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>Accounts ({accounts.length})</div>
              <button onClick={() => openModal('account')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}><Plus size={14} /> Create Account</button>
            </div>
            <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)', marginBottom: 40 }}>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><LoaderCircle size={24} color="#bc7155" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div> :
                accounts.map((a, i) => (
                  <div key={a.id as string} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10' }}>{a.full_name as string}</div>
                      <div style={{ fontSize: 12, color: '#8e8e95', marginTop: 2, fontWeight: 500 }}>{a.email as string} · <span style={{ fontWeight: 700, color: a.role === 'TEAM_MEMBER' ? '#1d4ed8' : '#7c3aed' }}>{a.role as string}</span></div>
                      {Boolean(a.referral_code) && <div style={{ fontSize: 11, color: '#bc7155', marginTop: 4, fontWeight: 600 }}>Code: {String(a.referral_code)}</div>}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <span style={{ fontSize: 10, padding: '4px 10px', background: (a.status as string) === 'ACTIVE' ? '#f0fdf4' : '#f1f5f9', color: (a.status as string) === 'ACTIVE' ? '#16a34a' : '#64748b', fontWeight: 700, borderRadius: 9999, textTransform: 'uppercase' }}>{a.status as string}</span>
                      <ActionBtn onClick={() => handleResetPassword(a.id as string)} icon={RefreshCw} label="Reset PW" />
                      <ActionBtn onClick={() => handleDelete('accounts', a.id as string)} icon={Trash2} label="Delete" variant="danger" />
                    </div>
                  </div>
                ))
              }
              {!loading && accounts.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#8e8e95', fontSize: 14 }}>No accounts yet.</div>}
            </div>

            {/* Leads Section */}
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 24 }}>All Leads ({leads.length})</div>
              <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)' }}>
                {leads.map((l, i) => (
                  <div key={l.id as string} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ padding: '3px 8px', borderRadius: 9999, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', background: l.is_hot ? '#fef3c7' : '#f1f5f9', color: l.is_hot ? '#92400e' : '#64748b', textTransform: 'uppercase' }}>{l.is_hot ? '🔥 HOT' : 'COLD'}</span>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#000d10' }}>{l.name as string || '—'}</div>
                      </div>
                      <div style={{ fontSize: 11, color: '#8e8e95', fontWeight: 500 }}>{l.phone as string} · Owner: {l.owner as string} · {l.country as string}</div>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, padding: '3px 8px', background: (l.status as string) === 'DEPLOYED' ? '#f0fdf4' : '#f8f8f9', color: (l.status as string) === 'DEPLOYED' ? '#16a34a' : '#8e8e95', fontWeight: 700, borderRadius: 9999, textTransform: 'uppercase' }}>{l.status as string}</span>
                      {(l.status as string) !== 'DEPLOYED' && <ActionBtn onClick={() => handleConvertLead(l.id as string)} icon={Check} label="Convert" />}
                      {teamOptions.length > 0 && <ActionBtn onClick={() => openModal('transfer_lead', { lead_id: l.id as string, lead_name: l.name as string })} icon={ArrowRight} label="Transfer" />}
                      <button onClick={() => handleCopy(l.phone as string, l.id as string)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === l.id ? '#16a34a' : '#8e8e95' }}>
                        {copied === l.id as string ? <CheckCheck size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
                {leads.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#8e8e95', fontSize: 14 }}>No leads yet.</div>}
              </div>
            </div>
          </div>
        )}

        {/* ── DIGITAL ID ── */}
        {activeTab === 'digital_id' && (
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 24 }}>Digital ID Pages ({digitalIds.length})</div>
            <div style={{ background: 'white', border: '1px solid rgba(0,13,16,0.1)' }}>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><LoaderCircle size={24} color="#bc7155" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div> :
                digitalIds.map((d, i) => {
                  const link = `/p/${d.slug as string}`;
                  return (
                    <div key={d.id as string} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '20px 24px', borderTop: i > 0 ? '1px solid rgba(0,13,16,0.07)' : 'none' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#000d10' }}>{d.name as string}</div>
                        <div style={{ fontSize: 12, color: '#8e8e95', marginTop: 2, fontWeight: 500 }}>{d.specialty as string} · Code: {d.slug as string}</div>
                        <div style={{ fontSize: 11, color: '#bc7155', marginTop: 4, fontWeight: 500 }}>{link}</div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        <button onClick={() => handleToggle('digital_id', d.id as string, 'is_active', d.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: d.is_active ? '#16a34a' : '#8e8e95', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                          {d.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />} {d.is_active ? 'ACTIVE' : 'OFF'}
                        </button>
                        <button onClick={() => handleCopy(`${typeof window !== 'undefined' ? window.location.origin : ''}${link}`, `did_${d.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === `did_${d.id}` ? '#16a34a' : '#8e8e95', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600 }}>
                          {copied === `did_${d.id}` ? <CheckCheck size={14} /> : <Copy size={14} />} Copy Link
                        </button>
                        <a href={link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#000d10', textDecoration: 'none', padding: '6px 10px', border: '1px solid rgba(0,13,16,0.1)', borderRadius: 6 }}>
                          <ArrowRight size={12} /> View
                        </a>
                      </div>
                    </div>
                  );
                })
              }
              {!loading && digitalIds.length === 0 && <div style={{ padding: '48px', textAlign: 'center', color: '#8e8e95', fontSize: 14 }}>No digital ID pages yet. Create accounts to generate pages.</div>}
            </div>
          </div>
        )}

        {/* ── SITE SETTINGS ── */}
        {activeTab === 'site_settings' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase' }}>Site Settings</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {settingsSaveMsg && <span style={{ fontSize: 13, color: settingsSaveMsg === 'Saved!' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{settingsSaveMsg}</span>}
                <button onClick={handleSaveSettings} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}><Check size={14} /> Save All</button>
              </div>
            </div>
            <div style={{ background: 'white', padding: 32, border: '1px solid rgba(0,13,16,0.1)' }}>
              {loading ? <div style={{ padding: 40, textAlign: 'center' }}><LoaderCircle size={24} color="#bc7155" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 380px), 1fr))', gap: '0 40px' }}>
                  {Object.entries(siteSettings).map(([key, val]) => (
                    <div key={key} style={{ marginBottom: 24 }}>
                      <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.2em', color: '#8e8e95', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>{key.replace(/_/g, ' ')}</label>
                      <input type="text" value={val} onChange={e => setSiteSettings(prev => ({ ...prev, [key]: e.target.value }))} style={{ width: '100%', padding: '8px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.12)', background: 'transparent', fontSize: 13, color: '#000d10', fontWeight: 500, boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── MODALS ── */}
      {modal?.type === 'circular' && (
        <Modal title={modal.data ? 'Edit Circular' : 'Add Circular'} onClose={closeModal}>
          <Field label="Country" name="country" value={form.country || ''} onChange={v => setForm(p => ({ ...p, country: v }))} placeholder="e.g. Saudi Arabia" />
          <Field label="Flag Emoji" name="flag" value={form.flag || ''} onChange={v => setForm(p => ({ ...p, flag: v }))} placeholder="🇸🇦" />
          <Field label="Job Title" name="title" value={form.title || ''} onChange={v => setForm(p => ({ ...p, title: v }))} placeholder="e.g. Construction Worker" />
          <Field label="Salary" name="salary" value={form.salary || ''} onChange={v => setForm(p => ({ ...p, salary: v }))} placeholder="e.g. SAR 1,200/mo" />
          <Field label="Requirements" name="requirements" value={form.requirements || ''} onChange={v => setForm(p => ({ ...p, requirements: v }))} type="textarea" placeholder="Requirements and notes..." />
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="checkbox" id="is_active" checked={form.is_active === 'true'} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked ? 'true' : 'false' }))} />
            <label htmlFor="is_active" style={{ fontSize: 13, fontWeight: 600, color: '#000d10' }}>Show on homepage (Active)</label>
          </div>
          {formMsg && <div style={{ padding: '10px 16px', background: formMsg.includes('Error') ? '#fef2f2' : '#f0fdf4', border: '1px solid', borderColor: formMsg.includes('Error') ? '#fecaca' : '#bbf7d0', marginBottom: 20, fontSize: 13, color: formMsg.includes('Error') ? '#dc2626' : '#15803d', fontWeight: 500 }}>{formMsg}</div>}
          <button onClick={handleFormSubmit} style={{ width: '100%', padding: '14px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Save Circular</button>
        </Modal>
      )}
      {modal?.type === 'flight' && (
        <Modal title={modal.data ? 'Edit Flight' : 'Add Flight'} onClose={closeModal}>
          <Field label="Group Name" name="group_name" value={form.group_name || ''} onChange={v => setForm(p => ({ ...p, group_name: v }))} placeholder="e.g. Group 47" />
          <Field label="Job Role" name="role" value={form.role || ''} onChange={v => setForm(p => ({ ...p, role: v }))} placeholder="e.g. Welding Technician" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Origin (IATA)" name="origin" value={form.origin || ''} onChange={v => setForm(p => ({ ...p, origin: v }))} placeholder="DAC" />
            <Field label="Destination (IATA)" name="destination" value={form.destination || ''} onChange={v => setForm(p => ({ ...p, destination: v }))} placeholder="RUH" />
          </div>
          <Field label="Route" name="route" value={form.route || ''} onChange={v => setForm(p => ({ ...p, route: v }))} placeholder="e.g. Dhaka → Riyadh via Dubai" />
          <Field label="Flight Date" name="flight_date" value={form.flight_date || ''} onChange={v => setForm(p => ({ ...p, flight_date: v }))} type="date" />
          {formMsg && <div style={{ padding: '10px 16px', background: formMsg.includes('Error') ? '#fef2f2' : '#f0fdf4', border: '1px solid', borderColor: formMsg.includes('Error') ? '#fecaca' : '#bbf7d0', marginBottom: 20, fontSize: 13, color: formMsg.includes('Error') ? '#dc2626' : '#15803d', fontWeight: 500 }}>{formMsg}</div>}
          <button onClick={handleFormSubmit} style={{ width: '100%', padding: '14px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Save Flight</button>
        </Modal>
      )}
      {modal?.type === 'award' && (
        <Modal title={modal.data ? 'Edit Award' : 'Add Award'} onClose={closeModal}>
          <Field label="Award Title" name="title" value={form.title || ''} onChange={v => setForm(p => ({ ...p, title: v }))} placeholder="e.g. Best Recruitment Agency" />
          <Field label="Issuer" name="issuer" value={form.issuer || ''} onChange={v => setForm(p => ({ ...p, issuer: v }))} placeholder="e.g. BAIRA" />
          <Field label="Year" name="year" value={form.year || ''} onChange={v => setForm(p => ({ ...p, year: v }))} placeholder="e.g. 2023" />
          <Field label="Description" name="description" value={form.description || ''} onChange={v => setForm(p => ({ ...p, description: v }))} type="textarea" placeholder="Brief description..." />
          <Field label="Sort Order" name="sort_order" value={form.sort_order || '0'} onChange={v => setForm(p => ({ ...p, sort_order: v }))} type="number" placeholder="0" />
          {formMsg && <div style={{ padding: '10px 16px', background: formMsg.includes('Error') ? '#fef2f2' : '#f0fdf4', border: '1px solid', borderColor: formMsg.includes('Error') ? '#fecaca' : '#bbf7d0', marginBottom: 20, fontSize: 13, color: formMsg.includes('Error') ? '#dc2626' : '#15803d', fontWeight: 500 }}>{formMsg}</div>}
          <button onClick={handleFormSubmit} style={{ width: '100%', padding: '14px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Save Award</button>
        </Modal>
      )}
      {modal?.type === 'testimonial' && (
        <Modal title={modal.data ? 'Edit Testimonial' : 'Add Testimonial'} onClose={closeModal}>
          <Field label="Quote" name="quote" value={form.quote || ''} onChange={v => setForm(p => ({ ...p, quote: v }))} type="textarea" placeholder="Worker's testimonial..." />
          <Field label="Name" name="name" value={form.name || ''} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Full name" />
          <Field label="Role / Job" name="role" value={form.role || ''} onChange={v => setForm(p => ({ ...p, role: v }))} placeholder="e.g. Electrician" />
          <Field label="Country" name="country" value={form.country || ''} onChange={v => setForm(p => ({ ...p, country: v }))} placeholder="e.g. Saudi Arabia" />
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="checkbox" id="is_featured" checked={form.is_featured === 'true'} onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked ? 'true' : 'false' }))} />
            <label htmlFor="is_featured" style={{ fontSize: 13, fontWeight: 600, color: '#000d10' }}>Featured (show on homepage)</label>
          </div>
          {formMsg && <div style={{ padding: '10px 16px', background: formMsg.includes('Error') ? '#fef2f2' : '#f0fdf4', border: '1px solid', borderColor: formMsg.includes('Error') ? '#fecaca' : '#bbf7d0', marginBottom: 20, fontSize: 13, color: formMsg.includes('Error') ? '#dc2626' : '#15803d', fontWeight: 500 }}>{formMsg}</div>}
          <button onClick={handleFormSubmit} style={{ width: '100%', padding: '14px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Save Testimonial</button>
        </Modal>
      )}
      {modal?.type === 'account' && (
        <Modal title="Create Account" onClose={closeModal}>
          <Field label="Full Name" name="full_name" value={form.full_name || ''} onChange={v => setForm(p => ({ ...p, full_name: v }))} placeholder="Full name" />
          <Field label="Email Address" name="email" value={form.email || ''} onChange={v => setForm(p => ({ ...p, email: v }))} type="email" placeholder="email@example.com" />
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Role</label>
            <select value={form.role || 'TEAM_MEMBER'} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{ width: '100%', padding: '10px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 14, color: '#000d10', fontWeight: 500, appearance: 'none' }}>
              <option value="TEAM_MEMBER">Team Member (Staff)</option>
              <option value="INFLUENCER">Influencer (Ambassador)</option>
            </select>
          </div>
          {form.role === 'INFLUENCER' && teamOptions.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Assign to Team Member</label>
              <select value={form.assigned_to || ''} onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))} style={{ width: '100%', padding: '10px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 14, color: '#000d10', fontWeight: 500, appearance: 'none' }}>
                <option value="">— No assignment —</option>
                {teamOptions.map((t: Record<string, unknown>) => <option key={t.id as string} value={t.id as string}>{t.full_name as string}</option>)}
              </select>
            </div>
          )}
          <Field label="Temp Password (optional)" name="temp_password" value={form.temp_password || ''} onChange={v => setForm(p => ({ ...p, temp_password: v }))} placeholder="Leave blank to auto-generate" />
          {formMsg && <div style={{ padding: '10px 16px', background: formMsg.includes('Error') || formMsg.includes('error') ? '#fef2f2' : '#f0fdf4', border: '1px solid', borderColor: formMsg.includes('Error') || formMsg.includes('error') ? '#fecaca' : '#bbf7d0', marginBottom: 20, fontSize: 13, color: formMsg.includes('Error') || formMsg.includes('error') ? '#dc2626' : '#15803d', fontWeight: 500, wordBreak: 'break-all' }}>{formMsg}</div>}
          <button onClick={handleFormSubmit} style={{ width: '100%', padding: '14px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Create Account</button>
        </Modal>
      )}
      {modal?.type === 'transfer_lead' && (
        <Modal title="Transfer Lead" onClose={closeModal}>
          <p style={{ fontSize: 14, color: '#8e8e95', fontWeight: 500, marginBottom: 24 }}>Transfer &ldquo;{form.lead_name}&rdquo; to a team member.</p>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.2em', color: '#000d10', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Transfer To</label>
            <select value={form.new_owner_id || ''} onChange={e => setForm(p => ({ ...p, new_owner_id: e.target.value }))} style={{ width: '100%', padding: '10px 0', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '1px solid rgba(0,13,16,0.15)', background: 'transparent', fontSize: 14, color: '#000d10', fontWeight: 500, appearance: 'none' }}>
              <option value="">— Select team member —</option>
              {teamOptions.map((t: Record<string, unknown>) => <option key={t.id as string} value={t.id as string}>{t.full_name as string}</option>)}
            </select>
          </div>
          {formMsg && <div style={{ padding: '10px 16px', background: formMsg.includes('Error') ? '#fef2f2' : '#f0fdf4', border: '1px solid', borderColor: formMsg.includes('Error') ? '#fecaca' : '#bbf7d0', marginBottom: 20, fontSize: 13, color: formMsg.includes('Error') ? '#dc2626' : '#15803d', fontWeight: 500 }}>{formMsg}</div>}
          <button onClick={handleFormSubmit} style={{ width: '100%', padding: '14px', background: '#000d10', color: 'white', border: 'none', borderRadius: 9999, cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Transfer Lead</button>
        </Modal>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </main>
  );
}
